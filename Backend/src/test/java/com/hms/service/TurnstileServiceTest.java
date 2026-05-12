package com.hms.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
public class TurnstileServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TurnstileService turnstileService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(turnstileService, "secretKey", "test-secret-key");
    }

    @Test
    void verify_shouldReturnTrue_whenCloudflareReturnsSuccess() {
        // Arrange
        String token = "valid-token";
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);

        when(restTemplate.postForObject(any(String.class), any(), eq(Map.class)))
                .thenReturn(response);

        // Act
        boolean result = turnstileService.verify(token);

        // Assert
        assertTrue(result);
        verify(restTemplate).postForObject(eq("https://challenges.cloudflare.com/turnstile/v0/siteverify"), any(), eq(Map.class));
    }

    @Test
    void verify_shouldReturnFalse_whenCloudflareReturnsFailure() {
        // Arrange
        String token = "invalid-token";
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error-codes", "invalid-input-response");

        when(restTemplate.postForObject(any(String.class), any(), eq(Map.class)))
                .thenReturn(response);

        // Act
        boolean result = turnstileService.verify(token);

        // Assert
        assertFalse(result);
    }

    @Test
    void verify_shouldReturnFalse_whenTokenIsBlank() {
        // Act & Assert
        assertFalse(turnstileService.verify(""));
        assertFalse(turnstileService.verify(null));
        
        verify(restTemplate, never()).postForObject(any(String.class), any(), any());
    }

    @Test
    void verify_shouldReturnFalse_whenExceptionOccurs() {
        // Arrange
        when(restTemplate.postForObject(any(String.class), any(), eq(Map.class)))
                .thenThrow(new RuntimeException("Network error"));

        // Act
        boolean result = turnstileService.verify("some-token");

        // Assert
        assertFalse(result);
    }
}
