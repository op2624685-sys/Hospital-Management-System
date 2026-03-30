package com.hms.controller;

import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.PaymentInitiationResponse;
import com.hms.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-for-doctor/{doctorId}")
    public ResponseEntity<PaymentInitiationResponse> createPaymentForDoctor(
            @PathVariable Long doctorId,
            @RequestBody CreateAppointmentRequestDto request) throws Exception {
        return ResponseEntity.ok(paymentService.createPaymentForDoctor(doctorId, request));
    }

    @PostMapping("/confirm-and-book")
    public ResponseEntity<AppointmentResponseDto> confirmAndBook(
            @RequestBody CreateAppointmentRequestDto request,
            @RequestParam String paymentIntentId) throws Exception {
        return ResponseEntity.ok(paymentService.confirmAndBook(request, paymentIntentId));
    }

    @GetMapping("/verify/{paymentIntentId}")
    public ResponseEntity<String> verifyPayment(@PathVariable String paymentIntentId) throws Exception {
        String message = paymentService.verifyPayment(paymentIntentId);
        if (message.startsWith("Payment Failed")) {
            return ResponseEntity.badRequest().body(message);
        }
        return ResponseEntity.ok(message);
    }
}
