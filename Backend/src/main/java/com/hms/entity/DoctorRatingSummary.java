package com.hms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Aggregated rating summary per doctor.
 * Maintained asynchronously by the Kafka RatingEventConsumer.
 * The doctorId is the primary key and shares the same value as Doctor.id.
 */
@Entity
@Table(name = "doctor_rating_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorRatingSummary {

    /** Shared PK with Doctor (not a FK join — just matching ID). */
    @Id
    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(nullable = false)
    @Builder.Default
    private long totalReviews = 0L;

    @Column(nullable = false)
    @Builder.Default
    private long totalStars = 0L;

    /** Always recomputed as totalStars / totalReviews. */
    @Column(nullable = false)
    @Builder.Default
    private double averageRating = 0.0;

    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
