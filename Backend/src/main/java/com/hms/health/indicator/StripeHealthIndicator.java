package com.hms.health.indicator;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import com.hms.health.StripeClient;
import com.hms.utils.HealthUtils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StripeHealthIndicator implements HealthIndicator{
    
    private final StripeClient stripeClient;

    @Override
    public Health health() {
        try{
            stripeClient.checkConnection();
            return HealthUtils.up("stripe", "Available");
        
        }catch (Exception ex) {
            return HealthUtils.down("stripe_error", ex);
        }
    }
}
