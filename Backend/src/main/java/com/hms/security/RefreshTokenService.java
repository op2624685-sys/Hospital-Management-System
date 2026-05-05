package com.hms.security;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.hms.error.UnauthorizedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    
    private final RedisTemplate<String, Object> redisTemplate;

    private static final long REFRESH_TOKEN_TTL = 7;  // days

    public String createRefreshToken(Long userId) {

        String refreshToken = UUID.randomUUID().toString();

        String key = "refresh-token:" + refreshToken;

        redisTemplate.opsForValue().set(
                key,
                userId,
                REFRESH_TOKEN_TTL,
                TimeUnit.DAYS);

        return refreshToken;
    }

    public Long validateRefreshToken(String token) {
        String key = "refresh-token:" + token;

        Object userId = redisTemplate.opsForValue().get(key);

        if (userId == null) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        if (userId instanceof Number number) {
            return number.longValue();
        }

        if (userId instanceof String value) {
            try {
                return Long.parseLong(value);
            } catch (NumberFormatException ex) {
                throw new UnauthorizedException("Invalid refresh token payload");
            }
        }

        throw new UnauthorizedException("Invalid refresh token payload");
    }

    public void deleteToken(String token) {
        redisTemplate.delete("refresh-token:" + token);
    }
}
