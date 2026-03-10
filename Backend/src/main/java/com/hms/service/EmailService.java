package com.hms.service;

public interface EmailService {
    
    void sendOtpEmail(String toEmail, String otp);
    
    void sendMail(String to, String subject, String body);
}
