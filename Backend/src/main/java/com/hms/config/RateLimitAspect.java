package com.hms.config;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * AOP Aspect for applying rate limiting to methods annotated with @RateLimitProtected
 * Handles rate limit exceeded responses gracefully
 */
@Aspect
@Component
public class RateLimitAspect {

    @Autowired
    private RateLimiterRegistry rateLimiterRegistry;

    @Around("@annotation(rateLimitProtected)")
    public Object rateLimit(ProceedingJoinPoint joinPoint, RateLimitProtected rateLimitProtected) throws Throwable {
        String limiterName = rateLimitProtected.limiterName();
        RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(limiterName);

        if (!rateLimiter.acquirePermission()) {
            com.hms.error.RateLimitExceededResponse response = 
                    new com.hms.error.RateLimitExceededResponse(
                    "RATE_LIMIT_EXCEEDED",
                    "You have exceeded the rate limit. Maximum requests per minute exceeded.",
                    60
            );
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }

        return joinPoint.proceed();
    }
}
