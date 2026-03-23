package com.hms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import com.stripe.Stripe;

import jakarta.annotation.PostConstruct;

@Configuration
public class StripeConfig {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }
}
