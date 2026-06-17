package com.hms.health.indicator;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class SystemHealthIndicator implements HealthIndicator {

    public static final long MEMORY_THRESHOLD = 50 * 1024 * 1024;

    @Override
    public Health health() {
        Runtime rt = Runtime.getRuntime();

        long free = rt.freeMemory();
        long total = rt.totalMemory();
        long max = rt.maxMemory();

        long used = total - free;
        long available = max - free;

        if (available < MEMORY_THRESHOLD) {
            return Health.down()
                    .withDetail("available_memory_mb", available / (1024 * 1024))
                    .withDetail("used_memory_mb", used / (1024 * 1024))
                    .withDetail("max_memory_mb", max / (1024 * 1024))
                    .build();
        }

        return Health.up()
                .withDetail("available_memory_mb", available / (1024 * 1024))
                .withDetail("used_memory_mb", used / (1024 * 1024))
                .withDetail("max_memory_mb", max / (1024 * 1024))
                .build();
    }

}
