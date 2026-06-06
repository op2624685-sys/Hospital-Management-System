package com.hms.service;

import com.hms.dto.NotificationWebSocketPayload;
import com.hms.entity.Notification;
import com.hms.entity.Appointment;
import com.hms.entity.Patient;
import com.hms.entity.Doctor;
import com.hms.entity.type.NotificationType;
import com.hms.event.AppointmentEventType;
import com.hms.event.AppointmentKafkaEvent;
import com.hms.event.EmailKafkaEvent;
import com.hms.config.KafkaConfig;
import com.hms.repository.NotificationRepository;
import com.hms.repository.UserRepository;
import com.hms.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.kafka.core.KafkaTemplate;
import java.time.LocalDateTime;

/**
 * Service for processing appointment events from Kafka and pushing notifications via WebSocket.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationEventService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final NotificationService notificationService;
    private final AppointmentRepository appointmentRepository;
    private final KafkaTemplate<String, EmailKafkaEvent> kafkaTemplate;

    @Value("${app.appointment-details-base-url}")
    private String appointmentDetailsBaseUrl;

    // TTL for notifications in UI (24 hours)
    private static final long NOTIFICATION_TTL_HOURS = 24;

    /**
     * Process appointment event: create notification and push via WebSocket
     */
    @Transactional
    public void processAppointmentEvent(AppointmentKafkaEvent event) {
        log.info("Processing appointment event: {}", event.getEventId());

        if (event.getAppointmentId() == null) {
            log.warn("Event has no appointmentId. Event ID: {}", event.getEventId());
            return;
        }

        // Fetch full appointment with details to get patient/doctor names and emails
        Appointment appointment = appointmentRepository.findByAppointmentIdWithDetails(event.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + event.getAppointmentId()));

        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        // 1. Create Patient Notification & WebSocket Push
        NotificationType notificationType = mapEventTypeToNotificationType(event.getEventType());
        String patientTitle = getNotificationTitle(event.getEventType());
        String patientMessage = buildNotificationMessage(event);

        Notification patientNotification = Notification.builder()
                .recipient(patient.getUser())
                .type(notificationType)
                .title(patientTitle)
                .message(patientMessage)
                .appointmentId(event.getAppointmentId())
                .isRead(false)
                .eventType(event.getEventType().getValue())
                .externalEventId(event.getEventId())
                .build();

        notificationRepository.save(patientNotification);
        pushNotificationWebSocket(patientNotification, patient.getId());

        // 2. Create Doctor Notification & WebSocket Push
        String doctorTitle = getDoctorNotificationTitle(event.getEventType());
        String doctorMessage = buildDoctorNotificationMessage(event);

        Notification doctorNotification = Notification.builder()
                .recipient(doctor.getUser())
                .type(notificationType)
                .title(doctorTitle)
                .message(doctorMessage)
                .appointmentId(event.getAppointmentId())
                .isRead(false)
                .eventType(event.getEventType().getValue())
                .externalEventId(event.getEventId() + "_doc")
                .build();

        notificationRepository.save(doctorNotification);
        pushNotificationWebSocket(doctorNotification, doctor.getId());

        // 3. Send Emails to Patient and Doctor
        sendEmails(appointment, patient, doctor);

        log.info("Appointment event processed successfully. Event ID: {}", event.getEventId());
    }

    /**
     * Check if notification already exists for this event (idempotency)
     */
    public boolean notificationExistsForEvent(String externalEventId) {
        return notificationRepository.existsByExternalEventId(externalEventId);
    }

    /**
     * Push notification via WebSocket to recipient
     */
    private void pushNotificationWebSocket(Notification notification, Long recipientId) {
        try {
            LocalDateTime ttlExpiresAt = notification.getCreatedAt().plusHours(NOTIFICATION_TTL_HOURS);

            NotificationWebSocketPayload payload = NotificationWebSocketPayload.builder()
                    .notificationId(notification.getId())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .type(notification.getType())
                    .appointmentId(notification.getAppointmentId())
                    .read(notification.isRead())
                    .createdAt(notification.getCreatedAt())
                    .ttlExpiresAt(ttlExpiresAt)
                    .unreadCount(getUnreadCountWithinTTL(recipientId))
                    .build();

            // Send to user's WebSocket connection
            simpMessagingTemplate.convertAndSendToUser(
                    recipientId.toString(),
                    "/queue/notifications",
                    payload
            );

            log.info("Notification pushed via WebSocket to user: {}", recipientId);

        } catch (Exception e) {
            log.error("Failed to push notification via WebSocket. User ID: {}, Exception: {}",
                    recipientId, e.getMessage(), e);
            // Don't throw - notification is already saved in DB
        }
    }

    /**
     * Get unread notification count for user within TTL (24 hours)
     */
    private Long getUnreadCountWithinTTL(Long userId) {
        LocalDateTime ttlThreshold = LocalDateTime.now().minusHours(NOTIFICATION_TTL_HOURS);
        return notificationRepository.countByRecipient_IdAndIsReadFalseAndCreatedAtAfter(userId, ttlThreshold);
    }

    /**
     * Map AppointmentEventType to NotificationType
     */
    private NotificationType mapEventTypeToNotificationType(AppointmentEventType eventType) {
        return switch (eventType) {
            case PENDING -> NotificationType.APPOINTMENT_PENDING;
            case CONFIRMED -> NotificationType.APPOINTMENT_CONFIRMED;
            case CANCELLED -> NotificationType.APPOINTMENT_CANCELLED;
            case REFUND -> NotificationType.APPOINTMENT_REFUND;
            case RESCHEDULED -> NotificationType.APPOINTMENT_RESCHEDULED;
            default -> NotificationType.APPOINTMENT_CONFIRMED;
        };
    }

    /**
     * Get notification title based on event type
     */
    private String getNotificationTitle(AppointmentEventType eventType) {
        return switch (eventType) {
            case PENDING -> "Appointment Pending";
            case CONFIRMED -> "Appointment Confirmed";
            case CANCELLED -> "Appointment Cancelled";
            case REFUND -> "Refund Processed";
            case RESCHEDULED -> "Appointment Rescheduled";
        };
    }

    /**
     * Build detailed notification message based on event
     */
    private String buildNotificationMessage(AppointmentKafkaEvent event) {
        return switch (event.getEventType()) {
            case PENDING -> String.format("Your appointment is pending confirmation. Appointment ID: %s", 
                    event.getAppointmentId());
            case CONFIRMED -> String.format("Your appointment has been confirmed for %s", 
                    event.getAppointmentTime());
            case CANCELLED -> String.format("Your appointment has been cancelled. Reason: %s", 
                    event.getCancellationReason() != null ? event.getCancellationReason() : "Not specified");
            case REFUND -> String.format("Refund of $%.2f has been processed for appointment %s", 
                    event.getAmount(), event.getAppointmentId());
            case RESCHEDULED -> String.format("Your appointment has been rescheduled to %s", 
                    event.getRescheduledTo());
        };
    }

    private String getDoctorNotificationTitle(AppointmentEventType eventType) {
        return switch (eventType) {
            case PENDING -> "Appointment Pending";
            case CONFIRMED -> "New Appointment Booked";
            case CANCELLED -> "Patient Cancelled Appointment";
            case REFUND -> "Appointment Refunded";
            case RESCHEDULED -> "Appointment Rescheduled";
        };
    }

    private String buildDoctorNotificationMessage(AppointmentKafkaEvent event) {
        return switch (event.getEventType()) {
            case PENDING -> String.format("A new appointment is pending confirmation. Appointment ID: %s", 
                    event.getAppointmentId());
            case CONFIRMED -> String.format("A patient booked an appointment with you for %s", 
                    event.getAppointmentTime());
            case CANCELLED -> String.format("A patient has cancelled appointment %s. Reason: %s", 
                    event.getAppointmentId(),
                    event.getCancellationReason() != null ? event.getCancellationReason() : "Not specified");
            case REFUND -> String.format("Refund of $%.2f has been processed for appointment %s", 
                    event.getAmount(), event.getAppointmentId());
            case RESCHEDULED -> String.format("Appointment %s has been rescheduled to %s", 
                    event.getAppointmentId(),
                    event.getRescheduledTo());
        };
    }

    private void sendEmails(Appointment appointment, Patient patient, Doctor doctor) {
        if (StringUtils.hasText(patient.getEmail())) {
            String subject = "Appointment Booked Successfully";
            String body = String.format(
                    "Hello %s,%n%nYour appointment has been booked successfully.%nAppointment ID: %s%nDoctor: Dr. %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nThank you.",
                    patient.getName(),
                    appointment.getAppointmentId(),
                    doctor.getName(),
                    appointment.getAppointmentTime(),
                    appointment.getReason(),
                    appointment.getStatus(),
                    getAppointmentLink(appointment));
            publishEmailEvent(patient.getEmail(), subject, body);
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            String subject = "New Appointment Booked";
            String body = String.format(
                    "Hello Dr. %s,%n%nA new appointment has been booked.%nAppointment ID: %s%nPatient: %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nPlease review in HMS.",
                    doctor.getName(),
                    appointment.getAppointmentId(),
                    patient.getName(),
                    appointment.getAppointmentTime(),
                    appointment.getReason(),
                    appointment.getStatus(),
                    getAppointmentLink(appointment));
            publishEmailEvent(doctor.getEmail(), subject, body);
        }
    }

    /**
     * Publish email event to Kafka "email.outbox" topic.
     * EmailKafkaConsumer will pick it up and send via EmailService.
     * This ensures zero-loss delivery with automatic retries.
     */
    private void publishEmailEvent(String to, String subject, String body) {
        try {
            EmailKafkaEvent event = EmailKafkaEvent.create(to, subject, body);
            kafkaTemplate.send(KafkaConfig.EMAIL_OUTBOX_TOPIC, event.getEventId(), event);
            log.info("Email event published to Kafka. Event ID: {}, Recipient: {}", event.getEventId(), to);
        } catch (Exception e) {
            log.error("Failed to publish email event to Kafka. Recipient: {}, Exception: {}", to, e.getMessage(), e);
            // Log but don't throw - email publication failure shouldn't break appointment creation
        }
    }

    private String getAppointmentLink(Appointment appointment) {
        if (appointmentDetailsBaseUrl == null) {
            return appointment.getAppointmentId();
        }
        String baseUrl = appointmentDetailsBaseUrl.endsWith("/") ? appointmentDetailsBaseUrl : appointmentDetailsBaseUrl + "/";
        return baseUrl + appointment.getAppointmentId();
    }
}
