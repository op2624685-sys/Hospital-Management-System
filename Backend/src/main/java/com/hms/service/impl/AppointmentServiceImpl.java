package com.hms.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
import com.hms.entity.Admin;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.RoleType;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.AdminRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.service.AppointmentService;
import com.hms.service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private static final long APPOINTMENT_SLOT_MINUTES = 20;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    private final EmailService emailService;
    @Value("${app.appointment-details-base-url:http://localhost:5173/appointments}")
    private String appointmentDetailsBaseUrl;

    @Override
    @Transactional
    @Secured("ROLE_PATIENT")
    public AppointmentResponseDto createNewAppointment(CreateAppointmentRequestDto createAppointmentRequestDto) {
        Long doctorId = createAppointmentRequestDto.getDoctorId();
        Long patientId = createAppointmentRequestDto.getPatientId();

        validateWithinWorkingHours(createAppointmentRequestDto.getAppointmentTime());
        validateSlotBoundary(createAppointmentRequestDto.getAppointmentTime());

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + patientId));
        Doctor doctor = doctorRepository.findByIdForUpdate(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + doctorId));
        if (doctor.getBranch() == null) {
            throw new IllegalStateException("Doctor is not assigned to any branch");
        }

        if (createAppointmentRequestDto.getBranchId() != null
                && !createAppointmentRequestDto.getBranchId().equals(doctor.getBranch().getId())) {
            throw new IllegalArgumentException("Doctor does not belong to the requested branch");
        }
        if (isSlotTaken(doctor, createAppointmentRequestDto.getAppointmentTime())) {
            throw new IllegalArgumentException("Selected time slot is already booked for this doctor (20 minute slot)");
        }

        Appointment appointment = Appointment.builder()
                .reason(createAppointmentRequestDto.getReason())
                .appointmentTime(createAppointmentRequestDto.getAppointmentTime())
                .build();

        appointment.setStatus(AppointmentStatusType.PENDING);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setBranch(doctor.getBranch());
        if (patient.getAppointments() == null) {
            patient.setAppointments(new ArrayList<>());
        }
        patient.getAppointments().add(appointment); // to maintain consistency

        appointment = appointmentRepository.save(appointment);
        sendAppointmentCreatedEmails(appointment);
        return mapToAppointmentResponseDto(appointment);
    }

    private void sendAppointmentCreatedEmails(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        if (StringUtils.hasText(patient.getEmail())) {
            emailService.sendMail(
                    patient.getEmail(),
                    "Appointment Booked Successfully",
                    String.format(
                            "Hello %s,%n%nYour appointment has been booked successfully.%nAppointment ID: %s%nDoctor: Dr. %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nThank you.",
                            patient.getName(),
                            appointment.getAppointmentId(),
                            doctor.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            emailService.sendMail(
                    doctor.getEmail(),
                    "New Appointment Booked",
                    String.format(
                            "Hello Dr. %s,%n%nA new appointment has been booked.%nAppointment ID: %s%nPatient: %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nPlease review in HMS.",
                            doctor.getName(),
                            appointment.getAppointmentId(),
                            patient.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }
    }

    @Transactional
    public Appointment reAssignAppointmentToAnotherDoctor(Long appointmentId, Long newDoctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow();
        Doctor newDoctor = doctorRepository.findById(newDoctorId).orElseThrow();

        appointment.setDoctor(newDoctor);

        if (newDoctor.getAppointments() == null) {
            newDoctor.setAppointments(new ArrayList<>());
        }
        newDoctor.getAppointments().add(appointment); // Ensure bidirectional consistency

        Appointment savedAppointment = appointmentRepository.save(appointment);
        sendAppointmentUpdatedEmails(savedAppointment, "Doctor was changed");
        return savedAppointment;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
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
    public AppointmentResponseDto getAppointmentByAppointmentId(String appointmentId) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));
        return mapToAppointmentResponseDto(appointment);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
    public AppointmentResponseDto updateAppointmentStatus(String appointmentId, AppointmentStatusType status) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        enforceDoctorCanAccessOwnAppointment(appointment);

        if (appointment.getStatus() == AppointmentStatusType.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a cancelled appointment");
        }

        appointment.setStatus(status);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        sendAppointmentStatusNotification(savedAppointment);
        return mapToAppointmentResponseDto(savedAppointment);
    }

    @Override
    @Transactional
    @Secured("ROLE_PATIENT")
    public AppointmentResponseDto cancelAppointmentByPatient(String appointmentId) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        Long loggedInPatientId = getAuthenticatedUserId();
        if (!appointment.getPatient().getId().equals(loggedInPatientId)) {
            throw new AccessDeniedException("You can only cancel your own appointment");
        }

        appointment.setStatus(AppointmentStatusType.CANCELLED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        sendPatientCancelledEmails(savedAppointment);
        return mapToAppointmentResponseDto(savedAppointment);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
    public AppointmentResponseDto updateAppointment(String appointmentId, UpdateAppointmentRequestDto updateAppointmentRequestDto) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

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
            sendAppointmentStatusNotification(savedAppointment);
        }

        return mapToAppointmentResponseDto(savedAppointment);
    }

    @Override
    @Transactional
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
    public List<AppointmentResponseDto> getRecentAppointmentsForAdmin(int page, int size) {
        Long adminUserId = getAuthenticatedUserId();
        Admin admin = adminRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found for user id: " + adminUserId));
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

    private Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.hms.entity.User user) {
            return user.getId();
        }
        throw new AccessDeniedException("User authentication is required");
    }

    private void sendAppointmentStatusNotification(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();
        AppointmentStatusType status = appointment.getStatus();

        if (StringUtils.hasText(patient.getEmail())) {
            String subject = "Appointment Status Update: " + status;
            String message;

            switch (status) {
                case CONFIRMED -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s has been CONFIRMED.%n%nDetails:%nTime: %s%nReason: %s%nLink: %s%n%nPlease arrive 10 minutes before your scheduled time.",
                        patient.getName(), doctor.getName(), appointment.getAppointmentTime(), appointment.getReason(), getAppointmentLink(appointment));
                case REJECTED -> message = String.format(
                        "Hello %s,%n%nWe regret to inform you that your appointment with Dr. %s has been REJECTED.%n%nDetails:%nTime: %s%nReason: %s%n%nPlease contact the hospital or book another slot if needed.",
                        patient.getName(), doctor.getName(), appointment.getAppointmentTime(), appointment.getReason());
                case IN_PROGRESS -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s is now IN PROGRESS.%n%nLink: %s",
                        patient.getName(), doctor.getName(), getAppointmentLink(appointment));
                case COMPLETED -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s has been COMPLETED.%n%nWe hope you had a satisfactory experience. You can view your appointment details here: %s",
                        patient.getName(), doctor.getName(), getAppointmentLink(appointment));
                case CANCELLED -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s has been CANCELLED.%n%nDetails:%nTime: %s",
                        patient.getName(), doctor.getName(), appointment.getAppointmentTime());
                default -> message = String.format(
                        "Hello %s,%n%nThe status of your appointment with Dr. %s has been updated to: %s.%n%nLink: %s",
                        patient.getName(), doctor.getName(), status, getAppointmentLink(appointment));
            }

            emailService.sendMail(patient.getEmail(), subject, message + "\n\nThank you,\n" + appointment.getBranch().getName());
        }

        // Also notify the doctor about the status change if it was changed by someone else (e.g. Admin)
        if (StringUtils.hasText(doctor.getEmail())) {
             emailService.sendMail(
                    doctor.getEmail(),
                    "Appointment Status Updated",
                    String.format(
                            "Hello Dr. %s,%n%nThe status of appointment %s (Patient: %s) has been changed to %s.%nLink: %s",
                            doctor.getName(),
                            appointment.getAppointmentId(),
                            patient.getName(),
                            status,
                            getAppointmentLink(appointment)));
        }
    }

    private void sendAppointmentUpdatedEmails(Appointment appointment, String changeSummary) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        if (StringUtils.hasText(patient.getEmail())) {
            emailService.sendMail(
                    patient.getEmail(),
                    "Appointment Updated",
                    String.format(
                            "Hello %s,%n%nYour appointment has been updated.%nChange: %s%nAppointment ID: %s%nDoctor: Dr. %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nThank you.",
                            patient.getName(),
                            changeSummary,
                            appointment.getAppointmentId(),
                            doctor.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            emailService.sendMail(
                    doctor.getEmail(),
                    "Appointment Updated",
                    String.format(
                            "Hello Dr. %s,%n%nAn appointment has been updated.%nChange: %s%nAppointment ID: %s%nPatient: %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nPlease review in HMS.",
                            doctor.getName(),
                            changeSummary,
                            appointment.getAppointmentId(),
                            patient.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }
    }

    private void sendPatientCancelledEmails(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        if (StringUtils.hasText(patient.getEmail())) {
            emailService.sendMail(
                    patient.getEmail(),
                    "Appointment Cancelled",
                    String.format(
                            "Hello %s,%n%nYour appointment has been cancelled.%nAppointment ID: %s%nDoctor: Dr. %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nThank you.",
                            patient.getName(),
                            appointment.getAppointmentId(),
                            doctor.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            emailService.sendMail(
                    doctor.getEmail(),
                    "Patient Cancelled Appointment",
                    String.format(
                            "Hello Dr. %s,%n%nA patient has cancelled an appointment.%nAppointment ID: %s%nPatient: %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nPlease review in HMS.",
                            doctor.getName(),
                            appointment.getAppointmentId(),
                            patient.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }
    }

    private String getAppointmentLink(Appointment appointment) {
        String baseUrl = appointmentDetailsBaseUrl.endsWith("/") ? appointmentDetailsBaseUrl : appointmentDetailsBaseUrl + "/";
        return baseUrl + appointment.getAppointmentId();
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
                mapDoctorResponse(appointment.getDoctor()),
                appointment.getStatus(),
                mapPatientResponse(appointment.getPatient()),
                mapBranchResponse(appointment.getBranch())
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
                mapBranchResponse(doctor.getBranch())
        );
    }

    private Set<DepartmentDto> mapDepartments(Doctor doctor) {
        if (doctor.getDepartments() == null) return Set.of();
        return doctor.getDepartments().stream()
                .map(department -> new DepartmentDto(
                        department.getId(),
                        department.getName(),
                        department.getBranch() != null ? department.getBranch().getId() : null,
                        department.getHeadDoctor() != null ? department.getHeadDoctor().getId() : null,
                        department.getDoctors() == null ? Set.of()
                                : department.getDoctors().stream().map(Doctor::getId).collect(Collectors.toSet())
                ))
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
