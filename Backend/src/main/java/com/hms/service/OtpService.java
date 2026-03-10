package com.hms.service;

import com.hms.entity.PasswordResetToken;

public interface OtpService {
    
    PasswordResetToken generateAndSaveOtp(String email);
    
    PasswordResetToken resendOtp(String email);
    
    boolean verifyOtp(String email, String otp);
    
    PasswordResetToken getVerifiedToken(String email);
    
    void markTokenAsUsed(PasswordResetToken token);
}
