package com.hms.error;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response object for rate limit exceeded errors
 */
@Data
@AllArgsConstructor
public class RateLimitExceededResponse {
    private String error;
    private String message;
    private long retryAfterSeconds;

    public RateLimitExceededResponse(String error, String message) {
        this.error = error;
        this.message = message;
        this.retryAfterSeconds = 60;
    }
}
