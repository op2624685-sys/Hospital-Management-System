package com.hms.event;

import java.time.LocalDateTime;
import java.util.List;

import com.hms.dto.ReceptionistQueueWebSocketPayload;
import com.hms.dto.Response.DoctorQueueSummaryDto;
import com.hms.entity.Appointment;
import com.hms.entity.Receptionist;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.ReceptionistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReceptionistQueueNotificationListener {

    private final AppointmentRepository appointmentRepository;
    private final ReceptionistRepository receptionistRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleQueueUpdate(ReceptionistQueueUpdatedEvent event) {
        if (event.getDepartmentId() == null || event.getBranchId() == null || event.getQueueDate() == null) {
            return;
        }

        Receptionist receptionist = receptionistRepository.findByDepartment_Id(event.getDepartmentId())
                .filter(item -> item.getBranch() != null && event.getBranchId().equals(item.getBranch().getId()))
                .orElse(null);

        if (receptionist == null) {
            log.warn("No receptionist found for queue update. departmentId={}, branchId={}",
                    event.getDepartmentId(), event.getBranchId());
            return;
        }

        List<Appointment> queued = appointmentRepository.findAllQueuedForDepartment(
                event.getBranchId(),
                event.getDepartmentId(),
                event.getQueueDate(),
                AppointmentStatusType.QUEUED);

        List<DoctorQueueSummaryDto> queue = queued.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        appointment -> appointment.getDoctor().getId(),
                        java.util.LinkedHashMap::new,
                        java.util.stream.Collectors.toList()))
                .values()
                .stream()
                .map(items -> mapDoctorQueueSummary(items))
                .toList();

        ReceptionistQueueWebSocketPayload payload = ReceptionistQueueWebSocketPayload.builder()
                .branchId(event.getBranchId())
                .departmentId(event.getDepartmentId())
                .departmentName(receptionist.getDepartment() != null ? receptionist.getDepartment().getName() : null)
                .queueDate(event.getQueueDate())
                .updatedAt(LocalDateTime.now())
                .queue(queue)
                .updatedAppointment(loadUpdatedAppointment(event.getAppointmentId(), event.getBranchId(), event.getDepartmentId()))
                .build();

        simpMessagingTemplate.convertAndSendToUser(
                receptionist.getId().toString(),
                "/queue/receptionist-queue",
                payload
        );

        log.info("Queue update pushed via WebSocket to receptionist: {}, departmentId: {}",
                receptionist.getId(), event.getDepartmentId());
    }

    private DoctorQueueSummaryDto mapDoctorQueueSummary(List<Appointment> queue) {
        Appointment first = queue.get(0);
        List<com.hms.dto.Response.QueueEntryDto> entries = queue.stream()
                .sorted(java.util.Comparator.comparing(Appointment::getQueueNumber, java.util.Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(Appointment::getQueuedAt, java.util.Comparator.nullsLast(java.time.LocalDateTime::compareTo)))
                .map(appointment -> new com.hms.dto.Response.QueueEntryDto(
                        appointment.getAppointmentId(),
                        appointment.getPatient() != null ? appointment.getPatient().getName() : null,
                        appointment.getDoctor() != null ? appointment.getDoctor().getId() : null,
                        appointment.getDoctor() != null ? appointment.getDoctor().getName() : null,
                        appointment.getAppointmentTime(),
                        appointment.getQueueNumber(),
                        appointment.getQueueDate(),
                        appointment.getStatus()
                ))
                .toList();

        return new DoctorQueueSummaryDto(
                first.getDoctor().getId(),
                first.getDoctor().getName(),
                first.getDepartment() != null ? first.getDepartment().getName() : null,
                entries.size(),
                entries.isEmpty() ? null : entries.get(0),
                entries
        );
    }

    private com.hms.dto.Response.AppointmentResponseDto loadUpdatedAppointment(String appointmentId, Long branchId, Long departmentId) {
        if (appointmentId == null) {
            return null;
        }

        return appointmentRepository.findByAppointmentIdAndBranch_IdAndDepartment_Id(
                        appointmentId,
                        branchId,
                        departmentId)
                .map(appointment -> new com.hms.dto.Response.AppointmentResponseDto(
                        appointment.getAppointmentId(),
                        appointment.getAppointmentTime(),
                        appointment.getReason(),
                        appointment.getAmount(),
                        appointment.getDoctor() != null ? new com.hms.dto.Response.DoctorResponseDto(
                                appointment.getDoctor().getId(),
                                appointment.getDoctor().getName(),
                                appointment.getDoctor().getSpecialization(),
                                appointment.getDoctor().getEmail(),
                                java.util.Set.of(),
                                appointment.getDoctor().getBranch() != null ? new com.hms.dto.Response.BranchResponseDto(
                                        appointment.getDoctor().getBranch().getId(),
                                        appointment.getDoctor().getBranch().getName(),
                                        appointment.getDoctor().getBranch().getAddress(),
                                        appointment.getDoctor().getBranch().getEmail(),
                                        appointment.getDoctor().getBranch().getContactNumber()
                                ) : null,
                                appointment.getDoctor().getConsultationFee(),
                                appointment.getDoctor().getUser() != null ? appointment.getDoctor().getUser().getProfilePhoto() : null,
                                appointment.getDoctor().getDoctorStampUrl()
                        ) : null,
                        appointment.getStatus(),
                        appointment.getPatient() != null ? new com.hms.dto.Response.PatientResponseDto(
                                appointment.getPatient().getId(),
                                appointment.getPatient().getName(),
                                appointment.getPatient().getBirthDate() != null ? appointment.getPatient().getBirthDate().toString() : null,
                                appointment.getPatient().getGender() != null ? appointment.getPatient().getGender().name() : null,
                                appointment.getPatient().getBloodGroup() != null ? appointment.getPatient().getBloodGroup().name() : null,
                                appointment.getPatient().getEmail()
                        ) : null,
                        appointment.getBranch() != null ? new com.hms.dto.Response.BranchResponseDto(
                                appointment.getBranch().getId(),
                                appointment.getBranch().getName(),
                                appointment.getBranch().getAddress(),
                                appointment.getBranch().getEmail(),
                                appointment.getBranch().getContactNumber()
                        ) : null,
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
                        false,
                        null,
                        null))
                .orElse(null);
    }
}
