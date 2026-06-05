package com.hms.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Kafka event payload for email notifications.
 * Published to "email.outbox" topic by NotificationEventService
 * Consumed by EmailKafkaConsumer for reliable email delivery.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailKafkaEvent implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    // Event metadata
    private String eventId;  // UUID for idempotency
    private LocalDateTime eventTimestamp;
    
    // Email content
    private String to;
    private String subject;
    private String body;
    
    /**
     * Create a new email event with default timestamp and event ID
     */
    public static EmailKafkaEvent create(String to, String subject, String body) {
        return EmailKafkaEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .to(to)
                .subject(subject)
                .body(body)
                .eventTimestamp(LocalDateTime.now())
                .build();
    }
}
