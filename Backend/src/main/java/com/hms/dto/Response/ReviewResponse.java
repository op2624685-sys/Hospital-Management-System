package com.hms.dto.Response;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long          id,
        String        patientName,
        int           rating,
        String        comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
