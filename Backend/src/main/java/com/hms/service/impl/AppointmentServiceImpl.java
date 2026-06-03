package com.hms.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.StringJoiner;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Request.UpdateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.config.KafkaConfig;
import com.hms.dto.DepartmentDto;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.Branch;
import com.hms.entity.Admin;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.RoleType;
import com.hms.event.AppointmentNotificationEvent;
import com.hms.event.AppointmentNotificationType;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.AdminRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.PrescriptionRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.service.AppointmentService;
import com.hms.service.helper.PatientProfileRules;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private static final long APPOINTMENT_SLOT_MINUTES = 20;
    private static final int MAX_ADVANCE_DAYS = 30;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final KafkaConfig kafkaConfig;
    private final KafkaTemplate<String, com.hms.event.AppointmentKafkaEvent> kafkaTemplate;

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "patientAppointments", allEntries = true),
        @CacheEvict(value = "doctorAppointments", allEntries = true),
        @CacheEvict(value = "recentAdminAppointments", allEntries = true),
        @CacheEvict(value = "bookedSlots", allEntries = true)
    })
    public AppointmentResponseDto createConfirmedAppointment(CreateAppointmentRequestDto createAppointmentRequestDto) {
        Long doctorId = createAppointmentRequestDto.getDoctorId();
        Long patientId = createAppointmentRequestDto.getPatientId();

        validateWithinWorkingHours(createAppointmentRequestDto.getAppointmentTime());
        validateSlotBoundary(createAppointmentRequestDto.getAppointmentTime());
        validateFutureBookingWindow(createAppointmentRequestDto.getAppointmentTime());

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + patientId));
        
        // Validate that patient profile is complete
        if (!PatientProfileRules.isProfileComplete(patient)) {
            throw new ValidationException("Please complete your patient profile (birthDate, gender, bloodGroup) to book an appointment.");
        }
        
        Doctor doctor = doctorRepository.findByIdForUpdate(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + doctorId));

        if (isSlotTaken(doctor, createAppointmentRequestDto.getAppointmentTime())) {
            throw new ValidationException("Selected time slot is already confirmed by another patient.");
        }

        // Determine the branch: use branchId from request if provided, otherwise fallback to doctor's branch
        final Branch branchToUse;
        if (createAppointmentRequestDto.getBranchId() != null) {
            branchToUse = branchRepository.findById(createAppointmentRequestDto.getBranchId())
                    .orElseThrow(() -> new EntityNotFoundException("Branch not found with ID: " + createAppointmentRequestDto.getBranchId()));
        } else {
            branchToUse = doctor.getBranch();
        }

        final com.hms.entity.Department departmentToUse;
        if (createAppointmentRequestDto.getDepartmentId() != null) {
            departmentToUse = departmentRepository.findById(createAppointmentRequestDto.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with ID: " + createAppointmentRequestDto.getDepartmentId()));
        } else {
            departmentToUse = null;
        }

        Appointment appointment = Appointment.builder()
                .reason(createAppointmentRequestDto.getReason())
                .appointmentTime(createAppointmentRequestDto.getAppointmentTime())
                .status(AppointmentStatusType.CONFIRMED)
                .confirmedAt(LocalDateTime.now())
                .patient(patient)
                .doctor(doctor)
                .branch(branchToUse)
                .department(departmentToUse)
                .amount(doctor.getConsultationFee())
                .appointmentId(createAppointmentRequestDto.getAppointmentId()) // Use provided ID if present
                .build();

        // Update branch_patients join table
        if (branchToUse != null) {
            if (branchToUse.getPatients() == null) {
                branchToUse.setPatients(new ArrayList<>());
            }
            
            boolean alreadyAssociated = branchToUse.getPatients().stream()
                    .anyMatch(p -> p.getId().equals(patient.getId()));
            
            if (!alreadyAssociated) {
                branchToUse.getPatients().add(patient);
                if (patient.getBranches() == null) {
                    patient.setBranches(new ArrayList<>());
                }
                boolean branchInPatientList = patient.getBranches().stream()
                        .anyMatch(b -> b.getId().equals(branchToUse.getId()));
                if (!branchInPatientList) {
                    patient.getBranches().add(branchToUse);
                }
            }
            // Explicitly save the branch to ensure many-to-many relationship is updated
            branchRepository.save(branchToUse);
        }

        // Update department_patient join table with race-safe dedupe
        if (departmentToUse != null) {
            boolean alreadyAssociatedWithDepartment = departmentRepository
                    .existsDepartmentPatientLink(departmentToUse.getId(), patient.getId());
            if (!alreadyAssociatedWithDepartment) {
                try {
                    departmentRepository.insertDepartmentPatientLink(departmentToUse.getId(), patient.getId());
                } catch (DataIntegrityViolationException ex) {
                    // Concurrent inserts can hit unique constraint; treat as already linked.
                }
            }
        }

        appointment = appointmentRepository.save(appointment);
        
        // Publish appointment event to Kafka (async)
        com.hms.event.AppointmentKafkaEvent event = com.hms.event.AppointmentKafkaEvent.builder()
            .eventId(java.util.UUID.randomUUID().toString())
            .eventType(com.hms.event.AppointmentEventType.CONFIRMED)
            .eventTimestamp(java.time.LocalDateTime.now())
            .appointmentId(appointment.getAppointmentId())
            .patientId(patient.getId())
            .doctorId(doctor.getId())
            .appointmentTime(appointment.getAppointmentTime())
            .reason(appointment.getReason())
            .status(appointment.getStatus().name())
            .amount(appointment.getAmount() != null ? Double.valueOf(appointment.getAmount()) : null)
            .branchId(branchToUse != null ? branchToUse.getId() : null)
            .departmentId(departmentToUse != null ? departmentToUse.getId() : null)
            .build();

        
        kafkaTemplate.send(KafkaConfig.APPOINTMENT_CONFIRMED_TOPIC, appointment.getAppointmentId(), event);

        return mapToAppointmentResponseDto(appointment);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "doctorAppointments", allEntries = true),
        @CacheEvict(value = "appointmentDetails", key = "#result.appointmentId", condition = "#result != null"),
        @CacheEvict(value = "bookedSlots", allEntries = true)
    })
    public Appointment reAssignAppointmentToAnotherDoctor(Long appointmentId, Long newDoctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found with id: " + appointmentId));
        Doctor newDoctor = doctorRepository.findById(newDoctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + newDoctorId));

        appointment.setDoctor(newDoctor);

        if (newDoctor.getAppointments() == null) {
            newDoctor.setAppointments(new ArrayList<>());
        }
        newDoctor.getAppointments().add(appointment); // Ensure bidirectional consistency

        Appointment savedAppointment = appointmentRepository.save(appointment);
        eventPublisher.publishEvent(new AppointmentNotificationEvent(
                savedAppointment.getAppointmentId(),
                AppointmentNotificationType.UPDATED,
                "Doctor was changed"));
        return savedAppointment;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
    @Cacheable(value = "doctorAppointments", key = "#doctorId + ':' + #page + ':' + #size")
    public List<AppointmentResponseDto> getAllAppointmentsOfDoctor(Long doctorId, int page, int size) {
        com.hms.entity.User user = (com.hms.entity.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user.getRoles().contains(RoleType.DOCTOR) && !user.getId().equals(doctorId)) {
             if (!user.getRoles().contains(RoleType.ADMIN) && !user.getRoles().contains(RoleType.HEADADMIN)) {
                 throw new AccessDeniedException("You can only view your own appointments");
             }
        }

        var pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return appointmentRepository.findByDoctor_IdOrderByAppointmentTimeDesc(doctorId, pageable)
                .stream()
                .map(this::mapToAppointmentResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('PATIENT')")
    @Cacheable(value = "patientAppointments", key = "#patientId + ':' + #page + ':' + #size")
    public List<AppointmentResponseDto> getAllAppointmentsOfPatient(Long patientId, int page, int size) {
        Long loggedInUserId = getAuthenticatedUserId();
        if (!patientId.equals(loggedInUserId)) {
            throw new AccessDeniedException("You can only view your own appointments");
        }

        var pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return appointmentRepository.findByPatient_IdOrderByAppointmentTimeDesc(patientId, pageable)
                .stream()
                .map(this::mapToAppointmentResponseDto)
                .collect(Collectors.toList());
    }
    @Transactional
    @Override
    @Cacheable(value = "appointmentDetails", key = "#appointmentId")
    public AppointmentResponseDto getAppointmentByAppointmentId(String appointmentId) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found with ID: " + appointmentId));
        return mapToAppointmentResponseDto(appointment);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
    @Caching(evict = {
        @CacheEvict(value = "appointmentDetails", key = "#appointmentId"),
        @CacheEvict(value = "doctorAppointments", allEntries = true),
        @CacheEvict(value = "patientAppointments", allEntries = true),
        @CacheEvict(value = "recentAdminAppointments", allEntries = true),
        @CacheEvict(value = "bookedSlots", allEntries = true)
    })
    public AppointmentResponseDto updateAppointmentStatus(String appointmentId, AppointmentStatusType status) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found with ID: " + appointmentId));

        updateStatusWithActorRules(appointment, status);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        eventPublisher.publishEvent(new AppointmentNotificationEvent(
                savedAppointment.getAppointmentId(),
                AppointmentNotificationType.STATUS_CHANGED,
                null));
        return mapToAppointmentResponseDto(savedAppointment);
    }

    @Override
    @Transactional
    @Secured("ROLE_PATIENT")
    @Caching(evict = {
        @CacheEvict(value = "appointmentDetails", key = "#appointmentId"),
        @CacheEvict(value = "doctorAppointments", allEntries = true),
        @CacheEvict(value = "patientAppointments", allEntries = true),
        @CacheEvict(value = "recentAdminAppointments", allEntries = true),
        @CacheEvict(value = "bookedSlots", allEntries = true)
    })
    public AppointmentResponseDto cancelAppointmentByPatient(String appointmentId) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found with ID: " + appointmentId));

        Long loggedInPatientId = getAuthenticatedUserId();
        if (!appointment.getPatient().getId().equals(loggedInPatientId)) {
            throw new AccessDeniedException("You can only cancel your own appointment");
        }

        appointment.setStatus(AppointmentStatusType.CANCELLED);
        if (appointment.getCancelledAt() == null) {
            appointment.setCancelledAt(LocalDateTime.now());
        }
        Appointment savedAppointment = appointmentRepository.save(appointment);
        eventPublisher.publishEvent(new AppointmentNotificationEvent(
                savedAppointment.getAppointmentId(),
                AppointmentNotificationType.CANCELLED,
                null));
        return mapToAppointmentResponseDto(savedAppointment);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
    @Caching(evict = {
        @CacheEvict(value = "appointmentDetails", key = "#appointmentId"),
        @CacheEvict(value = "doctorAppointments", allEntries = true),
        @CacheEvict(value = "patientAppointments", allEntries = true),
        @CacheEvict(value = "recentAdminAppointments", allEntries = true),
        @CacheEvict(value = "bookedSlots", allEntries = true)
    })
    public AppointmentResponseDto updateAppointment(String appointmentId, UpdateAppointmentRequestDto updateAppointmentRequestDto) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found with ID: " + appointmentId));

        boolean statusChanged = false;
        StringJoiner changeSummary = new StringJoiner(", ");

        if (updateAppointmentRequestDto.getStatus() != null && !updateAppointmentRequestDto.getStatus().equals(appointment.getStatus())) {
            updateStatusWithActorRules(appointment, updateAppointmentRequestDto.getStatus());
            changeSummary.add("Status changed to " + updateAppointmentRequestDto.getStatus());
            statusChanged = true;
        }

        if (changeSummary.length() == 0) {
            throw new IllegalArgumentException("Status change is required to update appointment");
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);

        if (statusChanged) {
            eventPublisher.publishEvent(new AppointmentNotificationEvent(
                    savedAppointment.getAppointmentId(),
                    AppointmentNotificationType.UPDATED,
                    changeSummary.toString()));
        }

        return mapToAppointmentResponseDto(savedAppointment);
    }

    @Override
    @Transactional
    @Cacheable(value = "bookedSlots", key = "#doctorId + ':' + #date")
    public List<LocalDateTime> getBookedSlotsForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + doctorId));
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay().minusNanos(1);
        return appointmentRepository.findByDoctorAndAppointmentTimeBetweenAndStatusNot(
                        doctor, start, end, AppointmentStatusType.CANCELLED)
                .stream()
                .map(Appointment::getAppointmentTime)
                .sorted()
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    @Cacheable(value = "recentAdminAppointments", key = "#root.target.getAuthenticatedUserId() + ':' + #page + ':' + #size")
    public List<AppointmentResponseDto> getRecentAppointmentsForAdmin(int page, int size) {
        Long adminUserId = getAuthenticatedUserId();
        Admin admin = adminRepository.findById(adminUserId)
                .orElseThrow(() -> new NotFoundException("Admin profile not found for user id: " + adminUserId));
        var pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return appointmentRepository.findByBranch_IdOrderByAppointmentTimeDesc(admin.getBranch().getId(), pageable)
                .stream()
                .map(this::mapToAppointmentResponseDto)
                .collect(Collectors.toList());
    }

    private void enforceDoctorCanAccessOwnAppointment(Appointment appointment) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof com.hms.entity.User user)) {
            return;
        }
        if (user.getRoles().contains(RoleType.DOCTOR) && !appointment.getDoctor().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own appointments");
        }
    }

    public Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.hms.entity.User user) {
            return user.getId();
        }
        throw new AccessDeniedException("User authentication is required");
    }

    private com.hms.entity.User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.hms.entity.User user) {
            return user;
        }
        throw new AccessDeniedException("User authentication is required");
    }

    private void updateStatusWithActorRules(Appointment appointment, AppointmentStatusType targetStatus) {
        com.hms.entity.User user = getAuthenticatedUser();
        AppointmentStatusType currentStatus = appointment.getStatus();

        if (currentStatus == targetStatus) {
            throw new ValidationException("Appointment is already in status " + targetStatus);
        }

        if (Arrays.asList(
                AppointmentStatusType.CANCELLED,
                AppointmentStatusType.REFUNDED,
                AppointmentStatusType.COMPLETED,
                AppointmentStatusType.NO_SHOW).contains(currentStatus)) {
            throw new ValidationException("Cannot change status after appointment is " + currentStatus);
        }

        if (user.getRoles().contains(RoleType.DOCTOR)) {
            enforceDoctorCanAccessOwnAppointment(appointment);
            validateDoctorTransition(currentStatus, targetStatus);
        } else if (user.getRoles().contains(RoleType.ADMIN)) {
            enforceAdminBranchAccess(appointment, user.getId());
        } else if (!user.getRoles().contains(RoleType.HEADADMIN)) {
            throw new AccessDeniedException("You are not allowed to update appointment status");
        }

        applyStatusTransition(appointment, targetStatus);
    }

    private void validateDoctorTransition(AppointmentStatusType currentStatus, AppointmentStatusType targetStatus) {
        boolean valid = (currentStatus == AppointmentStatusType.QUEUED && targetStatus == AppointmentStatusType.IN_PROGRESS)
                || (currentStatus == AppointmentStatusType.IN_PROGRESS && targetStatus == AppointmentStatusType.COMPLETED);
        if (!valid) {
            throw new ValidationException("Doctors can only move appointments from QUEUED to IN_PROGRESS or IN_PROGRESS to COMPLETED");
        }
    }

    private void enforceAdminBranchAccess(Appointment appointment, Long adminUserId) {
        Admin admin = adminRepository.findById(adminUserId)
                .orElseThrow(() -> new NotFoundException("Admin profile not found for user id: " + adminUserId));
        if (appointment.getBranch() == null || admin.getBranch() == null
                || !appointment.getBranch().getId().equals(admin.getBranch().getId())) {
            throw new AccessDeniedException("You can only update appointments for your branch");
        }
    }

    private void applyStatusTransition(Appointment appointment, AppointmentStatusType targetStatus) {
        appointment.setStatus(targetStatus);
        LocalDateTime now = LocalDateTime.now();
        switch (targetStatus) {
            case CONFIRMED -> {
                if (appointment.getConfirmedAt() == null) appointment.setConfirmedAt(now);
            }
            case VISITED -> {
                if (appointment.getVisitedAt() == null) appointment.setVisitedAt(now);
            }
            case QUEUED -> {
                if (appointment.getQueuedAt() == null) appointment.setQueuedAt(now);
                if (appointment.getQueueDate() == null) appointment.setQueueDate(now.toLocalDate());
            }
            case IN_PROGRESS -> {
                if (appointment.getInProgressAt() == null) appointment.setInProgressAt(now);
            }
            case COMPLETED -> {
                if (appointment.getCompletedAt() == null) appointment.setCompletedAt(now);
            }
            case NO_SHOW -> {
                if (appointment.getNoShowAt() == null) appointment.setNoShowAt(now);
            }
            case CANCELLED -> {
                if (appointment.getCancelledAt() == null) appointment.setCancelledAt(now);
            }
            case REFUNDED -> {
                if (appointment.getRefundedAt() == null) appointment.setRefundedAt(now);
            }
            default -> {
            }
        }
    }

    private void validateWithinWorkingHours(java.time.LocalDateTime appointmentTime) {
        if (appointmentTime == null) {
            throw new IllegalArgumentException("Appointment time is required");
        }
        LocalTime time = appointmentTime.toLocalTime();
        LocalTime start = LocalTime.of(10, 0);
        LocalTime end = LocalTime.of(19, 0);
        // Allow bookings from 10:00 inclusive to 19:00 exclusive.
        if (time.isBefore(start) || !time.isBefore(end)) {
            throw new IllegalArgumentException("Appointment time must be between 10:00 AM and 7:00 PM (end time exclusive)");
        }
    }

    private void validateSlotBoundary(java.time.LocalDateTime appointmentTime) {
        int minute = appointmentTime.getMinute();
        if (appointmentTime.getSecond() != 0 || appointmentTime.getNano() != 0 || (minute % APPOINTMENT_SLOT_MINUTES) != 0) {
            throw new IllegalArgumentException("Appointment time must be on a 20-minute boundary (e.g., 10:00, 10:20, 10:40)");
        }
    }

    private void validateFutureBookingWindow(java.time.LocalDateTime appointmentTime) {
        if (appointmentTime == null) {
            throw new IllegalArgumentException("Appointment time is required");
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (!appointmentTime.isAfter(now)) {
            throw new IllegalArgumentException("Appointment time must be in the future");
        }
        java.time.LocalDateTime latestAllowed = now.plusDays(MAX_ADVANCE_DAYS);
        if (appointmentTime.isAfter(latestAllowed)) {
            throw new IllegalArgumentException("Appointment time must be within the next " + MAX_ADVANCE_DAYS + " days");
        }
    }

    private boolean isSlotTaken(Doctor doctor, java.time.LocalDateTime appointmentTime) {
        java.time.LocalDateTime start = appointmentTime.minusMinutes(APPOINTMENT_SLOT_MINUTES - 1);
        java.time.LocalDateTime end = appointmentTime.plusMinutes(APPOINTMENT_SLOT_MINUTES - 1);
        return appointmentRepository.existsByDoctorAndAppointmentTimeBetweenAndStatusNot(
                doctor, start, end, AppointmentStatusType.CANCELLED);
    }

    private AppointmentResponseDto mapToAppointmentResponseDto(Appointment appointment) {
        com.hms.entity.Prescription prescription = resolvePrescription(appointment.getAppointmentId());
        return new AppointmentResponseDto(
                appointment.getAppointmentId(),
                appointment.getAppointmentTime(),
                appointment.getReason(),
                appointment.getAmount(),
                mapDoctorResponse(appointment.getDoctor()),
                resolveAppointmentStatus(appointment),
                mapPatientResponse(appointment.getPatient()),
                mapBranchResponse(appointment.getBranch()),
                appointment.getDepartment() != null ? appointment.getDepartment().getId() : null,
                appointment.getDepartment() != null ? appointment.getDepartment().getName() : null,
                appointment.getQueueNumber(),
                appointment.getQueueDate(),
                appointment.getConfirmedAt(),
                appointment.getVisitedAt(),
                appointment.getQueuedAt(),
                appointment.getInProgressAt(),
                appointment.getCompletedAt(),
                appointment.getNoShowAt(),
                appointment.getCancelledAt(),
                appointment.getRefundedAt(),
                prescription != null,
                prescription != null ? prescription.getDocumentStatus() : null,
                prescription != null && prescription.getDocumentStatus() == com.hms.entity.type.PrescriptionDocumentStatus.READY
                        ? prescription.getDocumentUrl()
                        : null
        );
    }

    private AppointmentStatusType resolveAppointmentStatus(Appointment appointment) {
        return appointment.getStatus();
    }

    private com.hms.entity.Prescription resolvePrescription(String appointmentId) {
        if (prescriptionRepository == null) {
            return null;
        }
        return prescriptionRepository.findByAppointment_AppointmentId(appointmentId).orElse(null);
    }

    private DoctorResponseDto mapDoctorResponse(Doctor doctor) {
        if (doctor == null) return null;
        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                mapDepartments(doctor),
                mapBranchResponse(doctor.getBranch()),
                doctor.getConsultationFee(),
                doctor.getUser() != null ? doctor.getUser().getProfilePhoto() : null,
                doctor.getDoctorStampUrl()
        );
    }

    private Set<DepartmentDto> mapDepartments(Doctor doctor) {
        if (doctor.getDepartments() == null) return Set.of();
        return doctor.getDepartments().stream()
                .map(department -> {
                    DepartmentDto dto = new DepartmentDto();
                    dto.setId(department.getId());
                    dto.setName(department.getName());
                    dto.setBranchId(department.getBranch() != null ? department.getBranch().getId() : null);
                    dto.setHeadDoctorId(department.getHeadDoctor() != null ? department.getHeadDoctor().getId() : null);
                    // Avoid loading all doctors for efficiency
                    dto.setDoctorIds(Set.of());
                    dto.setHeadDoctorName(department.getHeadDoctor() != null ? department.getHeadDoctor().getName() : null);
                    dto.setMemberCount(0);
                    dto.setDescription(department.getDescription());
                    dto.setImageUrl(department.getImageUrl());
                    dto.setAccentColor(department.getAccentColor());
                    dto.setBgColor(department.getBgColor());
                    dto.setIcon(department.getIcon());
                    dto.setSectionsJson(department.getSectionsJson());
                    return dto;
                })
                .collect(Collectors.toSet());
    }

    private PatientResponseDto mapPatientResponse(Patient patient) {
        if (patient == null) return null;
        return new PatientResponseDto(
                patient.getId(),
                patient.getName(),
                patient.getBirthDate() != null ? patient.getBirthDate().toString() : null,
                patient.getGender() != null ? patient.getGender().name() : null,
                patient.getBloodGroup() != null ? patient.getBloodGroup().name() : null,
                patient.getEmail()
        );
    }

    private BranchResponseDto mapBranchResponse(com.hms.entity.Branch branch) {
        if (branch == null) return null;
        return new BranchResponseDto(
                branch.getId(),
                branch.getName(),
                branch.getAddress(),
                branch.getEmail(),
                branch.getContactNumber()
        );
    }
}
