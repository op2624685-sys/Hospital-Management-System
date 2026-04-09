package com.hms.health.indicator;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class SystemHealthIndicator implements HealthIndicator{
    
    public static final long MEMORY_THRESHOLD = 50 * 1024 * 1024;

    @Override
    public Health health() {
        long freeMemory = Runtime.getRuntime().freeMemory();

        if (freeMemory < MEMORY_THRESHOLD) {
            return Health.down()
                    .withDetail("memory", "Low memory")
                    .withDetail("free_memory", freeMemory)
                    .build();
        }
    
    return Health.up()
            .withDetail("free_memory", freeMemory)
            .build();
    }


}
