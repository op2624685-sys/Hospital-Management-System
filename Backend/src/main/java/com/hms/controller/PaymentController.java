package com.hms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Payment;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.PaymentStatus;
import com.hms.payment.PaymentService;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.PaymentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.dto.Response.PaymentInitiationResponse;
import com.hms.service.AppointmentService;
import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentService appointmentService;

    @PostMapping("/create-for-doctor/{doctorId}")
    public ResponseEntity<PaymentInitiationResponse> createPaymentForDoctor(@PathVariable Long doctorId, 
                                                                          @RequestBody CreateAppointmentRequestDto request) throws Exception {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (doctor.getConsultationFee() == null || doctor.getConsultationFee() <= 0) {
            throw new RuntimeException("Doctor does not have a valid consultation fee");
        }

        String appointmentId = UUID.randomUUID().toString();

        Map<String, String> metadata = new HashMap<>();
        metadata.put("appointment_id", appointmentId);
        metadata.put("doctor_id", String.valueOf(doctorId));
        metadata.put("patient_id", String.valueOf(request.getPatientId()));
        metadata.put("appointment_time", request.getAppointmentTime().toString());
        metadata.put("branch_id", String.valueOf(request.getBranchId()));
        metadata.put("reason", request.getReason());

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long)(doctor.getConsultationFee() * 100))
                .setCurrency("inr")
                .putAllMetadata(metadata)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        
        return ResponseEntity.ok(PaymentInitiationResponse.builder()
                .clientSecret(intent.getClientSecret())
                .appointmentId(appointmentId)
                .build());
    }

    @PostMapping("/confirm-and-book")
    public ResponseEntity<AppointmentResponseDto> confirmAndBook(@RequestBody CreateAppointmentRequestDto request, 
                                                               @RequestParam String paymentIntentId) throws Exception {
        
        // 1. Verify Payment with Stripe
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        if (!"succeeded".equals(intent.getStatus())) {
            throw new RuntimeException("Payment has not succeeded: " + intent.getStatus());
        }

        // 2. Create the Appointment as CONFIRMED directly
        AppointmentResponseDto response = appointmentService.createConfirmedAppointment(request);
        
        // 3. Save Payment record
        Payment payment = Payment.builder()
                .paymentIntentId(paymentIntentId)
                .amount(intent.getAmount() / 100)
                .status(PaymentStatus.SUCCESS)
                .appointment(appointmentRepository.findByAppointmentId(response.getAppointmentId()).get())
                .build();
        paymentRepository.save(payment);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify/{paymentIntentId}")
    public ResponseEntity<String> verifyPayment(@PathVariable String paymentIntentId) throws Exception {

        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        String appointmentId = intent.getMetadata().get("appointment_id");

        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if ("succeeded".equals(intent.getStatus())) {
            
            // Create Payment record ONLY on success
            Payment payment = Payment.builder()
                    .paymentIntentId(paymentIntentId)
                    .amount(appointment.getAmount())
                    .status(PaymentStatus.SUCCESS)
                    .appointment(appointment)
                    .build();
            paymentRepository.save(payment);

            appointment.setStatus(AppointmentStatusType.CONFIRMED);
            appointmentRepository.save(appointment);

            return ResponseEntity.ok("Payment Success & Appointment Confirmed");
        } else {
             // Optional: Mark as FAILED in payment table if it actually failed
             return ResponseEntity.status(400).body("Payment Failed: " + intent.getStatus());
        }
    }
}
