package com.hms.service;

import com.hms.dto.Request.ReviewRequest;
import com.hms.dto.Response.RatingSummaryResponse;
import com.hms.dto.Response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DoctorReviewService {

    /**
     * Submit or update a review for a doctor.
     * Persists the review and publishes a Kafka event asynchronously.
     *
     * @param patientId authenticated patient's ID
     * @param doctorId  target doctor's ID
     * @param request   rating (1-5) and optional comment
     * @return persisted review data
     */
    ReviewResponse submitReview(Long patientId, Long doctorId, ReviewRequest request);

    /**
     * Paginated list of reviews for a doctor (public).
     */
    Page<ReviewResponse> getReviewsForDoctor(Long doctorId, Pageable pageable);

    /**
     * Cached rating summary for a doctor.
     * Returns zeros if no reviews exist yet.
     */
    RatingSummaryResponse getRatingSummary(Long doctorId);
}
