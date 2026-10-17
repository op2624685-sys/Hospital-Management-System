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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;

/**
 * Auth rules : POST → PATIENT only (enforced in WebSecurityConfig)
 *              GET  → public
 */
@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Doctor Reviews", description = "Endpoints for submitting and viewing doctor ratings and reviews")
public class ReviewController {

    private final DoctorReviewService reviewService;

    /**
     * Submit or update (upsert) a review for a specific doctor.
     * Returns 202 ACCEPTED because the rating aggregation happens asynchronously via Kafka.
     */
    @PostMapping("/doctors/{doctorId}")
    @Operation(summary = "Submit Doctor Review", description = "Allows a patient to submit or update a review and rating for a specific doctor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "202", description = "Review submitted successfully; processing asynchronously"),
        @ApiResponse(responseCode = "400", description = "Invalid review data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access")
    })
    public ResponseEntity<ReviewResponse> submitReview(
            @Parameter(description = "ID of the doctor being reviewed") @PathVariable Long doctorId,
            @Valid @RequestBody ReviewRequest request) {

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        ReviewResponse response = reviewService.submitReview(currentUser.getId(), doctorId, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    /**
     * Paginated list of reviews for a doctor — publicly accessible.
     */
    @GetMapping("/doctors/{doctorId}")
    @Operation(summary = "Get Doctor Reviews", description = "Retrieves a paginated list of all public reviews for a specific doctor")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Reviews retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"), @ApiResponse(responseCode = "404", description = "Doctor not found") })
    public ResponseEntity<Page<ReviewResponse>> getReviewsForDoctor(
            @Parameter(description = "ID of the doctor whose reviews are being retrieved") @PathVariable Long doctorId,
            @Parameter(description = "Page index") @RequestParam(defaultValue = "0")  int page,
            @Parameter(description = "Records per page") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reviewService.getReviewsForDoctor(doctorId, pageable));
    }

    /**
     * Cached rating summary (avg rating + total count) — served from Redis.
     */
    @GetMapping("/doctors/{doctorId}/summary")
    @Operation(summary = "Get Rating Summary", description = "Retrieves the aggregated average rating and total review count for a doctor (cached in Redis)")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Rating summary retrieved successfully"), @ApiResponse(responseCode = "404", description = "Doctor not found") })
    public ResponseEntity<RatingSummaryResponse> getRatingSummary(@PathVariable Long doctorId) {
        return ResponseEntity.ok(reviewService.getRatingSummary(doctorId));
    }
}
