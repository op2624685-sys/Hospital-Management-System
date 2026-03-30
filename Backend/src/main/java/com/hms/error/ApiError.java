package com.hms.error;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ApiError {

    private LocalDateTime timestamp;
    private int status;
    private String code;
    private String message;
    private String path;
    private String traceId;

    public ApiError(int status, String code, String message, String path, String traceId) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.code = code;
        this.message = message;
        this.path = path;
        this.traceId = traceId;
    }
}
