package com.hms.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom annotation for applying rate limiting to specific endpoints
 * Usage: @RateLimitProtected(limiterName = "authRateLimiter")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimitProtected {
    String limiterName() default "globalRateLimiter";
}
