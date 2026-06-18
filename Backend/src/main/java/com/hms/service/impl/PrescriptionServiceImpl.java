package com.hms.service.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.config.KafkaConfig;
import com.hms.dto.DepartmentDto;
import com.hms.dto.PrescriptionMedicineDto;
import com.hms.dto.Request.PrescriptionRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.dto.Response.PrescriptionResponseDto;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Prescription;
import com.hms.entity.User;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.PrescriptionDocumentStatus;
import com.hms.entity.type.RoleType;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.event.PrescriptionGenerationRequestedEvent;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.PrescriptionRepository;
import com.hms.service.CloudinaryService;
import com.hms.service.PrescriptionPdfService;
import com.hms.service.PrescriptionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, PrescriptionGenerationRequestedEvent> kafkaTemplate;
    private final PrescriptionPdfService prescriptionPdfService;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public PrescriptionResponseDto createPrescription(String appointmentId, PrescriptionRequestDto request) {
        Appointment appointment = getAppointmentWithDetails(appointmentId);
        enforceDoctorWriteAccess(appointment);
        validateWritableAppointment(appointment);
        validateDoctorStamp(appointment.getDoctor());
        if (prescriptionRepository.existsByAppointment_AppointmentId(appointmentId)) {
            throw new ValidationException("Prescription already exists for this appointment");
        }

        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .documentStatus(PrescriptionDocumentStatus.PENDING_GENERATION)
                .generationAttemptCount(0)
                .build();
        applyRequest(prescription, request);
        markGenerationPending(prescription);
        Prescription saved = prescriptionRepository.saveAndFlush(prescription);
        publishGenerationEvent(saved);
        return mapToResponse(saved, true);
    }

    @Override
    @Transactional
    public PrescriptionResponseDto updatePrescription(String appointmentId, PrescriptionRequestDto request) {
        Prescription prescription = prescriptionRepository.findWithDetailsByAppointment_AppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Prescription not found for appointment: " + appointmentId));
        enforceDoctorWriteAccess(prescription.getAppointment());
        validateWritableAppointment(prescription.getAppointment());
        validateDoctorStamp(prescription.getAppointment().getDoctor());

        applyRequest(prescription, request);
        markGenerationPending(prescription);
        Prescription saved = prescriptionRepository.saveAndFlush(prescription);
        publishGenerationEvent(saved);
        return mapToResponse(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponseDto getPrescription(String appointmentId) {
        Prescription prescription = prescriptionRepository.findWithDetailsByAppointment_AppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Prescription not found for appointment: " + appointmentId));
        boolean clinicalUser = enforceReadAccess(prescription.getAppointment());
        return mapToResponse(prescription, clinicalUser);
    }

    @Override
    @Transactional
    public PrescriptionResponseDto retryGeneration(String appointmentId) {
        Prescription prescription = prescriptionRepository.findWithDetailsByAppointment_AppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Prescription not found for appointment: " + appointmentId));
        enforceDoctorWriteAccess(prescription.getAppointment());
        validateDoctorStamp(prescription.getAppointment().getDoctor());
        markGenerationPending(prescription);
        Prescription saved = prescriptionRepository.saveAndFlush(prescription);
        publishGenerationEvent(saved);
        return mapToResponse(saved, true);
    }

    @Override
    @Transactional
    public void generateDocument(Long prescriptionId, LocalDateTime requestVersion) {
        Prescription prescription = prescriptionRepository.findWithDetailsById(prescriptionId)
                .orElseThrow(() -> new NotFoundException("Prescription not found with id: " + prescriptionId));
        if (prescription.getDocumentRequestVersion() == null
                || !prescription.getDocumentRequestVersion().equals(requestVersion)) {
            return;
        }

        prescription.setDocumentStatus(PrescriptionDocumentStatus.GENERATING);
        prescriptionRepository.saveAndFlush(prescription);

        try {
            byte[] pdf = prescriptionPdfService.generate(prescription);
            String fileName = "prescription-" + prescription.getAppointment().getAppointmentId();
            var response = cloudinaryService.uploadRaw(pdf, fileName, "application/pdf");
            Object secureUrl = response.get("secure_url");
            if (secureUrl == null || secureUrl.toString().isBlank()) {
                throw new ValidationException("Prescription document upload failed");
            }

            Prescription latest = prescriptionRepository.findWithDetailsById(prescriptionId)
                    .orElseThrow(() -> new NotFoundException("Prescription not found with id: " + prescriptionId));
            if (!requestVersion.equals(latest.getDocumentRequestVersion())) {
                return;
            }
            latest.setDocumentUrl(secureUrl.toString());
            latest.setDocumentStatus(PrescriptionDocumentStatus.READY);
            latest.setDocumentGeneratedAt(LocalDateTime.now());
            latest.setGenerationError(null);
            prescriptionRepository.save(latest);
        } catch (Exception e) {
            Prescription failed = prescriptionRepository.findById(prescriptionId)
                    .orElseThrow(() -> new NotFoundException("Prescription not found with id: " + prescriptionId));
            if (!requestVersion.equals(failed.getDocumentRequestVersion())) {
                return;
            }
            failed.setDocumentStatus(PrescriptionDocumentStatus.FAILED);
            failed.setGenerationAttemptCount((failed.getGenerationAttemptCount() == null ? 0 : failed.getGenerationAttemptCount()) + 1);
            failed.setGenerationError(e.getMessage());
            prescriptionRepository.save(failed);
        }
    }

    private Appointment getAppointmentWithDetails(String appointmentId) {
        return appointmentRepository.findByAppointmentIdWithDetails(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found with ID: " + appointmentId));
    }

    private void applyRequest(Prescription prescription, PrescriptionRequestDto request) {
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setClinicalNotes(request.getClinicalNotes());
        prescription.setVitals(request.getVitals());
        prescription.setRecommendedTests(request.getRecommendedTests());
        prescription.setAdvice(request.getAdvice());
        prescription.setFollowUpDate(request.getFollowUpDate());
        prescription.setFollowUpNotes(request.getFollowUpNotes());
        try {
            prescription.setMedicinesJson(objectMapper.writeValueAsString(
                    request.getMedicines() == null ? List.of() : request.getMedicines()));
        } catch (JsonProcessingException e) {
            throw new ValidationException("Invalid medicine data");
        }
    }

    private void markGenerationPending(Prescription prescription) {
        // Truncate to microseconds to match PostgreSQL timestamp precision.
        // Java's LocalDateTime.now() has nanosecond precision but PostgreSQL
        // stores timestamps with microsecond precision. Without truncation the
        // version stored in the DB differs from the value in the Kafka event,
        // causing the idempotency check in generateDocument() to silently
        // return and leave the status stuck at PENDING_GENERATION.
        LocalDateTime version = LocalDateTime.now().truncatedTo(ChronoUnit.MICROS);
        prescription.setDocumentStatus(PrescriptionDocumentStatus.PENDING_GENERATION);
        prescription.setDocumentRequestVersion(version);
        prescription.setGenerationError(null);
    }

    private void publishGenerationEvent(Prescription prescription) {
        kafkaTemplate.send(
                KafkaConfig.PRESCRIPTION_GENERATION_TOPIC,
                prescription.getId().toString(),
                new PrescriptionGenerationRequestedEvent(
                        prescription.getId(),
                        prescription.getAppointment().getAppointmentId(),
                        prescription.getAppointment().getDoctor().getId(),
                        LocalDateTime.now(),
                        prescription.getDocumentRequestVersion()));
    }

    private void validateWritableAppointment(Appointment appointment) {
        if (appointment.getStatus() != AppointmentStatusType.IN_PROGRESS
                && appointment.getStatus() != AppointmentStatusType.COMPLETED) {
            throw new ValidationException("Prescription can only be created when appointment is IN_PROGRESS or COMPLETED");
        }
    }

    private void validateDoctorStamp(Doctor doctor) {
        if (doctor == null || doctor.getDoctorStampUrl() == null || doctor.getDoctorStampUrl().isBlank()) {
            throw new ValidationException("Upload your doctor stamp before creating a prescription");
        }
    }

    private void enforceDoctorWriteAccess(Appointment appointment) {
        User user = getAuthenticatedUser();
        if (!user.getRoles().contains(RoleType.DOCTOR) || !appointment.getDoctor().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only write prescriptions for your own appointments");
        }
    }

    private boolean enforceReadAccess(Appointment appointment) {
        User user = getAuthenticatedUser();
        if (user.getRoles().contains(RoleType.DOCTOR)) {
            if (!appointment.getDoctor().getId().equals(user.getId())) {
                throw new AccessDeniedException("You can only view prescriptions for your own appointments");
            }
            return true;
        }
        if (user.getRoles().contains(RoleType.PATIENT)) {
            if (!appointment.getPatient().getId().equals(user.getId())) {
                throw new AccessDeniedException("You can only view your own prescriptions");
            }
            return false;
        }
        if (user.getRoles().contains(RoleType.ADMIN) || user.getRoles().contains(RoleType.HEADADMIN)) {
            return true;
        }
        throw new AccessDeniedException("You are not allowed to view this prescription");
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new AccessDeniedException("User authentication is required");
    }

    private PrescriptionResponseDto mapToResponse(Prescription prescription, boolean includeClinicalError) {
        Appointment appointment = prescription.getAppointment();
        return new PrescriptionResponseDto(
                prescription.getId(),
                appointment.getAppointmentId(),
                prescription.getDiagnosis(),
                prescription.getClinicalNotes(),
                prescription.getVitals(),
                parseMedicines(prescription.getMedicinesJson()),
                prescription.getRecommendedTests(),
                prescription.getAdvice(),
                prescription.getFollowUpDate(),
                prescription.getFollowUpNotes(),
                prescription.getDocumentStatus(),
                prescription.getDocumentStatus() == PrescriptionDocumentStatus.READY ? prescription.getDocumentUrl() : null,
                prescription.getDocumentGeneratedAt(),
                includeClinicalError ? prescription.getGenerationError() : null,
                prescription.getGenerationAttemptCount(),
                prescription.getCreatedAt(),
                prescription.getUpdatedAt(),
                mapAppointment(appointment, prescription)
        );
    }

    private List<PrescriptionMedicineDto> parseMedicines(String medicinesJson) {
        if (medicinesJson == null || medicinesJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(medicinesJson, new TypeReference<List<PrescriptionMedicineDto>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private AppointmentResponseDto mapAppointment(Appointment appointment, Prescription prescription) {
        return new AppointmentResponseDto(
                appointment.getAppointmentId(),
                appointment.getAppointmentTime(),
                appointment.getReason(),
                appointment.getAmount(),
                mapDoctor(appointment.getDoctor()),
                appointment.getStatus(),
                mapPatient(appointment.getPatient()),
                mapBranch(appointment.getBranch()),
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
                true,
                prescription.getDocumentStatus(),
                prescription.getDocumentStatus() == PrescriptionDocumentStatus.READY ? prescription.getDocumentUrl() : null
        );
    }

    private DoctorResponseDto mapDoctor(Doctor doctor) {
        if (doctor == null) return null;
        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                Set.<DepartmentDto>of(),
                mapBranch(doctor.getBranch()),
                doctor.getConsultationFee(),
                doctor.getUser() != null ? doctor.getUser().getProfilePhoto() : null,
                doctor.getDoctorStampUrl()
        );
    }

    private PatientResponseDto mapPatient(com.hms.entity.Patient patient) {
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

    private BranchResponseDto mapBranch(com.hms.entity.Branch branch) {
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
