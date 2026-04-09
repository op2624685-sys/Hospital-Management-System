package com.hms.utils;

import org.springframework.boot.actuate.health.Health;

public class HealthUtils {

    public static Health up(String key, Object value) {
        return Health.up().withDetail(key, value).build();
    }

    public static Health down(String key, Exception ex) {
        return Health.down()
                .withDetail(key, ex.getMessage())
                .build();
    }

}
