package com.hms.kafka;

import com.hms.event.AppointmentKafkaEvent;
import com.hms.service.NotificationEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Kafka consumer for appointment events.
 * Listens to all appointment-related topics and processes notifications.
 * Implements idempotency to prevent duplicate notifications.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationEventService notificationEventService;

    /**
     * Handle appointment events from all 5 topics
     * Topics: appointment.pending, appointment.confirmed, appointment.cancelled, appointment.refund, appointment.rescheduled
     */
    @KafkaListener(
        topics = {
            "appointment.pending",
            "appointment.confirmed",
            "appointment.cancelled",
            "appointment.refund",
            "appointment.rescheduled"
        },
        groupId = "notification-consumer-group",
        properties = {
            "spring.json.value.default.type=com.hms.event.AppointmentKafkaEvent",
            "spring.json.trusted.packages=com.hms.event",
            "spring.json.use.type.headers=false"
        }
    )
    public void handleAppointmentEvent(
            @Payload AppointmentKafkaEvent event,
            Acknowledgment ack,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        try {
            log.info("Received appointment event from topic: {}. Event ID: {}, Type: {}, Appointment ID: {}",
                    topic, event.getEventId(), event.getEventType(), event.getAppointmentId());

            // Check idempotency: if notification already exists with this event ID, skip
            if (notificationEventService.notificationExistsForEvent(event.getEventId())) {
                log.warn("Notification already exists for event ID: {}. Skipping duplicate processing.", event.getEventId());
                ack.acknowledge();
                return;
            }

            // Process the event and create notification
            notificationEventService.processAppointmentEvent(event);

            // Manually acknowledge the message
            ack.acknowledge();
            
            log.info("Successfully processed appointment event. Event ID: {}, Partition: {}, Offset: {}",
                    event.getEventId(), partition, offset);

        } catch (Exception e) {
            log.error("Error processing appointment event. Event ID: {}, Topic: {}, Exception: {}",
                    event.getEventId(), topic, e.getMessage(), e);
            
            // Rethrow to trigger retry mechanism
            throw new RuntimeException("Failed to process appointment event: " + event.getEventId(), e);
        }
    }
}
