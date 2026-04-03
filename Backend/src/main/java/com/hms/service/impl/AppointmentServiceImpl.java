package com.hms.service.impl;

import java.util.ArrayList;
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
import com.hms.repository.BranchRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.service.AppointmentService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.context.ApplicationEventPublisher;

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
    private final ApplicationEventPublisher eventPublisher;

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

        appointment = appointmentRepository.save(appointment);
        
        eventPublisher.publishEvent(new AppointmentNotificationEvent(
                appointment.getAppointmentId(),
                AppointmentNotificationType.CREATED,
                null));

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

        enforceDoctorCanAccessOwnAppointment(appointment);

        if (appointment.getStatus() == AppointmentStatusType.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a cancelled appointment");
        }

        appointment.setStatus(status);
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

        enforceDoctorCanAccessOwnAppointment(appointment);

        if (appointment.getStatus() == AppointmentStatusType.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a cancelled appointment");
        }

        boolean statusChanged = false;
        StringJoiner changeSummary = new StringJoiner(", ");

        if (updateAppointmentRequestDto.getStatus() != null && !updateAppointmentRequestDto.getStatus().equals(appointment.getStatus())) {
            appointment.setStatus(updateAppointmentRequestDto.getStatus());
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
        return new AppointmentResponseDto(
                appointment.getAppointmentId(),
                appointment.getAppointmentTime(),
                appointment.getReason(),
                appointment.getAmount(),
                mapDoctorResponse(appointment.getDoctor()),
                appointment.getStatus(),
                mapPatientResponse(appointment.getPatient()),
                mapBranchResponse(appointment.getBranch()),
                appointment.getDepartment() != null ? appointment.getDepartment().getName() : null
        );
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
                doctor.getConsultationFee()
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
