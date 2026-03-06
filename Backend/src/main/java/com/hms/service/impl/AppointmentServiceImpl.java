package com.hms.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
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
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.RoleType;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.service.AppointmentService;
import com.hms.service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final ModelMapper modelMapper;
    private final EmailService emailService;
    @Value("${app.appointment-details-base-url:http://localhost:5173/appointments}")
    private String appointmentDetailsBaseUrl;

    @Override
    @Transactional
    @Secured("ROLE_PATIENT")
    public AppointmentResponseDto createNewAppointment(CreateAppointmentRequestDto createAppointmentRequestDto) {
        Long doctorId = createAppointmentRequestDto.getDoctorId();
        Long patientId = createAppointmentRequestDto.getPatientId();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + patientId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + doctorId));
        if (doctor.getBranch() == null) {
            throw new IllegalStateException("Doctor is not assigned to any branch");
        }

        if (createAppointmentRequestDto.getBranchId() != null
                && !createAppointmentRequestDto.getBranchId().equals(doctor.getBranch().getId())) {
            throw new IllegalArgumentException("Doctor does not belong to the requested branch");
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
        return modelMapper.map(appointment, AppointmentResponseDto.class);
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
    @PreAuthorize("hasAnyRole('ADMIN','HEADADMIN') OR (hasRole('DOCTOR') AND #doctorId == authentication.principal.id)")
    public List<AppointmentResponseDto> getAllAppointmentsOfDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow();

        return doctor.getAppointments()
                .stream()
                .map(appointment -> modelMapper.map(appointment, AppointmentResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasRole('PATIENT') AND #patientId == authentication.principal.id")
    public List<AppointmentResponseDto> getAllAppointmentsOfPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + patientId));
        return patient.getAppointments()
                .stream()
                .map(appointment -> modelMapper.map(appointment, AppointmentResponseDto.class))
                .collect(Collectors.toList());
    }
    @Transactional
    @Override
    public AppointmentResponseDto getAppointmentByAppointmentId(String appointmentId) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));
        return modelMapper.map(appointment, AppointmentResponseDto.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
    public AppointmentResponseDto updateAppointmentStatus(String appointmentId, AppointmentStatusType status) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        enforceDoctorCanAccessOwnAppointment(appointment);

        appointment.setStatus(status);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        sendAppointmentUpdatedEmails(savedAppointment, "Status changed to " + status);
        return modelMapper.map(savedAppointment, AppointmentResponseDto.class);
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
        return modelMapper.map(savedAppointment, AppointmentResponseDto.class);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','HEADADMIN')")
    public AppointmentResponseDto updateAppointment(String appointmentId, UpdateAppointmentRequestDto updateAppointmentRequestDto) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        enforceDoctorCanAccessOwnAppointment(appointment);

        StringJoiner changeSummary = new StringJoiner(", ");
        if (updateAppointmentRequestDto.getAppointmentTime() != null) {
            appointment.setAppointmentTime(updateAppointmentRequestDto.getAppointmentTime());
            changeSummary.add("Appointment time changed");
        }
        if (updateAppointmentRequestDto.getReason() != null) {
            appointment.setReason(updateAppointmentRequestDto.getReason());
            changeSummary.add("Reason changed");
        }
        if (changeSummary.length() == 0) {
            throw new IllegalArgumentException("At least one field is required to update appointment");
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        sendAppointmentUpdatedEmails(savedAppointment, changeSummary.toString());
        return modelMapper.map(savedAppointment, AppointmentResponseDto.class);
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
}
