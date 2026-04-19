package com.hms.event;

import com.hms.entity.DoctorRatingSummary;
import com.hms.repository.DoctorRatingSummaryRepository;
import com.hms.repository.DoctorReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Kafka consumer for doctor rating events.
 *
 * Responsibilities:
 *  1. Recompute the doctor's aggregate rating from the source-of-truth DB query.
 *  2. Upsert DoctorRatingSummary.
 *  3. Evict the Redis cache so the next read gets fresh data.
 *  4. Manually ACK the offset — only after all of the above succeed.
 *
 * concurrency = "3" is declared in KafkaConfig's ContainerFactory,
 * giving one consumer thread per partition (3 partitions → max parallelism).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RatingEventConsumer {

    private final DoctorReviewRepository       reviewRepository;
    private final DoctorRatingSummaryRepository summaryRepository;

    @KafkaListener(
            topics  = "doctor-rating-events",
            groupId = "rating-aggregator"
    )
    @Transactional
    @CacheEvict(value = "doctorRating", key = "#event.doctorId()")
    public void consume(RatingEvent event, Acknowledgment ack) {
        Long doctorId = event.doctorId();
        log.info("Consuming {} RatingEvent for doctorId={}", event.eventType(), doctorId);

        try {
            // 1. Re-aggregate from DB (single-row query — O(n reviews) but fast)
            Object[] agg = reviewRepository.aggregateForDoctor(doctorId);
            long count = agg[0] != null ? ((Number) agg[0]).longValue() : 0L;
            long stars = agg[1] != null ? ((Number) agg[1]).longValue() : 0L;
            double avg = count > 0 ? (double) stars / count : 0.0;

            // 2. Upsert DoctorRatingSummary
            DoctorRatingSummary summary = summaryRepository.findById(doctorId)
                    .orElse(DoctorRatingSummary.builder().doctorId(doctorId).build());
            summary.setTotalReviews(count);
            summary.setTotalStars(stars);
            summary.setAverageRating(avg);
            summaryRepository.save(summary);

            log.info("Updated DoctorRatingSummary: doctorId={}, avgRating={}, totalReviews={}", doctorId, avg, count);

            // 3. Manual offset commit — only after successful DB write
            ack.acknowledge();

        } catch (Exception ex) {
            log.error("Failed to process RatingEvent for doctorId={}: {}", doctorId, ex.getMessage(), ex);
            // Do NOT ack → Kafka will redeliver the message
            throw ex;
        }
    }
}
