package com.hms.service.impl;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.entity.PasswordResetToken;
import com.hms.entity.User;
import com.hms.repository.PasswordResetTokenRepository;
import com.hms.repository.UserRepository;
import com.hms.service.EmailService;
import com.hms.service.OtpService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int RESEND_COOLDOWN_SECONDS = 600; // Minimum 10 minutes between resends

    @Override
    @Transactional
    public PasswordResetToken generateAndSaveOtp(String username) {
        // Find user by username
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));

        // Get email from patient record
        String email = getEmailForUser(user);
        if (email == null) {
            throw new IllegalArgumentException("Email not found for user: " + username);
        }

        // Generate OTP
        String otp = generateOtp();
        log.info("Generated OTP for username: {}", username);

        // Invalidate previous OTP if exists
        passwordResetTokenRepository.findByUserAndIsUsedFalseAndIsVerifiedFalse(user)
                .ifPresent(token -> {
                    token.setIsUsed(true);
                    passwordResetTokenRepository.save(token);
                });

        // Create and save new token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .otp(otp)
                .email(email)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .isUsed(false)
                .isVerified(false)
                .build();

        resetToken = passwordResetTokenRepository.save(resetToken);
        log.info("Password reset token saved for username: {}", username);

        // Send OTP via email
        emailService.sendOtpEmail(email, otp);

        return resetToken;
    }

    @Override
    @Transactional
    public PasswordResetToken resendOtp(String username) {
        // Find user by username
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));

        // Get email from patient record
        String email = getEmailForUser(user);
        if (email == null) {
            throw new IllegalArgumentException("Email not found for user: " + username);
        }

        // Check for recent OTP send to prevent spam
        PasswordResetToken lastToken = passwordResetTokenRepository.findLatestUnusedTokenByEmail(email)
                .orElse(null);

        if (lastToken != null && !lastToken.isExpired()) {
            LocalDateTime createdTime = lastToken.getCreatedAt();
            LocalDateTime cooldownExpiry = createdTime.plusSeconds(RESEND_COOLDOWN_SECONDS);
            
            if (LocalDateTime.now().isBefore(cooldownExpiry)) {
                long secondsRemaining = java.time.temporal.ChronoUnit.SECONDS.between(LocalDateTime.now(), cooldownExpiry);
                log.warn("Resend OTP requested too soon for username: {}. Wait {} seconds.", username, secondsRemaining);
                throw new IllegalArgumentException("Please wait before requesting a new OTP. Try again in " + secondsRemaining + " seconds.");
            }
        }

        // Generate new OTP
        String otp = generateOtp();
        log.info("Resending OTP for username: {}", username);

        // Invalidate any previous unverified OTPs
        passwordResetTokenRepository.findByUserAndIsUsedFalseAndIsVerifiedFalse(user)
                .ifPresent(token -> {
                    token.setIsUsed(true);
                    passwordResetTokenRepository.save(token);
                    log.debug("Invalidated previous OTP for username: {}", username);
                });

        // Create and save new token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .otp(otp)
                .email(email)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .isUsed(false)
                .isVerified(false)
                .build();

        resetToken = passwordResetTokenRepository.save(resetToken);
        log.info("New OTP resent for username: {}", username);

        // Send OTP via email
        emailService.sendOtpEmail(email, otp);

        return resetToken;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otp) {
        PasswordResetToken token = passwordResetTokenRepository.findByOtpAndEmail(otp, email)
                .orElse(null);

        if (token == null) {
            log.warn("OTP verification failed: Token not found for email: {}", email);
            return false;
        }

        if (token.isExpired()) {
            log.warn("OTP verification failed: Token expired for email: {}", email);
            return false;
        }

        if (token.getIsUsed() || token.getIsVerified()) {
            log.warn("OTP verification failed: Token already used/verified for email: {}", email);
            return false;
        }

        token.setIsVerified(true);
        passwordResetTokenRepository.save(token);
        log.info("OTP verified successfully for email: {}", email);

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public PasswordResetToken getVerifiedToken(String email) {
        PasswordResetToken token = passwordResetTokenRepository
                .findByEmailAndIsUsedFalseAndIsVerifiedTrue(email)
                .orElse(null);

        if (token != null && token.isExpired()) {
            return null;
        }

        return token;
    }

    @Override
    @Transactional
    public void markTokenAsUsed(PasswordResetToken token) {
        token.setIsUsed(true);
        passwordResetTokenRepository.save(token);
        log.info("Password reset token marked as used for email: {}", token.getEmail());
    }

    private String generateOtp() {
        Random random = new Random();
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int max = (int) Math.pow(10, OTP_LENGTH) - 1;
        int otp = min + random.nextInt(max - min + 1);
        return String.valueOf(otp);
    }

    private String getEmailForUser(User user) {
        // Get email directly from User entity (works for all user types)
        String email = user.getEmail();
        if (email != null) {
            log.info("Found email for user: {}", user.getUsername());
        } else {
            log.warn("No email found for user: {}", user.getUsername());
        }
        return email;
    }
}
