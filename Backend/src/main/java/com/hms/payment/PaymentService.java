package com.hms.payment;

import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.PaymentInitiationResponse;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Payment;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.PaymentStatus;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PaymentRepository;
import com.hms.service.AppointmentService;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentService appointmentService;

    public PaymentInitiationResponse createPaymentForDoctor(Long doctorId, CreateAppointmentRequestDto request) throws Exception {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));

        if (doctor.getConsultationFee() == null || doctor.getConsultationFee() <= 0) {
            throw new ValidationException("Doctor does not have a valid consultation fee");
        }

        String appointmentId = UUID.randomUUID().toString();
        Map<String, String> metadata = new HashMap<>();
        metadata.put("appointment_id", appointmentId);
        metadata.put("doctor_id", String.valueOf(doctorId));
        metadata.put("patient_id", String.valueOf(request.getPatientId()));
        metadata.put("appointment_time", request.getAppointmentTime().toString());
        metadata.put("branch_id", request.getBranchId() == null ? "" : String.valueOf(request.getBranchId()));
        metadata.put("reason", request.getReason());

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (doctor.getConsultationFee() * 100))
                .setCurrency("inr")
                .putAllMetadata(metadata)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        return PaymentInitiationResponse.builder()
                .clientSecret(intent.getClientSecret())
                .appointmentId(appointmentId)
                .build();
    }

    @Transactional
    public AppointmentResponseDto confirmAndBook(CreateAppointmentRequestDto request, String paymentIntentId) throws Exception {
        Payment existingPayment = paymentRepository.findByPaymentIntentId(paymentIntentId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.SUCCESS) {
            return appointmentService.getAppointmentByAppointmentId(existingPayment.getAppointment().getAppointmentId());
        }

        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        if (!"succeeded".equals(intent.getStatus())) {
            throw new ValidationException("Payment has not succeeded: " + intent.getStatus());
        }

        String metadataAppointmentId = intent.getMetadata().get("appointment_id");
        if (metadataAppointmentId != null && !metadataAppointmentId.isBlank()) {
            request.setAppointmentId(metadataAppointmentId);
        }

        Appointment appointment = appointmentRepository.findByAppointmentId(request.getAppointmentId()).orElse(null);
        AppointmentResponseDto response;
        if (appointment == null) {
            response = appointmentService.createConfirmedAppointment(request);
            appointment = appointmentRepository.findByAppointmentId(response.getAppointmentId())
                    .orElseThrow(() -> new NotFoundException("Appointment not found after booking"));
        } else {
            response = appointmentService.getAppointmentByAppointmentId(appointment.getAppointmentId());
        }

        if (existingPayment == null) {
            existingPayment = Payment.builder().paymentIntentId(paymentIntentId).build();
        }
        existingPayment.setAmount(intent.getAmount() / 100);
        existingPayment.setStatus(PaymentStatus.SUCCESS);
        existingPayment.setAppointment(appointment);
        paymentRepository.save(existingPayment);

        return response;
    }

    @Transactional
    public String verifyPayment(String paymentIntentId) throws Exception {
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        String appointmentId = intent.getMetadata().get("appointment_id");

        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        if (!"succeeded".equals(intent.getStatus())) {
            return "Payment Failed: " + intent.getStatus();
        }

        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseGet(() -> Payment.builder().paymentIntentId(paymentIntentId).build());
        payment.setAmount(appointment.getAmount());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setAppointment(appointment);
        paymentRepository.save(payment);

        if (appointment.getStatus() != AppointmentStatusType.CONFIRMED) {
            appointment.setStatus(AppointmentStatusType.CONFIRMED);
            appointmentRepository.save(appointment);
        }

        return "Payment Success & Appointment Confirmed";
    }
}
