package com.hms.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.mockito.ArgumentCaptor;

import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.hms.error.UnauthorizedException;
import com.hms.security.RefreshTokenService;

@ExtendWith(MockitoExtension.class)
public class RefreshTokenServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        refreshTokenService = new RefreshTokenService(redisTemplate);
    }

    @Test
    void createRefreshToken_shouldStoreTokenInRedisWithCorrectKeyPrefix() {
        // Arrange
        Long userId = 123L;

        // Act
        String token = refreshTokenService.createRefreshToken(userId);

        // Assert
        assertNotNull(token);
        assertFalse(token.isBlank());
        
        // Verify Redis was called with correct key prefix
        verify(valueOperations).set(
                argThat(key -> key.startsWith("refresh-token:")),
                eq(userId),
                eq(7L),
                eq(TimeUnit.DAYS)
        );
    }

    @Test
    void validateRefreshToken_shouldReturnUserIdWhenTokenValid() {
        // Arrange
        String token = "valid-token-123";
        Long expectedUserId = 456L;
        String expectedKey = "refresh-token:" + token;

        when(valueOperations.get(expectedKey)).thenReturn(expectedUserId);

        // Act
        Long userId = refreshTokenService.validateRefreshToken(token);

        // Assert
        assertEquals(expectedUserId, userId);
        verify(valueOperations).get(expectedKey);
    }

    @Test
    void validateRefreshToken_shouldUseCorrectKeyPrefix() {
        // Arrange
        String token = "test-token";
        Long userId = 789L;
        
        when(valueOperations.get("refresh-token:" + token)).thenReturn(userId);

        // Act
        refreshTokenService.validateRefreshToken(token);

        // Assert - Verify the correct key prefix was used
        verify(valueOperations).get("refresh-token:" + token);
        verify(valueOperations, never()).get("refresh:" + token);
    }

    @Test
    void validateRefreshToken_shouldThrowExceptionWhenTokenInvalid() {
        // Arrange
        String token = "invalid-token";
        String key = "refresh-token:" + token;

        when(valueOperations.get(key)).thenReturn(null);

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            refreshTokenService.validateRefreshToken(token);
        });

        assertEquals("Invalid or expired refresh token", exception.getMessage());
    }

    @Test
    void validateRefreshToken_shouldThrowExceptionWhenTokenExpired() {
        // Arrange
        String token = "expired-token";
        String key = "refresh-token:" + token;

        when(valueOperations.get(key)).thenReturn(null);

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            refreshTokenService.validateRefreshToken(token);
        });

        assertEquals("Invalid or expired refresh token", exception.getMessage());
        verify(valueOperations).get(key);
    }

    @Test
    void deleteToken_shouldDeleteTokenWithCorrectKeyPrefix() {
        // Arrange
        String token = "token-to-delete";
        String expectedKey = "refresh-token:" + token;
        when(redisTemplate.delete(expectedKey)).thenReturn(true);

        // Act
        refreshTokenService.deleteToken(token);

        // Assert
        verify(redisTemplate).delete(expectedKey);
    }

    @Test
    void deleteToken_shouldUseCorrectKeyPrefix() {
        // Arrange
        String token = "test-delete-token";
        when(redisTemplate.delete("refresh-token:" + token)).thenReturn(true);

        // Act
        refreshTokenService.deleteToken(token);

        // Assert - Verify the correct key prefix was used
        verify(redisTemplate).delete("refresh-token:" + token);
        verify(redisTemplate, never()).delete("refresh:" + token);
    }

    @Test
    void createAndValidateToken_shouldMaintainConsistentKeyPrefix() {
        // Arrange
        Long userId = 999L;
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);

        // Setup for create - void method doesn't need thenReturn
        doNothing().when(valueOperations).set(anyString(), eq(userId), eq(7L), eq(TimeUnit.DAYS));

        // Act - Create token
        String token = refreshTokenService.createRefreshToken(userId);

        // Verify and capture the key used
        verify(valueOperations).set(keyCaptor.capture(), eq(userId), eq(7L), eq(TimeUnit.DAYS));
        String createdKey = keyCaptor.getValue();

        // Arrange for validate
        when(valueOperations.get(createdKey)).thenReturn(userId);

        // Act - Validate token
        Long retrievedUserId = refreshTokenService.validateRefreshToken(token);

        // Assert
        assertEquals(userId, retrievedUserId);
        assertTrue(createdKey.startsWith("refresh-token:"));
    }

    @Test
    void tokenLifecycle_createValidateDelete_shouldBeConsistent() {
        // Arrange
        Long userId = 555L;
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);

        doNothing().when(valueOperations).set(anyString(), eq(userId), eq(7L), eq(TimeUnit.DAYS));

        // Act - Step 1: Create token
        String token = refreshTokenService.createRefreshToken(userId);

        // Verify and capture the key used during create
        verify(valueOperations).set(keyCaptor.capture(), eq(userId), eq(7L), eq(TimeUnit.DAYS));
        String createdKey = keyCaptor.getValue();

        // Act - Step 2: Validate token
        when(valueOperations.get(createdKey)).thenReturn(userId);
        Long retrievedUserId = refreshTokenService.validateRefreshToken(token);

        // Act - Step 3: Delete token
        refreshTokenService.deleteToken(token);

        // Assert
        assertEquals(userId, retrievedUserId);
        verify(redisTemplate).delete(createdKey);
        assertTrue(createdKey.startsWith("refresh-token:"));
    }

    @Test
    void validateRefreshToken_shouldReturnCastedLongValue() {
        // Arrange
        String token = "test-token";
        Long expectedUserId = 12345L;
        
        when(valueOperations.get("refresh-token:" + token)).thenReturn(expectedUserId);

        // Act
        Long result = refreshTokenService.validateRefreshToken(token);

        // Assert
        assertNotNull(result);
        assertEquals(expectedUserId, result);
        assertInstanceOf(Long.class, result);
    }

    @Test
    void validateRefreshToken_shouldConvertIntegerUserIdFromRedis() {
        // Arrange
        String token = "integer-user-id-token";

        when(valueOperations.get("refresh-token:" + token)).thenReturn(12345);

        // Act
        Long result = refreshTokenService.validateRefreshToken(token);

        // Assert
        assertEquals(12345L, result);
    }

    @Test
    void validateRefreshToken_shouldConvertStringUserIdFromRedis() {
        // Arrange
        String token = "string-user-id-token";

        when(valueOperations.get("refresh-token:" + token)).thenReturn("12345");

        // Act
        Long result = refreshTokenService.validateRefreshToken(token);

        // Assert
        assertEquals(12345L, result);
    }

    @Test
    void validateRefreshToken_shouldRejectInvalidUserIdPayload() {
        // Arrange
        String token = "bad-user-id-token";

        when(valueOperations.get("refresh-token:" + token)).thenReturn("abc");

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            refreshTokenService.validateRefreshToken(token);
        });

        assertEquals("Invalid refresh token payload", exception.getMessage());
    }

    @Test
    void createRefreshToken_shouldGenerateUniqueTokens() {
        // Arrange
        Long userId1 = 100L;
        Long userId2 = 200L;

        // Act
        String token1 = refreshTokenService.createRefreshToken(userId1);
        String token2 = refreshTokenService.createRefreshToken(userId2);

        // Assert
        assertNotEquals(token1, token2);
        assertFalse(token1.isBlank());
        assertFalse(token2.isBlank());
    }

    @Test
    void deleteToken_shouldNotThrowExceptionWhenTokenDoesNotExist() {
        // Arrange
        String token = "non-existent-token";
        String expectedKey = "refresh-token:" + token;
        when(redisTemplate.delete(expectedKey)).thenReturn(false);

        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> refreshTokenService.deleteToken(token));
        verify(redisTemplate).delete(expectedKey);
    }
}
