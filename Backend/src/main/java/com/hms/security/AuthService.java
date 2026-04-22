package com.hms.security;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.Request.MagicLinkSignupCompleteRequestDto;
import com.hms.dto.Request.MagicLinkSignupRequestDto;
import com.hms.dto.Request.ForgotPasswordRequestDto;
import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Request.ResetPasswordRequestDto;
import com.hms.dto.Request.VerifyOtpRequestDto;
import com.hms.dto.Response.MagicLinkResponseDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.dto.Response.PasswordResetResponseDto;
import com.hms.dto.Response.SignupCompletionResponseDto;
import com.hms.entity.PasswordResetToken;
import com.hms.entity.SignupMagicLinkToken;
import com.hms.entity.User;
import com.hms.error.ConflictException;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.SignupMagicLinkTokenRepository;
import com.hms.repository.UserRepository;
import com.hms.service.EmailService;
import com.hms.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final SignupMagicLinkTokenRepository signupMagicLinkTokenRepository;
    private final EmailService emailService;

    @Transactional
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = authUtil.generateAccessToken(user);

        return new LoginResponseDto(token, user.getId(), user.getRoles());
    }

    @Transactional
    public MagicLinkResponseDto requestSignupMagicLink(MagicLinkSignupRequestDto requestDto) {
        String email = requestDto.getEmail().trim().toLowerCase();

        signupMagicLinkTokenRepository.findByEmailAndIsUsedFalse(email)
                .ifPresent(existing -> {
                    existing.setIsUsed(true);
                    signupMagicLinkTokenRepository.save(existing);
                });

        String token = UUID.randomUUID().toString().replace("-", "");
        SignupMagicLinkToken signupToken = SignupMagicLinkToken.builder()
                .token(token)
                .email(email)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .isUsed(false)
                .build();

        signupMagicLinkTokenRepository.save(signupToken);

        String magicLink = buildSignupMagicLink(token);
        emailService.sendMail(
                email,
                "Complete your MediCore HMS signup",
                """
                        We received a request to create a MediCore HMS account for this email.

                        Complete your signup by opening this link:
                        %s

                        This link expires in 15 minutes and can only be used once.
                        
                        If you did not request this, you can ignore this email.
                        """
                        .formatted(magicLink));

        return MagicLinkResponseDto.builder()
                .success(true)
                .message("Magic link sent to your email address")
                .email(email)
                .build();
    }

    @Transactional
    public SignupCompletionResponseDto completeSignupWithMagicLink(MagicLinkSignupCompleteRequestDto requestDto) {
        String tokenValue = requestDto.getToken().trim();

        SignupMagicLinkToken signupToken = signupMagicLinkTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new ValidationException("Invalid signup link"));

        String email = signupToken.getEmail().trim().toLowerCase();
        String username = requestDto.getUsername() == null ? "" : requestDto.getUsername().trim();
        String rawPassword = requestDto.getPassword() == null ? "" : requestDto.getPassword();

        // If account already exists for this email, treat this as magic-link login.
        User existingUser = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (existingUser != null) {
            if (signupToken.isExpired()) {
                throw new ValidationException("Signup link has expired");
            }

            if (!signupToken.getIsUsed()) {
                signupToken.setIsUsed(true);
                signupMagicLinkTokenRepository.save(signupToken);
            }

            return buildSignupCompletionResponse(existingUser);
        }

        if (signupToken.getIsUsed() || signupToken.isExpired()) {
            throw new ValidationException("Signup link has expired or was already used");
        }

        if (username.isBlank()) {
            throw new ValidationException("Username is required for new signup");
        }

        if (rawPassword.isBlank()) {
            throw new ValidationException("Password is required for new signup");
        }

        if (rawPassword.length() < 6) {
            throw new ValidationException("Password must be at least 6 characters");
        }

        // In future replace that to the bloom filter search
        if (userRepository.findByUsernameIgnoreCase(username).isPresent()) {
            throw new ConflictException("Username already exists");
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .email(email)
                .build();
        user = userRepository.save(user);

        signupToken.setIsUsed(true);
        signupMagicLinkTokenRepository.save(signupToken);

        return buildSignupCompletionResponse(user);
    }

    @Transactional
    public PasswordResetResponseDto forgotPassword(ForgotPasswordRequestDto forgotPasswordRequestDto) {
        String username = forgotPasswordRequestDto.getUsername();
        
        log.info("Sending OTP for password reset for username: {}", username);
        otpService.generateAndSaveOtp(username);
        
        // Get the user and their email directly from the User entity
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        String email = user.getEmail();
        if (email == null) {
            throw new ValidationException("Email not found for user");
        }
        
        return PasswordResetResponseDto.builder()
                .message("OTP has been sent to your registered email address")
                .success(true)
                .email(email)
                .build();
    }

    @Transactional
    public PasswordResetResponseDto verifyOtp(VerifyOtpRequestDto verifyOtpRequestDto) {
        String email = verifyOtpRequestDto.getEmail();
        String otp = verifyOtpRequestDto.getOtp();
        
        boolean isVerified = otpService.verifyOtp(email, otp);
        
        if (!isVerified) {
            throw new ValidationException("Invalid or expired OTP");
        }
        
        log.info("OTP verified successfully for email: {}", email);
        
        return PasswordResetResponseDto.builder()
                .message("OTP verified successfully. You can now reset your password")
                .success(true)
                .email(email)
                .build();
    }

    @Transactional
    public PasswordResetResponseDto resetPassword(ResetPasswordRequestDto resetPasswordRequestDto) {
        String email = resetPasswordRequestDto.getEmail();
        String newPassword = resetPasswordRequestDto.getNewPassword();
        String confirmPassword = resetPasswordRequestDto.getConfirmPassword();
        
        if (!newPassword.equals(confirmPassword)) {
            throw new ValidationException("Passwords do not match");
        }
        
        // Verify token exists and is verified
        PasswordResetToken token = otpService.getVerifiedToken(email);
        if (token == null) {
            throw new ValidationException("Please verify OTP first");
        }
        
        // Get user from the token (already associated)
        User user = token.getUser();
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        otpService.markTokenAsUsed(token);
        
        log.info("Password reset successfully for email: {}", email);
        
        return PasswordResetResponseDto.builder()
                .message("Password has been reset successfully")
                .success(true)
                .email(email)
                .build();
    }

    @Transactional
    public PasswordResetResponseDto resendOtp(ForgotPasswordRequestDto forgotPasswordRequestDto) {
        String username = forgotPasswordRequestDto.getUsername();
        
        log.info("Resending OTP for password reset for username: {}", username);
        otpService.resendOtp(username);
        
        // Get the user and their email directly from the User entity
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        String email = user.getEmail();
        if (email == null) {
            throw new ValidationException("Email not found for user");
        }
        
        return PasswordResetResponseDto.builder()
                .message("OTP has been resent to your registered email address")
                .success(true)
                .email(email)
                .build();
    }

    public LoginResponseDto getCurrentUser() {
        Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        User user = (User) auth.getPrincipal();
        return new LoginResponseDto(null, user.getId(), user.getRoles());
    }

    private String buildSignupMagicLink(String token) {
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
        return frontendUrl + "/signup/complete?token=" + token;
    }

    private SignupCompletionResponseDto buildSignupCompletionResponse(User user) {
        String jwt = authUtil.generateAccessToken(user);
        return SignupCompletionResponseDto.builder()
                .token(jwt)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }

}
