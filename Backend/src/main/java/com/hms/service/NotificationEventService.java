package com.hms.service;

import com.hms.dto.NotificationWebSocketPayload;
import com.hms.entity.Notification;
import com.hms.entity.User;
import com.hms.entity.type.NotificationType;
import com.hms.event.AppointmentEventType;
import com.hms.event.AppointmentKafkaEvent;
import com.hms.repository.NotificationRepository;
import com.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    // TTL for notifications in UI (24 hours)
    private static final long NOTIFICATION_TTL_HOURS = 24;

    /**
     * Process appointment event: create notification and push via WebSocket
     */
    @Transactional
    public void processAppointmentEvent(AppointmentKafkaEvent event) {
        log.info("Processing appointment event: {}", event.getEventId());

        // Validate event data
        if (event.getPatientId() == null) {
            log.warn("Event has no patientId. Event ID: {}", event.getEventId());
            return;
        }

        // Get patient (recipient)
        User recipient = userRepository.findById(event.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found: " + event.getPatientId()));

        // Build notification based on event type
        String title = getNotificationTitle(event.getEventType());
        String message = buildNotificationMessage(event);
        NotificationType notificationType = mapEventTypeToNotificationType(event.getEventType());

        // Create notification entity
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(notificationType)
                .title(title)
                .message(message)
                .appointmentId(event.getAppointmentId())
                .isRead(false)
                .eventType(event.getEventType().getValue())
                .externalEventId(event.getEventId())
                .build();

        // Save to database
        notification = notificationRepository.save(notification);
        log.info("Notification saved to DB. ID: {}, Event ID: {}", notification.getId(), event.getEventId());

        // Push via WebSocket
        pushNotificationWebSocket(notification, recipient.getId());

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
}
