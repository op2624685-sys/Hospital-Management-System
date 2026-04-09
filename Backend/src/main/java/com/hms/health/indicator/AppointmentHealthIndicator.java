package com.hms.health.indicator;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import com.hms.repository.AppointmentRepository;
import com.hms.utils.HealthUtils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AppointmentHealthIndicator implements HealthIndicator {

    private final AppointmentRepository appointmentRepository;

    @Override
    public Health health() {
        try {
            long count = appointmentRepository.count();

            return Health.up()
                    .withDetail("appointment_count", count)
                    .build();

        } catch (Exception ex) {
            return HealthUtils.down("appointment_error", ex);
        }
    }
}
