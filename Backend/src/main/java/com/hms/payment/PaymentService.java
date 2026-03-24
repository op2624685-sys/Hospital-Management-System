package com.hms.payment;

import org.springframework.stereotype.Service;

import com.hms.repository.AppointmentRepository;
import com.hms.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final StripeService stripeService;

    // createPayment method removed as it depends on deleted PENDING status and is replaced by PaymentController flow
}
