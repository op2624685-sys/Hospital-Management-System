package com.hms.error;

import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;

import lombok.Data;

@Data
public class ApiError {

    // Legacy fields kept for backward compatibility with existing frontend handlers.
    private String error;
    private HttpStatus statusCode;

    private LocalDateTime timestamp;
    private int status;
    private String code;
    private String message;
    private String path;
    private String traceId;

    public ApiError(int status, String code, String message, String path, String traceId) {
        this.timestamp = LocalDateTime.now();
        this.error = message;
        this.statusCode = HttpStatus.valueOf(status);
        this.status = status;
        this.code = code;
        this.message = message;
        this.path = path;
        this.traceId = traceId;
    }
}
