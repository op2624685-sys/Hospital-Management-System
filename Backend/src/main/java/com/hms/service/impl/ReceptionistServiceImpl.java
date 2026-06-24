package com.hms.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.dto.Response.DoctorQueueSummaryDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.dto.Response.QueueEntryDto;
import com.hms.dto.Response.ReceptionistResponseDto;
import com.hms.entity.Appointment;
import com.hms.entity.Department;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.Receptionist;
import com.hms.entity.User;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.PrescriptionRepository;
import com.hms.repository.ReceptionistRepository;
import com.hms.service.ReceptionistService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import com.hms.event.AppointmentNotificationEvent;
import com.hms.event.AppointmentNotificationType;
import com.hms.event.ReceptionistQueueUpdatedEvent;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {

    private final AppointmentRepository appointmentRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ApplicationEventPublisher eventPublisher;


    @Override
    @Transactional(readOnly = true)
    public ReceptionistResponseDto getProfile() {
        Receptionist receptionist = getAuthenticatedReceptionist();
        return mapReceptionistResponse(receptionist);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getDepartmentAppointments(
            LocalDate date,
            AppointmentStatusType status,
            Long doctorId,
            String search,
            int page,
            int size) {
        Receptionist receptionist = getAuthenticatedReceptionist();
        LocalDate targetDate = date == null ? LocalDate.now() : date;
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay().minusNanos(1);
        int boundedSize = Math.min(Math.max(size, 1), 500);

        List<Appointment> appointments = (status == null
                ? appointmentRepository.findByBranch_IdAndDepartment_IdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
                        receptionist.getBranch().getId(),
                        receptionist.getDepartment().getId(),
                        start,
                        end,
                        PageRequest.of(0, boundedSize * Math.max(page + 1, 1)))
                : appointmentRepository.findByBranch_IdAndDepartment_IdAndStatusAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
                        receptionist.getBranch().getId(),
                        receptionist.getDepartment().getId(),
                        status,
                        start,
                        end,
                        PageRequest.of(0, boundedSize * Math.max(page + 1, 1))))
                .getContent();

        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        List<AppointmentResponseDto> filtered = appointments.stream()
                .filter(appointment -> doctorId == null || appointment.getDoctor().getId().equals(doctorId))
                .filter(appointment -> normalizedSearch.isBlank() || matchesSearch(appointment, normalizedSearch))
                .sorted(Comparator.comparing(Appointment::getAppointmentTime))
                .map(this::mapAppointmentResponseDto)
                .toList();

        return paginate(filtered, page, boundedSize);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> searchAppointments(String appointmentId, String patientName, LocalDate birthDate) {
        Receptionist receptionist = getAuthenticatedReceptionist();

        if (appointmentId != null && !appointmentId.isBlank()) {
            Appointment appointment = appointmentRepository
                    .findByAppointmentIdAndBranch_IdAndDepartment_Id(
                            appointmentId.trim(),
                            receptionist.getBranch().getId(),
                            receptionist.getDepartment().getId())
                    .orElseThrow(() -> new NotFoundException("Appointment not found"));
            return List.of(mapAppointmentResponseDto(appointment));
        }

        if (patientName == null || patientName.isBlank() || birthDate == null) {
            throw new ValidationException("Search requires appointmentId or patientName with birthDate");
        }

        return appointmentRepository.searchByPatientIdentityInDepartment(
                        receptionist.getBranch().getId(),
                        receptionist.getDepartment().getId(),
                        patientName.trim(),
                        birthDate)
                .stream()
                .map(this::mapAppointmentResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentDetails(String appointmentId) {
        Receptionist receptionist = getAuthenticatedReceptionist();
        Appointment appointment = appointmentRepository.findByAppointmentIdAndBranch_IdAndDepartment_Id(
                        appointmentId,
                        receptionist.getBranch().getId(),
                        receptionist.getDepartment().getId())
                .orElseThrow(() -> new NotFoundException("Appointment not found"));
        return mapAppointmentResponseDto(appointment);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "appointmentDetails", key = "#appointmentId"),
        @CacheEvict(value = "doctorAppointments", allEntries = true),
        @CacheEvict(value = "patientAppointments", allEntries = true),
        @CacheEvict(value = "recentAdminAppointments", allEntries = true),
        @CacheEvict(value = "bookedSlots", allEntries = true)
    })
    public AppointmentResponseDto updateAppointmentStatus(String appointmentId, AppointmentStatusType targetStatus) {
        Receptionist receptionist = getAuthenticatedReceptionist();
        Appointment appointment = appointmentRepository.findByAppointmentIdAndBranch_IdAndDepartment_Id(
                        appointmentId,
                        receptionist.getBranch().getId(),
                        receptionist.getDepartment().getId())
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        validateReceptionistTransition(appointment.getStatus(), targetStatus);

        LocalDateTime now = LocalDateTime.now();
        if (targetStatus == AppointmentStatusType.QUEUED) {
            LocalDate queueDate = now.toLocalDate();
            Integer maxQueue = appointmentRepository.findMaxQueueNumber(
                    receptionist.getBranch().getId(),
                    receptionist.getDepartment().getId(),
                    appointment.getDoctor().getId(),
                    queueDate);
            appointment.setQueueDate(queueDate);
            appointment.setQueueNumber((maxQueue == null ? 0 : maxQueue) + 1);
            if (appointment.getQueuedAt() == null) {
                appointment.setQueuedAt(now);
            }
        }

        appointment.setStatus(targetStatus);
        switch (targetStatus) {
            case VISITED -> {
                if (appointment.getVisitedAt() == null) appointment.setVisitedAt(now);
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
            default -> {
            }
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        eventPublisher.publishEvent(new AppointmentNotificationEvent(
                savedAppointment.getAppointmentId(),
                AppointmentNotificationType.STATUS_CHANGED,
                null));
        if (savedAppointment.getQueueDate() != null) {
            eventPublisher.publishEvent(new ReceptionistQueueUpdatedEvent(
                    savedAppointment.getAppointmentId(),
                    receptionist.getDepartment().getId(),
                    receptionist.getBranch().getId(),
                    savedAppointment.getQueueDate()));
        }
        return mapAppointmentResponseDto(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorQueueSummaryDto> getDepartmentQueue(LocalDate date) {
        Receptionist receptionist = getAuthenticatedReceptionist();
        LocalDate targetDate = date == null ? LocalDate.now() : date;

        List<Appointment> queued = appointmentRepository.findAllQueuedForDepartment(
                receptionist.getBranch().getId(),
                receptionist.getDepartment().getId(),
                targetDate,
                AppointmentStatusType.QUEUED);

        Map<Long, List<Appointment>> byDoctor = queued.stream()
                .collect(Collectors.groupingBy(appointment -> appointment.getDoctor().getId(), LinkedHashMap::new, Collectors.toList()));

        List<DoctorQueueSummaryDto> summaries = new ArrayList<>();
        for (List<Appointment> doctorQueue : byDoctor.values()) {
            summaries.add(mapDoctorQueueSummary(doctorQueue, receptionist.getDepartment()));
        }
        return summaries;
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorQueueSummaryDto getDoctorQueue(Long doctorId, LocalDate date) {
        Receptionist receptionist = getAuthenticatedReceptionist();
        LocalDate targetDate = date == null ? LocalDate.now() : date;
        List<Appointment> queue = appointmentRepository.findQueueByDoctor(
                receptionist.getBranch().getId(),
                receptionist.getDepartment().getId(),
                doctorId,
                targetDate,
                AppointmentStatusType.QUEUED);
        if (queue.isEmpty()) {
            return new DoctorQueueSummaryDto(doctorId, null, receptionist.getDepartment().getName(), 0, null, List.of());
        }
        return mapDoctorQueueSummary(queue, receptionist.getDepartment());
    }

    private boolean matchesSearch(Appointment appointment, String search) {
        return (appointment.getAppointmentId() != null && appointment.getAppointmentId().toLowerCase().contains(search))
                || (appointment.getPatient() != null && appointment.getPatient().getName() != null
                    && appointment.getPatient().getName().toLowerCase().contains(search))
                || (appointment.getReason() != null && appointment.getReason().toLowerCase().contains(search))
                || (appointment.getDoctor() != null && appointment.getDoctor().getName() != null
                    && appointment.getDoctor().getName().toLowerCase().contains(search));
    }

    private List<AppointmentResponseDto> paginate(List<AppointmentResponseDto> items, int page, int size) {
        int fromIndex = Math.max(page, 0) * size;
        if (fromIndex >= items.size()) {
            return List.of();
        }
        int toIndex = Math.min(items.size(), fromIndex + size);
        return items.subList(fromIndex, toIndex);
    }

    private void validateReceptionistTransition(AppointmentStatusType currentStatus, AppointmentStatusType targetStatus) {
        if (currentStatus == targetStatus) {
            throw new ValidationException("Appointment is already in status " + targetStatus);
        }
        if (Set.of(
                AppointmentStatusType.CANCELLED,
                AppointmentStatusType.REFUNDED,
                AppointmentStatusType.COMPLETED,
                AppointmentStatusType.NO_SHOW).contains(currentStatus)) {
            throw new ValidationException("Cannot change status after appointment is " + currentStatus);
        }

        boolean valid = (currentStatus == AppointmentStatusType.CONFIRMED && targetStatus == AppointmentStatusType.VISITED)
                || (currentStatus == AppointmentStatusType.VISITED && targetStatus == AppointmentStatusType.QUEUED)
                || (currentStatus == AppointmentStatusType.CONFIRMED && targetStatus == AppointmentStatusType.NO_SHOW)
                || (currentStatus == AppointmentStatusType.QUEUED && targetStatus == AppointmentStatusType.IN_PROGRESS)
                || (currentStatus == AppointmentStatusType.IN_PROGRESS && targetStatus == AppointmentStatusType.COMPLETED);

        if (!valid) {
            throw new ValidationException("Invalid receptionist status transition from " + currentStatus + " to " + targetStatus);
        }
    }

    private Receptionist getAuthenticatedReceptionist() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new AccessDeniedException("User authentication is required");
        }
        return receptionistRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("Receptionist profile not found"));
    }

    private AppointmentResponseDto mapAppointmentResponseDto(Appointment appointment) {
        com.hms.entity.Prescription prescription = resolvePrescription(appointment.getAppointmentId());
        return new AppointmentResponseDto(
                appointment.getAppointmentId(),
                appointment.getAppointmentTime(),
                appointment.getReason(),
                appointment.getAmount(),
                mapDoctorResponse(appointment.getDoctor()),
                appointment.getStatus(),
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

    private DoctorQueueSummaryDto mapDoctorQueueSummary(List<Appointment> queue, Department department) {
        Appointment first = queue.get(0);
        List<QueueEntryDto> entries = queue.stream()
                .sorted(Comparator.comparing(Appointment::getQueueNumber, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(Appointment::getQueuedAt, Comparator.nullsLast(LocalDateTime::compareTo)))
                .map(this::mapQueueEntry)
                .toList();
        return new DoctorQueueSummaryDto(
                first.getDoctor().getId(),
                first.getDoctor().getName(),
                department.getName(),
                entries.size(),
                entries.isEmpty() ? null : entries.get(0),
                entries
        );
    }

    private com.hms.entity.Prescription resolvePrescription(String appointmentId) {
        if (prescriptionRepository == null) {
            return null;
        }
        return prescriptionRepository.findByAppointment_AppointmentId(appointmentId).orElse(null);
    }

    private QueueEntryDto mapQueueEntry(Appointment appointment) {
        return new QueueEntryDto(
                appointment.getAppointmentId(),
                appointment.getPatient() != null ? appointment.getPatient().getName() : null,
                appointment.getDoctor() != null ? appointment.getDoctor().getId() : null,
                appointment.getDoctor() != null ? appointment.getDoctor().getName() : null,
                appointment.getAppointmentTime(),
                appointment.getQueueNumber(),
                appointment.getQueueDate(),
                appointment.getStatus()
        );
    }

    private ReceptionistResponseDto mapReceptionistResponse(Receptionist receptionist) {
        return new ReceptionistResponseDto(
                receptionist.getId(),
                receptionist.getName(),
                receptionist.getEmail(),
                mapBranchResponse(receptionist.getBranch()),
                receptionist.getDepartment() != null ? receptionist.getDepartment().getId() : null,
                receptionist.getDepartment() != null ? receptionist.getDepartment().getName() : null
        );
    }

    private DoctorResponseDto mapDoctorResponse(Doctor doctor) {
        if (doctor == null) return null;
        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                Set.of(),
                mapBranchResponse(doctor.getBranch()),
                doctor.getConsultationFee(),
                doctor.getUser() != null ? doctor.getUser().getProfilePhoto() : null,
                doctor.getDoctorStampUrl()
        );
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
