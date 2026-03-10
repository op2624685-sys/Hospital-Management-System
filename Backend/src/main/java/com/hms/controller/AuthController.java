package com.hms.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.Request.ForgotPasswordRequestDto;
import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Request.ResetPasswordRequestDto;
import com.hms.dto.Request.SignupRequestDto;
import com.hms.dto.Request.VerifyOtpRequestDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.dto.Response.PasswordResetResponseDto;
import com.hms.dto.Response.SignupResponseDto;
import com.hms.security.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto loginRequestDto) {
        return ResponseEntity.status(200).body(authService.login(loginRequestDto));
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> signup(@RequestBody @Valid SignupRequestDto signupRequestDto) {
        return ResponseEntity.status(201).body(authService.signup(signupRequestDto));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetResponseDto> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDto forgotPasswordRequestDto) {
        return ResponseEntity.status(200).body(authService.forgotPassword(forgotPasswordRequestDto));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<PasswordResetResponseDto> verifyOtp(@RequestBody @Valid VerifyOtpRequestDto verifyOtpRequestDto) {
        return ResponseEntity.status(200).body(authService.verifyOtp(verifyOtpRequestDto));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponseDto> resetPassword(@RequestBody @Valid ResetPasswordRequestDto resetPasswordRequestDto) {
        return ResponseEntity.status(200).body(authService.resetPassword(resetPasswordRequestDto));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<PasswordResetResponseDto> resendOtp(@RequestBody @Valid ForgotPasswordRequestDto forgotPasswordRequestDto) {
        return ResponseEntity.status(200).body(authService.resendOtp(forgotPasswordRequestDto));
    }

}
