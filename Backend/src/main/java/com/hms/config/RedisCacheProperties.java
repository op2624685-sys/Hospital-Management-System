package com.hms.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.redis.cache")
public class RedisCacheProperties {

    private Duration defaultTtl = Duration.ofMinutes(60);
    private String prefix = "hms:v1:";
    private Map<String, Duration> ttl = new HashMap<>();

    public Duration getDefaultTtl() {
        return defaultTtl;
    }

    public void setDefaultTtl(Duration defaultTtl) {
        this.defaultTtl = defaultTtl;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public Map<String, Duration> getTtl() {
        return ttl;
    }

    public void setTtl(Map<String, Duration> ttl) {
        this.ttl = ttl;
    }
}
