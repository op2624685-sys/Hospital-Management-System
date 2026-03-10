package com.hms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * Enables AspectJ auto-proxying for AOP functionality
 * This allows the @RateLimitProtected annotation to work on methods
 */
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
}
