package com.hms.event;

import java.io.Serializable;

/**
 * Kafka event published after a patient submits or updates a doctor review.
 * Partitioned by doctorId so all events for a given doctor land in the same partition
 * — ensuring ordered, idempotent aggregation in the consumer.
 */
public record RatingEvent(
        Long doctorId,
        Long patientId,
        Long reviewId,
        int  rating,
        String eventType   // "CREATED" | "UPDATED"
) implements Serializable {}
