package com.hms.dto.Response;

public record RatingSummaryResponse(
        Long   doctorId,
        double averageRating,
        long   totalReviews
) {}
