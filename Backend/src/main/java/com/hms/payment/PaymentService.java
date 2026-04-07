package com.hms.payment;

import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.PaymentInitiationResponse;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Payment;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.PaymentMethodType;
import com.hms.entity.type.PaymentStatus;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PaymentRepository;
import com.hms.service.AppointmentService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private static final String EVENT_CHECKOUT_COMPLETED = "checkout.session.completed";
    private static final String EVENT_CHECKOUT_ASYNC_SUCCEEDED = "checkout.session.async_payment_succeeded";
    private static final String EVENT_CHECKOUT_ASYNC_FAILED = "checkout.session.async_payment_failed";
    private static final String DEPARTMENT_FALLBACK_MARKER = "PAYMENT_DEPARTMENT_FALLBACK_USED";

    private static final Map<PaymentMethodType, List<String>> STRIPE_PAYMENT_METHODS = Map.of(
            PaymentMethodType.CREDIT_CARD, List.of("card"),
            PaymentMethodType.DEBIT_CARD, List.of("card"));

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentService appointmentService;

    @Value("${app.payment.redirect-base-url:http://localhost:5173}")
    private String paymentRedirectBaseUrl;

    @Value("${STRIPE_WEBHOOK_SECRET}")
    private String stripeWebhookSecret;
    private final AtomicLong departmentFallbackCounter = new AtomicLong();

    public PaymentInitiationResponse createPaymentForDoctor(Long doctorId, CreateAppointmentRequestDto request) throws Exception {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));

        if (doctor.getConsultationFee() == null || doctor.getConsultationFee() <= 0) {
            throw new ValidationException("Doctor does not have a valid consultation fee");
        }

        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(request.getPaymentMethod());
        String appointmentId = UUID.randomUUID().toString();
        Map<String, String> metadata = buildPaymentMetadata(appointmentId, doctorId, request, selectedPaymentMethod);

        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(doctor.getConsultationFee() * 100)
                .setCurrency("inr")
                .putAllMetadata(metadata);

        for (String stripeMethod : getStripePaymentMethods(selectedPaymentMethod)) {
            paramsBuilder.addPaymentMethodType(stripeMethod);
        }

        PaymentIntent intent = PaymentIntent.create(paramsBuilder.build());

        return PaymentInitiationResponse.builder()
                .clientSecret(intent.getClientSecret())
                .appointmentId(appointmentId)
                .build();
    }

    @Transactional
    public AppointmentResponseDto confirmAndBook(CreateAppointmentRequestDto request, String paymentIntentId) throws Exception {
        if (paymentIntentId == null || paymentIntentId.trim().isEmpty()) {
            throw new ValidationException("Payment intent ID is required");
        }

        Payment existingPayment = paymentRepository.findByPaymentIntentId(paymentIntentId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.SUCCESS && existingPayment.getAppointment() != null) {
            return appointmentService.getAppointmentByAppointmentId(existingPayment.getAppointment().getAppointmentId());
        }

        PaymentIntent intent;
        try {
            intent = PaymentIntent.retrieve(paymentIntentId);
        } catch (Exception e) {
            throw new ValidationException("Invalid or expired payment intent: " + e.getMessage());
        }

        if (intent == null) {
            throw new ValidationException("Payment intent not found");
        }

        if (!"succeeded".equals(intent.getStatus())) {
            throw new ValidationException("Payment has not succeeded. Current status: " + intent.getStatus());
        }

        Appointment appointment = upsertConfirmedAppointmentFromIntent(intent, request);
        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(
                PaymentMethodType.fromMetadataValue(intent.getMetadata().get("payment_method")));

        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseGet(() -> Payment.builder().paymentIntentId(paymentIntentId).build());
        payment.setAmount(intent.getAmount() / 100);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setMethod(selectedPaymentMethod);
        payment.setAppointment(appointment);
        paymentRepository.save(payment);

        return appointmentService.getAppointmentByAppointmentId(appointment.getAppointmentId());
    }

    @Transactional(readOnly = true)
    public String verifyPayment(String paymentIntentId) throws Exception {
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        if (!"succeeded".equals(intent.getStatus())) {
            return "Payment Failed: " + intent.getStatus();
        }

        String appointmentId = intent.getMetadata().get("appointment_id");
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(
                PaymentMethodType.fromMetadataValue(intent.getMetadata().get("payment_method")));

        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseGet(() -> Payment.builder().paymentIntentId(paymentIntentId).build());
        payment.setAmount(intent.getAmount() / 100);
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

    public Map<String, String> createStripeCheckoutSession(Long doctorId, CreateAppointmentRequestDto request) throws Exception {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));

        if (doctor.getConsultationFee() == null || doctor.getConsultationFee() <= 0) {
            throw new ValidationException("Doctor does not have a valid consultation fee");
        }

        PaymentMethodType selectedPaymentMethod = resolvePaymentMethod(request.getPaymentMethod());
        String appointmentId = UUID.randomUUID().toString();
        Map<String, String> metadata = buildPaymentMetadata(appointmentId, doctorId, request, selectedPaymentMethod);

        try {
            com.stripe.param.checkout.SessionCreateParams.Builder sessionBuilder = com.stripe.param.checkout.SessionCreateParams.builder()
                    .setMode(com.stripe.param.checkout.SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(paymentRedirectBaseUrl + "/payment?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(paymentRedirectBaseUrl + "/payment")
                    .addPaymentMethodType(com.stripe.param.checkout.SessionCreateParams.PaymentMethodType.CARD)
                    .addLineItem(
                            com.stripe.param.checkout.SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("inr")
                                                    .setUnitAmount(doctor.getConsultationFee() * 100)
                                                    .setProductData(
                                                            com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Consultation with " + doctor.getName())
                                                                    .setDescription(request.getReason())
                                                                    .build())
                                                    .build())
                                    .build())
                    .putAllMetadata(metadata);

            Session session = Session.create(sessionBuilder.build());

            Map<String, String> response = new HashMap<>();
            response.put("id", session.getId());
            response.put("url", session.getUrl());
            response.put("appointmentId", appointmentId);
            return response;
        } catch (com.stripe.exception.StripeException e) {
            throw new ValidationException("Failed to create Stripe Checkout Session: " + e.getMessage());
        }
    }

    @Transactional
    public AppointmentResponseDto confirmStripePayment(CreateAppointmentRequestDto request) throws Exception {
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            throw new ValidationException("Session ID is required");
        }

        try {
            Session session = Session.retrieve(sessionId);
            if (!"paid".equals(session.getPaymentStatus())) {
                throw new ValidationException("Payment not completed. Status: " + session.getPaymentStatus());
            }
            return finalizeSuccessfulCheckoutSession(session, request.getAppointmentTime(), request.getDepartmentId(), true);
        } catch (com.stripe.exception.StripeException e) {
            throw new ValidationException("Failed to confirm Stripe payment: " + e.getMessage());
        }
    }

    @Transactional
    public String handleStripeWebhook(String rawBody, String signatureHeader) throws Exception {
        if (stripeWebhookSecret == null || stripeWebhookSecret.isBlank()) {
            throw new ValidationException("Stripe webhook secret is not configured");
        }
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new ValidationException("Missing Stripe-Signature header");
        }

        Event event;
        try {
            event = Webhook.constructEvent(rawBody, signatureHeader, stripeWebhookSecret);
        } catch (Exception ex) {
            throw new ValidationException("Invalid Stripe webhook signature");
        }

        StripeObject stripeObject = event.getDataObjectDeserializer().getObject().orElse(null);
        if (!(stripeObject instanceof Session session)) {
            return "Webhook ignored: unsupported event payload";
        }

        return switch (event.getType()) {
            case EVENT_CHECKOUT_COMPLETED, EVENT_CHECKOUT_ASYNC_SUCCEEDED -> {
                finalizeSuccessfulCheckoutSession(session, null, null, false);
                yield "Webhook processed: checkout payment succeeded";
            }
            case EVENT_CHECKOUT_ASYNC_FAILED -> {
                markPaymentFailed(session);
                yield "Webhook processed: checkout payment failed";
            }
            default -> "Webhook received: event ignored";
        };
    }

    private AppointmentResponseDto finalizeSuccessfulCheckoutSession(
            Session session,
            LocalDateTime fallbackAppointmentTime,
            Long requestDepartmentId,
            boolean allowRequestFallback) {
        if (session.getId() == null || session.getId().isBlank()) {
            throw new ValidationException("Invalid Stripe session ID in webhook event");
        }

        Payment existingPayment = paymentRepository.findByPaymentIntentId(session.getId()).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.SUCCESS && existingPayment.getAppointment() != null) {
            return appointmentService.getAppointmentByAppointmentId(existingPayment.getAppointment().getAppointmentId());
        }

        Map<String, String> metadata = session.getMetadata();
        if (metadata == null || metadata.isEmpty()) {
            throw new ValidationException("Missing Stripe session metadata");
        }

        String appointmentId = requiredMetadata(metadata, "appointment_id");
        PaymentMethodType paymentMethodType = resolvePaymentMethod(
                PaymentMethodType.fromMetadataValue(metadata.get("payment_method")));

        CreateAppointmentRequestDto appointmentRequest = new CreateAppointmentRequestDto();
        appointmentRequest.setAppointmentId(appointmentId);
        appointmentRequest.setDoctorId(parseRequiredLong(metadata, "doctor_id"));
        appointmentRequest.setPatientId(parseRequiredLong(metadata, "patient_id"));
        appointmentRequest.setReason(requiredMetadata(metadata, "reason"));
        appointmentRequest.setAppointmentTime(parseAppointmentTime(metadata.get("appointment_time"), fallbackAppointmentTime));
        appointmentRequest.setBranchId(parseOptionalLong(metadata.get("branch_id")));
        appointmentRequest.setDepartmentId(resolveDepartmentIdForTransition(
                metadata,
                requestDepartmentId,
                "stripe_checkout_session",
                session.getId(),
                allowRequestFallback));
        appointmentRequest.setPaymentMethod(paymentMethodType);

        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId).orElse(null);
        if (appointment == null) {
            AppointmentResponseDto response = appointmentService.createConfirmedAppointment(appointmentRequest);
            appointment = appointmentRepository.findByAppointmentId(response.getAppointmentId())
                    .orElseThrow(() -> new NotFoundException("Appointment not found after booking"));
        } else if (appointment.getStatus() != AppointmentStatusType.CONFIRMED) {
            appointment.setStatus(AppointmentStatusType.CONFIRMED);
            appointment = appointmentRepository.save(appointment);
        }

        Payment payment = paymentRepository.findByPaymentIntentId(session.getId())
                .orElseGet(() -> Payment.builder().paymentIntentId(session.getId()).build());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setMethod(paymentMethodType);
        payment.setAppointment(appointment);
        payment.setAmount(resolveSessionAmountInRupees(session, appointment));
        paymentRepository.save(payment);

        return appointmentService.getAppointmentByAppointmentId(appointment.getAppointmentId());
    }

    private void markPaymentFailed(Session session) {
        if (session.getId() == null || session.getId().isBlank()) {
            return;
        }
        Payment payment = paymentRepository.findByPaymentIntentId(session.getId())
                .orElseGet(() -> Payment.builder().paymentIntentId(session.getId()).build());
        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }

    private Appointment upsertConfirmedAppointmentFromIntent(PaymentIntent intent, CreateAppointmentRequestDto request) {
        Map<String, String> metadata = intent.getMetadata();
        if (metadata == null || metadata.isEmpty()) {
            throw new ValidationException("Missing Stripe payment metadata");
        }

        String metadataAppointmentId = requiredMetadata(metadata, "appointment_id");
        request.setAppointmentId(metadataAppointmentId);
        request.setDoctorId(parseRequiredLong(metadata, "doctor_id"));
        request.setPatientId(parseRequiredLong(metadata, "patient_id"));
        request.setReason(requiredMetadata(metadata, "reason"));
        request.setBranchId(parseOptionalLong(metadata.get("branch_id")));
        request.setDepartmentId(resolveDepartmentIdForTransition(
                metadata,
                request.getDepartmentId(),
                "stripe_payment_intent",
                intent.getId(),
                true));
        request.setAppointmentTime(parseAppointmentTime(metadata.get("appointment_time"), request.getAppointmentTime()));

        Appointment appointment = appointmentRepository.findByAppointmentId(metadataAppointmentId).orElse(null);
        if (appointment == null) {
            AppointmentResponseDto response = appointmentService.createConfirmedAppointment(request);
            return appointmentRepository.findByAppointmentId(response.getAppointmentId())
                    .orElseThrow(() -> new NotFoundException("Appointment not found after booking"));
        }

        if (appointment.getStatus() != AppointmentStatusType.CONFIRMED) {
            appointment.setStatus(AppointmentStatusType.CONFIRMED);
            appointment = appointmentRepository.save(appointment);
        }
        return appointment;
    }

    private Map<String, String> buildPaymentMetadata(
            String appointmentId,
            Long doctorId,
            CreateAppointmentRequestDto request,
            PaymentMethodType paymentMethodType) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("appointment_id", appointmentId);
        metadata.put("doctor_id", String.valueOf(doctorId));
        metadata.put("patient_id", String.valueOf(request.getPatientId()));
        metadata.put("appointment_time", request.getAppointmentTime().toString());
        metadata.put("branch_id", request.getBranchId() == null ? "" : String.valueOf(request.getBranchId()));
        metadata.put("department_id", request.getDepartmentId() == null ? "" : String.valueOf(request.getDepartmentId()));
        metadata.put("reason", request.getReason());
        metadata.put("payment_method", paymentMethodType.name());
        return metadata;
    }

    private PaymentMethodType resolvePaymentMethod(PaymentMethodType requestedMethod) {
        if (requestedMethod == null) {
            return PaymentMethodType.CREDIT_CARD;
        }
        if (!STRIPE_PAYMENT_METHODS.containsKey(requestedMethod)) {
            throw new ValidationException("Unsupported payment method: " + requestedMethod + ". Only card payments are enabled.");
        }
        return requestedMethod;
    }

    private List<String> getStripePaymentMethods(PaymentMethodType method) {
        return STRIPE_PAYMENT_METHODS.getOrDefault(method, STRIPE_PAYMENT_METHODS.get(PaymentMethodType.CREDIT_CARD));
    }

    private String requiredMetadata(Map<String, String> metadata, String key) {
        String value = metadata.get(key);
        if (value == null || value.isBlank()) {
            throw new ValidationException("Missing required payment metadata: " + key);
        }
        return value;
    }

    private Long parseRequiredLong(Map<String, String> metadata, String key) {
        String value = requiredMetadata(metadata, key);
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            throw new ValidationException("Invalid numeric payment metadata: " + key);
        }
    }

    private Long parseOptionalLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            throw new ValidationException("Invalid optional numeric payment metadata");
        }
    }

    private Long resolveDepartmentIdForTransition(
            Map<String, String> metadata,
            Long requestDepartmentId,
            String context,
            String paymentRef,
            boolean allowRequestFallback) {
        String metadataValue = metadata.get("department_id");
        if (metadataValue != null && !metadataValue.isBlank()) {
            try {
                return Long.parseLong(metadataValue);
            } catch (NumberFormatException ex) {
                if (!allowRequestFallback || requestDepartmentId == null) {
                    throw new ValidationException("Invalid numeric payment metadata: department_id");
                }
            }
        }

        if (allowRequestFallback && requestDepartmentId != null) {
            long fallbackCount = departmentFallbackCounter.incrementAndGet();
            log.info(
                    "{} count={} context={} paymentRef={} requestDepartmentId={}",
                    DEPARTMENT_FALLBACK_MARKER,
                    fallbackCount,
                    context,
                    paymentRef,
                    requestDepartmentId);
            return requestDepartmentId;
        }

        log.warn(
                "PAYMENT_DEPARTMENT_METADATA_MISSING context={} paymentRef={} allowRequestFallback={}",
                context,
                paymentRef,
                allowRequestFallback);
        throw new ValidationException("Missing required payment metadata: department_id");
    }

    private LocalDateTime parseAppointmentTime(String metadataValue, LocalDateTime fallbackAppointmentTime) {
        if (metadataValue != null && !metadataValue.isBlank()) {
            try {
                return LocalDateTime.parse(metadataValue);
            } catch (DateTimeParseException ex) {
                throw new ValidationException("Invalid appointment_time format in payment metadata");
            }
        }
        if (fallbackAppointmentTime != null) {
            return fallbackAppointmentTime;
        }
        throw new ValidationException("appointment_time is required in payment metadata");
    }

    private Long resolveSessionAmountInRupees(Session session, Appointment appointment) {
        if (session.getAmountTotal() != null) {
            return session.getAmountTotal() / 100;
        }
        if (appointment != null && appointment.getAmount() != null) {
            return appointment.getAmount();
        }
        return 0L;
    }
}
