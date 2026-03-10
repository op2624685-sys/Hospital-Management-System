package com.hms.config;

import org.springframework.context.annotation.Configuration;

/**
 * Rate Limiter Configuration for HMS Application
 * Rate limiters are configured via application.yml
 * This class ensures proper bean registration
 */
@Configuration
public class RateLimiterBeans {

    // Rate limiters are configured in application.yml
    // They are automatically created by Resilience4j based on the configuration
}

