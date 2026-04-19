package com.hms.controller;

import com.hms.dto.Request.ReviewRequest;
import com.hms.dto.Response.RatingSummaryResponse;
import com.hms.dto.Response.ReviewResponse;
import com.hms.entity.User;
import com.hms.service.DoctorReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Auth rules : POST → PATIENT only (enforced in WebSecurityConfig)
 *              GET  → public
 */
@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final DoctorReviewService reviewService;

    /**
     * Submit or update (upsert) a review for a specific doctor.
     * Returns 202 ACCEPTED because the rating aggregation happens asynchronously via Kafka.
     */
    @PostMapping("/doctors/{doctorId}")
    public ResponseEntity<ReviewResponse> submitReview(
            @PathVariable Long doctorId,
            @Valid @RequestBody ReviewRequest request) {

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        ReviewResponse response = reviewService.submitReview(currentUser.getId(), doctorId, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    /**
     * Paginated list of reviews for a doctor — publicly accessible.
     */
    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<Page<ReviewResponse>> getReviewsForDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reviewService.getReviewsForDoctor(doctorId, pageable));
    }

    /**
     * Cached rating summary (avg rating + total count) — served from Redis.
     */
    @GetMapping("/doctors/{doctorId}/summary")
    public ResponseEntity<RatingSummaryResponse> getRatingSummary(@PathVariable Long doctorId) {
        return ResponseEntity.ok(reviewService.getRatingSummary(doctorId));
    }
}
