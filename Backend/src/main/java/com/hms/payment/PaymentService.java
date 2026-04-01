package com.hms.payment;

import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Request.UpiWebhookRequest;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.PaymentInitiationResponse;
import com.hms.dto.Response.UpiPaymentInitiationResponse;
import com.hms.dto.Response.UpiPaymentOrderStatusResponse;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Payment;
import com.hms.entity.UpiPaymentOrder;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.PaymentMethodType;
import com.hms.entity.type.PaymentStatus;
import com.hms.entity.type.UpiPaymentOrderStatus;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PaymentRepository;
import com.hms.repository.UpiPaymentOrderRepository;
import com.hms.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private static final Map<PaymentMethodType, List<String>> STRIPE_PAYMENT_METHODS = Map.of(
            PaymentMethodType.CREDIT_CARD, List.of("card"),
            PaymentMethodType.DEBIT_CARD, List.of("card"),
            PaymentMethodType.UPI, List.of("upi"));

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentService appointmentService;
    private final UpiPaymentOrderRepository upiPaymentOrderRepository;
    private final ObjectMapper objectMapper;
    @Value("${app.payment.upi.vpa}")
    private String upiVpa;
    @Value("${app.payment.upi.payee-name:HMS Hospital}")
    private String upiPayeeName;
    @Value("${app.payment.upi.webhook.secret:}")
    private String upiWebhookSecret;

    public PaymentInitiationResponse createPaymentForDoctor(Long doctorId, CreateAppointmentRequestDto request) throws Exception {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));

        if (doctor.getConsultationFee() == null || doctor.getConsultationFee() <= 0) {
            throw new ValidationException("Doctor does not have a valid consultation fee");
        }

        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(request.getPaymentMethod());
        String appointmentId = UUID.randomUUID().toString();
        Map<String, String> metadata = new HashMap<>();
        metadata.put("appointment_id", appointmentId);
        metadata.put("doctor_id", String.valueOf(doctorId));
        metadata.put("patient_id", String.valueOf(request.getPatientId()));
        metadata.put("appointment_time", request.getAppointmentTime().toString());
        metadata.put("branch_id", request.getBranchId() == null ? "" : String.valueOf(request.getBranchId()));
        metadata.put("reason", request.getReason());
        metadata.put("payment_method", selectedPaymentMethod.name());

        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount((long) (doctor.getConsultationFee() * 100))
                .setCurrency("inr")
                .putAllMetadata(metadata);

        for (String stripeMethod : getStripePaymentMethods(selectedPaymentMethod)) {
            paramsBuilder.addPaymentMethodType(stripeMethod);
        }

        PaymentIntentCreateParams params = paramsBuilder.build();

        PaymentIntent intent = PaymentIntent.create(params);

        return PaymentInitiationResponse.builder()
                .clientSecret(intent.getClientSecret())
                .appointmentId(appointmentId)
                .build();
    }

    public UpiPaymentInitiationResponse initiateUpiPaymentForDoctor(Long doctorId, CreateAppointmentRequestDto request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));

        if (doctor.getConsultationFee() == null || doctor.getConsultationFee() <= 0) {
            throw new ValidationException("Doctor does not have a valid consultation fee");
        }
        if (upiVpa == null || upiVpa.isBlank()) {
            throw new ValidationException("UPI VPA is not configured");
        }

        String appointmentId = UUID.randomUUID().toString();
        String orderId = "UPIO-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase(Locale.ROOT);
        String note = "HMS Appointment " + appointmentId.substring(0, 8);
        String upiUri = buildUpiUri(upiVpa, upiPayeeName, doctor.getConsultationFee(), note, orderId);

        UpiPaymentOrder order = UpiPaymentOrder.builder()
                .orderId(orderId)
                .appointmentId(appointmentId)
                .doctorId(doctorId)
                .patientId(request.getPatientId())
                .appointmentTime(request.getAppointmentTime())
                .reason(request.getReason())
                .branchId(request.getBranchId())
                .amount(doctor.getConsultationFee())
                .status(UpiPaymentOrderStatus.PENDING)
                .build();
        upiPaymentOrderRepository.save(order);

        return UpiPaymentInitiationResponse.builder()
                .orderId(orderId)
                .appointmentId(appointmentId)
                .amount(doctor.getConsultationFee())
                .currency("INR")
                .upiVpa(upiVpa)
                .payeeName(upiPayeeName)
                .note(note)
                .upiUri(upiUri)
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

        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(
                PaymentMethodType.fromMetadataValue(intent.getMetadata().get("payment_method")));
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
        existingPayment.setMethod(selectedPaymentMethod);
        existingPayment.setAppointment(appointment);
        paymentRepository.save(existingPayment);

        return response;
    }

    @Transactional
    public AppointmentResponseDto confirmUpiAndBook(CreateAppointmentRequestDto request, String transactionId) {
        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(request.getPaymentMethod());
        if (selectedPaymentMethod != PaymentMethodType.UPI) {
            throw new ValidationException("UPI confirmation is only allowed for UPI payment method");
        }
        if (transactionId == null || !transactionId.matches("^[A-Za-z0-9_-]{8,64}$")) {
            throw new ValidationException("Invalid UPI transaction reference");
        }

        String manualPaymentId = "UPI-" + transactionId.trim();
        Payment existingPayment = paymentRepository.findByPaymentIntentId(manualPaymentId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.SUCCESS) {
            return appointmentService.getAppointmentByAppointmentId(existingPayment.getAppointment().getAppointmentId());
        }

        UpiPaymentOrder order = upiPaymentOrderRepository.findByAppointmentId(request.getAppointmentId())
                .orElse(null);
        if (order != null && order.getStatus() != UpiPaymentOrderStatus.PAID) {
            order.setStatus(UpiPaymentOrderStatus.PAID);
            order.setTransactionId(transactionId.trim());
            upiPaymentOrderRepository.save(order);
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
            existingPayment = Payment.builder().paymentIntentId(manualPaymentId).build();
        }
        existingPayment.setAmount(appointment.getAmount());
        existingPayment.setStatus(PaymentStatus.SUCCESS);
        existingPayment.setMethod(PaymentMethodType.UPI);
        existingPayment.setAppointment(appointment);
        paymentRepository.save(existingPayment);

        return response;
    }

    @Transactional
    public String handleUpiWebhook(String rawBody, String signatureHeader) throws Exception {
        validateWebhookSignature(rawBody, signatureHeader);
        UpiWebhookRequest webhookRequest = objectMapper.readValue(rawBody, UpiWebhookRequest.class);
        if (webhookRequest.getOrderId() == null || webhookRequest.getOrderId().isBlank()) {
            throw new ValidationException("orderId is required in webhook payload");
        }
        UpiPaymentOrder order = upiPaymentOrderRepository.findByOrderId(webhookRequest.getOrderId())
                .orElseThrow(() -> new NotFoundException("UPI order not found"));

        String status = webhookRequest.getStatus() == null ? "" : webhookRequest.getStatus().trim().toUpperCase(Locale.ROOT);
        if ("SUCCESS".equals(status) || "PAID".equals(status)) {
            markUpiOrderPaid(order, webhookRequest.getTransactionId());
            return "Webhook processed: UPI payment marked as PAID";
        }
        if ("FAILED".equals(status)) {
            order.setStatus(UpiPaymentOrderStatus.FAILED);
            order.setTransactionId(webhookRequest.getTransactionId());
            upiPaymentOrderRepository.save(order);
            return "Webhook processed: UPI payment marked as FAILED";
        }
        return "Webhook received: no state transition";
    }

    @Transactional(readOnly = true)
    public UpiPaymentOrderStatusResponse getUpiOrderStatus(String orderId) {
        UpiPaymentOrder order = upiPaymentOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("UPI order not found"));
        return UpiPaymentOrderStatusResponse.builder()
                .orderId(order.getOrderId())
                .appointmentId(order.getAppointmentId())
                .status(order.getStatus())
                .transactionId(order.getTransactionId())
                .build();
    }

    @Transactional
    public String verifyPayment(String paymentIntentId) throws Exception {
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        String appointmentId = intent.getMetadata().get("appointment_id");
        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(
                PaymentMethodType.fromMetadataValue(intent.getMetadata().get("payment_method")));

        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        if (!"succeeded".equals(intent.getStatus())) {
            return "Payment Failed: " + intent.getStatus();
        }

        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseGet(() -> Payment.builder().paymentIntentId(paymentIntentId).build());
        payment.setAmount(appointment.getAmount());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setMethod(selectedPaymentMethod);
        payment.setAppointment(appointment);
        paymentRepository.save(payment);

        if (appointment.getStatus() != AppointmentStatusType.CONFIRMED) {
            appointment.setStatus(AppointmentStatusType.CONFIRMED);
            appointmentRepository.save(appointment);
        }

        return "Payment Success & Appointment Confirmed";
    }

    private PaymentMethodType resolvePaymentMethod(PaymentMethodType requestedMethod) {
        if (requestedMethod == null) {
            return PaymentMethodType.CREDIT_CARD;
        }
        if (!STRIPE_PAYMENT_METHODS.containsKey(requestedMethod)) {
            throw new ValidationException("Unsupported payment method: " + requestedMethod);
        }
        return requestedMethod;
    }

    private List<String> getStripePaymentMethods(PaymentMethodType method) {
        return STRIPE_PAYMENT_METHODS.getOrDefault(method, STRIPE_PAYMENT_METHODS.get(PaymentMethodType.CREDIT_CARD));
    }

    private String buildUpiUri(String vpa, String payeeName, Long amount, String note, String transactionRef) {
        return "upi://pay?pa=" + urlEncode(vpa)
                + "&pn=" + urlEncode(payeeName)
                + "&am=" + amount
                + "&cu=INR"
                + "&tn=" + urlEncode(note)
                + "&tr=" + urlEncode(transactionRef);
    }

    private String urlEncode(String value) {
        return java.net.URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private void validateWebhookSignature(String rawBody, String signatureHeader) throws Exception {
        if (upiWebhookSecret == null || upiWebhookSecret.isBlank()) {
            throw new ValidationException("UPI webhook secret is not configured");
        }
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new ValidationException("Missing webhook signature");
        }
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(upiWebhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
        StringBuilder expected = new StringBuilder();
        for (byte b : digest) {
            expected.append(String.format("%02x", b));
        }
        if (!expected.toString().equalsIgnoreCase(signatureHeader.trim())) {
            throw new ValidationException("Invalid webhook signature");
        }
    }

    private void markUpiOrderPaid(UpiPaymentOrder order, String transactionId) {
        if (order.getStatus() == UpiPaymentOrderStatus.PAID) {
            return;
        }
        CreateAppointmentRequestDto appointmentRequest = new CreateAppointmentRequestDto();
        appointmentRequest.setDoctorId(order.getDoctorId());
        appointmentRequest.setPatientId(order.getPatientId());
        appointmentRequest.setAppointmentTime(order.getAppointmentTime());
        appointmentRequest.setReason(order.getReason());
        appointmentRequest.setBranchId(order.getBranchId());
        appointmentRequest.setAppointmentId(order.getAppointmentId());
        appointmentRequest.setPaymentMethod(PaymentMethodType.UPI);

        Appointment appointment = appointmentRepository.findByAppointmentId(order.getAppointmentId()).orElse(null);
        AppointmentResponseDto response;
        if (appointment == null) {
            response = appointmentService.createConfirmedAppointment(appointmentRequest);
            appointment = appointmentRepository.findByAppointmentId(response.getAppointmentId())
                    .orElseThrow(() -> new NotFoundException("Appointment not found after booking"));
        }

        String paymentRef = (transactionId == null || transactionId.isBlank())
                ? ("UPI-" + order.getOrderId())
                : ("UPI-" + transactionId.trim());
        Payment payment = paymentRepository.findByPaymentIntentId(paymentRef)
                .orElseGet(() -> Payment.builder().paymentIntentId(paymentRef).build());
        payment.setAmount(order.getAmount());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setMethod(PaymentMethodType.UPI);
        payment.setAppointment(appointment);
        paymentRepository.save(payment);

        order.setStatus(UpiPaymentOrderStatus.PAID);
        order.setTransactionId(transactionId);
        upiPaymentOrderRepository.save(order);
    }
}
