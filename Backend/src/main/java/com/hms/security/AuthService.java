package com.hms.security;

import java.util.HashSet;
import java.util.Set;

// import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.Request.ForgotPasswordRequestDto;
import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Request.ResetPasswordRequestDto;
import com.hms.dto.Request.SignupRequestDto;
import com.hms.dto.Request.VerifyOtpRequestDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.dto.Response.PasswordResetResponseDto;
import com.hms.dto.Response.SignupResponseDto;
import com.hms.entity.PasswordResetToken;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.error.ConflictException;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
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
    // private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final OtpService otpService;

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
    public SignupResponseDto signup(SignupRequestDto signupRequestDto) {
        User user = userRepository.findByUsername(signupRequestDto.getUsername()).orElse(null);
        if (user != null) {
            throw new ConflictException("User already exists");
        }
        

        //# This is made with using modelMapper !!!!
        // user = userRepository.save(User.builder()
        //         .username(signupRequestDto.getUsername())
        //         .password(passwordEncoder.encode(signupRequestDto.getPassword()))
        //         .roles(Set.of(RoleType.PATIENT))
        //         .build()
        // );
        // return modelMapper.map(user, SignupResponseDto.class);


        user = User.builder()
            .username(signupRequestDto.getUsername())
            .password(passwordEncoder.encode(signupRequestDto.getPassword()))
            .email(signupRequestDto.getEmail())
            .roles(new HashSet<>(Set.of(RoleType.PATIENT)))
            .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder()
            .name(signupRequestDto.getName())
            .email(signupRequestDto.getEmail())
            .birthDate(signupRequestDto.getBirthDate())
            .bloodGroup(signupRequestDto.getBloodGroup())
            .gender(signupRequestDto.getGender())
            .profileUpdateCount(0)
            .user(user)
            .build();
        patientRepository.save(patient);

        return SignupResponseDto.builder()
        .id(user.getId())
        .username(user.getUsername())
        .roles(user.getRoles())
        .build();
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

}
