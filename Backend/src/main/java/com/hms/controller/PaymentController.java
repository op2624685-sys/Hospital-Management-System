package com.hms.controller;

import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.PaymentInitiationResponse;
import com.hms.payment.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payment System", description = "Endpoints for handling medical appointment payments using Stripe integration")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-for-doctor/{doctorId}")
    @Operation(summary = "Initiate Doctor Payment", description = "Creates a payment intent for a specific doctor's appointment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<PaymentInitiationResponse> createPaymentForDoctor(
            @Parameter(description = "ID of the doctor for the appointment") @PathVariable Long doctorId,
            @Valid @RequestBody CreateAppointmentRequestDto request) throws Exception {
        return ResponseEntity.ok(paymentService.createPaymentForDoctor(doctorId, request));
    }

    @PostMapping("/confirm-and-book")
    @Operation(summary = "Confirm Payment & Book", description = "Confirms the payment via Stripe and finalizes the appointment booking")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Payment confirmed and appointment booked successfully"), @ApiResponse(responseCode = "400", description = "Payment confirmation or appointment data is invalid"), @ApiResponse(responseCode = "409", description = "Appointment slot is unavailable") })
    public ResponseEntity<AppointmentResponseDto> confirmAndBook(
            @Valid @RequestBody CreateAppointmentRequestDto request,
            @Parameter(description = "The Stripe Payment Intent ID") @RequestParam String paymentIntentId) throws Exception {
        return ResponseEntity.ok(paymentService.confirmAndBook(request, paymentIntentId));
    }

    @PostMapping("/stripe/webhook")
    @Operation(summary = "Stripe Webhook", description = "Internal endpoint for Stripe to notify the system about payment status changes")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Webhook processed successfully"), @ApiResponse(responseCode = "400", description = "Invalid Stripe signature or payload") })
    public ResponseEntity<String> stripeWebhook(
            @RequestBody String rawBody,
            @RequestHeader(name = "Stripe-Signature", required = false) String signatureHeader) throws Exception {
        return ResponseEntity.ok(paymentService.handleStripeWebhook(rawBody, signatureHeader));
    }

    @GetMapping("/verify/{paymentIntentId}")
    @Operation(summary = "Verify Payment Status", description = "Checks if a specific payment intent has been successfully completed")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Payment status retrieved successfully"), @ApiResponse(responseCode = "400", description = "Payment failed or payment intent is invalid"), @ApiResponse(responseCode = "404", description = "Payment intent not found") })
    public ResponseEntity<String> verifyPayment(@PathVariable String paymentIntentId) throws Exception {
        String message = paymentService.verifyPayment(paymentIntentId);
        if (message.startsWith("Payment Failed")) {
            return ResponseEntity.badRequest().body(message);
        }
        return ResponseEntity.ok(message);
    }

    @PostMapping("/create-stripe-checkout-session/{doctorId}")
    @Operation(summary = "Create Checkout Session", description = "Generates a Stripe Checkout session URL for professional payment processing")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Checkout session created successfully"), @ApiResponse(responseCode = "400", description = "Invalid appointment or doctor data"), @ApiResponse(responseCode = "404", description = "Doctor not found") })
    public ResponseEntity<?> createStripeCheckoutSession(
            @PathVariable Long doctorId,
            @Valid @RequestBody CreateAppointmentRequestDto request) throws Exception {
        return ResponseEntity.ok(paymentService.createStripeCheckoutSession(doctorId, request));
    }

    @PostMapping("/confirm-stripe-payment")
    @Operation(summary = "Confirm Stripe Payment", description = "Confirms a payment completed via Stripe Checkout and books the appointment")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Stripe payment confirmed and appointment booked successfully"), @ApiResponse(responseCode = "400", description = "Invalid payment or appointment data"), @ApiResponse(responseCode = "409", description = "Appointment slot is unavailable") })
    public ResponseEntity<AppointmentResponseDto> confirmStripePayment(
            @Valid @RequestBody CreateAppointmentRequestDto request) throws Exception {
        return ResponseEntity.ok(paymentService.confirmStripePayment(request));
    }
}
