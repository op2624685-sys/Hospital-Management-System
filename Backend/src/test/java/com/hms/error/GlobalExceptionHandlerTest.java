package com.hms.error;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handlesAppExceptionWithStandardPayload() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/doctor/profile");
        MDC.put("traceId", "trace-123");
        try {
            var response = handler.handleAppException(new NotFoundException("Doctor missing"), request);
            ApiError body = response.getBody();
            assertNotNull(body);
            assertEquals(HttpStatus.NOT_FOUND.value(), body.getStatus());
            assertEquals(ErrorCode.NOT_FOUND.name(), body.getCode());
            assertEquals("Doctor missing", body.getMessage());
            assertEquals("/doctor/profile", body.getPath());
            assertEquals("trace-123", body.getTraceId());
        } finally {
            MDC.clear();
        }
    }
}
