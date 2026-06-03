package com.hms.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Kafka event payload for appointment notifications.
 * Used across all 5 Kafka topics: appointment.pending, .confirmed, .cancelled, .refund, .rescheduled
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AppointmentKafkaEvent implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    // Event metadata
    private String eventId;  // UUID for idempotency
    private AppointmentEventType eventType;
    private LocalDateTime eventTimestamp;
    
    // Appointment data
    private String appointmentId;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentTime;
    private String reason;
    private String status;
    private Double amount;
    private Long branchId;
    private Long departmentId;
    
    // Additional fields
    private String cancellationReason;  // For CANCELLED/REFUND events
    private LocalDateTime rescheduledTo;  // For RESCHEDULED events
    
    /**
     * Generate a new event with default timestamp and event ID
     */
    public static AppointmentKafkaEvent create(AppointmentEventType eventType) {
        return AppointmentKafkaEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .eventTimestamp(LocalDateTime.now())
                .build();
    }
}
