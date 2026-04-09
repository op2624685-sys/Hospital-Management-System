package com.hms.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.model.Balance;

@Service
public class StripeClient {

    @Value("${STRIPE_SECRET_KEY}")
    private String stripeSecretKey;

    public void checkConnection() throws Exception {
        Stripe.apiKey = stripeSecretKey;
        Balance.retrieve();  //lightweight check
    }

}
