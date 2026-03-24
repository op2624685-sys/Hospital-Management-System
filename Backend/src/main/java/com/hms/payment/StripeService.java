package com.hms.payment;

import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StripeService {

    public String createPaymentIntent(Long amount) throws Exception {

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amount)
                        .setCurrency("inr")
                        .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        return paymentIntent.getId();
    }
}
