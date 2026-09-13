package com.hms.service.impl;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;
import org.springframework.web.util.LinkedMultiValueMap;
import org.springframework.web.util.MultiValueMap;

import com.hms.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.resend.api-key}")
    private String resendApiKey;

    private final RestTemplate restTemplate;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Password Reset OTP - MediCore HMS";
        String body = "Your One-Time Password (OTP) for password reset is: " + otp + "\n\n" +
                "This OTP is valid for 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "MediCore HMS Team";

        sendRestEmail(toEmail, subject, body);
    }

    @Override
    public void sendMail(String to, String subject, String body) {
        sendRestEmail(to, subject, body);
    }

    @Override
    public void sendPaymentSuccessEmail(String to, String subject, String body) {
        sendRestEmail(to, subject, body);
    }

    private void sendRestEmail(String to, String subject, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);
            headers.set("User-Agent", "MediCore-HMS");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromEmail);
            requestBody.put("to", List.of(to));
            requestBody.put("subject", subject);
            requestBody.put("text", body);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(RESEND_API_URL, entity, String.class);
            log.info("Email sent successfully via Resend API to: {}", to);
        } catch (RestClientException e) {
            log.error("Error sending email via Resend API to: {}", to, e);
            throw new RuntimeException("Failed to send email via Resend API", e);
        }
    }
}
