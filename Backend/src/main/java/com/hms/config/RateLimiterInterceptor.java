package com.hms.config;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * Global Rate Limiter Interceptor
 * Applies rate limiting to all incoming requests based on client IP
 */
@Component
@Slf4j
public class RateLimiterInterceptor implements HandlerInterceptor {

    @Autowired
    private RateLimiterRegistry rateLimiterRegistry;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = request.getRemoteAddr();

        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = "unknown";
        }

        clientIp = clientIp.replace(":", "_");
        
        String rateLimiterName = "clientRateLimiter_" + clientIp;

        try {
            RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(rateLimiterName, () ->
                    io.github.resilience4j.ratelimiter.RateLimiterConfig.custom()
                            .limitRefreshPeriod(java.time.Duration.ofMinutes(1))
                            .limitForPeriod(10)
                            .timeoutDuration(java.time.Duration.ofSeconds(1))
                            .build()
            );

            if (!rateLimiter.acquirePermission()) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Rate limit exceeded. Maximum 10 requests per minute allowed.\"}");
                response.getWriter().flush();
                return false;
            }
        } catch (Exception e) {
            // Log and allow request if rate limiter fails
            log.error("Rate limiter error: " + e.getMessage());
        }

        return true;
    }
}
