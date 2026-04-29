package com.hms.security;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

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
            throw new RuntimeException("Invalid or expired refresh token");
        }

        return (Long) userId;
    }

    public void deleteToken(String token) {
        redisTemplate.delete("refresh-token:" + token);
    }
}
