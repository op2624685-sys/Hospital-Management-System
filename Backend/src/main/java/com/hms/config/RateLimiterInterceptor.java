package com.hms.config;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Global Rate Limiter Interceptor
 * Applies rate limiting to all incoming requests based on client IP
 */
@Component
public class RateLimiterInterceptor implements HandlerInterceptor {

    @Autowired
    private RateLimiterRegistry rateLimiterRegistry;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = getClientIP(request);
        String rateLimiterName = "clientRateLimiter_" + clientIp;

        try {
            RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(rateLimiterName, () ->
                    io.github.resilience4j.ratelimiter.RateLimiterConfig.custom()
                            .limitRefreshPeriod(java.time.Duration.ofMinutes(1))
                            .limitForPeriod(100)
                            .timeoutDuration(java.time.Duration.ofSeconds(1))
                            .build()
            );

            if (!rateLimiter.acquirePermission()) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Rate limit exceeded. Maximum 100 requests per minute allowed.\"}");
                response.getWriter().flush();
                return false;
            }
        } catch (Exception e) {
            // Log and allow request if rate limiter fails
            System.err.println("Rate limiter error: " + e.getMessage());
        }

        return true;
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
