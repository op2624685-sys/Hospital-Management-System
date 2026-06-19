package com.hms.event.consumer;

import com.hms.event.EmailKafkaEvent;
import com.hms.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

/**
 * Kafka consumer for email events.
 * Listens to "email.outbox" topic and sends emails via EmailService.
 * 
 * Benefits over @Async:
 * - Guaranteed delivery (Kafka persists messages)
 * - Automatic retry on failure
 * - Horizontal scalability (multiple consumer instances)
 * - Zero message loss even if app crashes
 * - Easy monitoring and debugging
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailKafkaConsumer {
    
    private final EmailService emailService;
    
    /**
     * Process email events from Kafka topic.
     * Note: EmailService.sendMail() is now SYNCHRONOUS (no @Async)
     * because Kafka consumer already runs on a separate thread pool.
     */
    @KafkaListener(
            topics = "email.outbox",
            groupId = "email-consumer-group",
            properties = {
                "spring.json.value.default.type=com.hms.event.EmailKafkaEvent",
                "spring.json.trusted.packages=com.hms.event",
                "spring.json.use.type.headers=false"
            }
    )
    public void consumeEmailEvent(EmailKafkaEvent event, Acknowledgment ack) {
        try {
            log.info("Processing email event: {} to recipient: {}", event.getEventId(), event.getTo());
            
            // Send email synchronously - Kafka handles async delivery
            emailService.sendMail(event.getTo(), event.getSubject(), event.getBody());
            
            // Manually acknowledge the message to commit offset
            ack.acknowledge();
            
            log.info("Email sent successfully. Event ID: {}, Recipient: {}", event.getEventId(), event.getTo());
        } catch (Exception e) {
            log.error("Failed to send email. Event ID: {}, Recipient: {}, Error: {}", 
                    event.getEventId(), event.getTo(), e.getMessage(), e);
            // Kafka will retry based on consumer group configuration
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
