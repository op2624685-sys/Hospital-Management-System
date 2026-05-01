package com.hms.dto.Response;

import java.io.Serializable;

public record RatingSummaryResponse(
        Long   doctorId,
        double averageRating,
        long   totalReviews
) implements Serializable {}
