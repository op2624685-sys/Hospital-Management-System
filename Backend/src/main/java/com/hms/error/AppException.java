package com.hms.error;

import org.springframework.http.HttpStatus;

public abstract class AppException extends RuntimeException {

    private final ErrorCode code;
    private final HttpStatus status;

    protected AppException(ErrorCode code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public ErrorCode getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
