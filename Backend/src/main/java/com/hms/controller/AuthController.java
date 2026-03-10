package com.hms.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.config.RateLimitProtected;
import com.hms.dto.Request.ForgotPasswordRequestDto;
import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Request.ResetPasswordRequestDto;
import com.hms.dto.Request.SignupRequestDto;
import com.hms.dto.Request.VerifyOtpRequestDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.dto.Response.PasswordResetResponseDto;
import com.hms.dto.Response.SignupResponseDto;
import com.hms.security.AuthService;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and user registration endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @RateLimitProtected(limiterName = "authRateLimiter")
    @Operation(summary = "User Login", description = "Authenticates user with email and password and returns JWT token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful", content = @Content(schema = @Schema(implementation = LoginResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded", content = @Content(schema = @Schema(implementation = com.hms.error.RateLimitExceededResponse.class)))
    })
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto loginRequestDto) {
        return ResponseEntity.status(200).body(authService.login(loginRequestDto));
    }

    @PostMapping("/signup")
    @RateLimitProtected(limiterName = "authRateLimiter")
    @Operation(summary = "User Registration", description = "Creates a new user account with email and password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Account created successfully", content = @Content(schema = @Schema(implementation = SignupResponseDto.class))),
        @ApiResponse(responseCode = "409", description = "User already exists"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded", content = @Content(schema = @Schema(implementation = com.hms.error.RateLimitExceededResponse.class)))
    })
    public ResponseEntity<SignupResponseDto> signup(@RequestBody @Valid SignupRequestDto signupRequestDto) {
        return ResponseEntity.status(201).body(authService.signup(signupRequestDto));
    }

    @PostMapping("/forgot-password")
    @RateLimitProtected(limiterName = "authRateLimiter")
    @Operation(summary = "Initiate Password Reset", description = "Sends OTP to user's email for password reset")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP sent successfully", content = @Content(schema = @Schema(implementation = PasswordResetResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded", content = @Content(schema = @Schema(implementation = com.hms.error.RateLimitExceededResponse.class)))
    })
    public ResponseEntity<PasswordResetResponseDto> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDto forgotPasswordRequestDto) {
        return ResponseEntity.status(200).body(authService.forgotPassword(forgotPasswordRequestDto));
    }

    @PostMapping("/verify-otp")
    @RateLimitProtected(limiterName = "authRateLimiter")
    @Operation(summary = "Verify OTP", description = "Validates the OTP sent to user's email during password reset")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP verified successfully", content = @Content(schema = @Schema(implementation = PasswordResetResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Invalid OTP"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded", content = @Content(schema = @Schema(implementation = com.hms.error.RateLimitExceededResponse.class)))
    })
    public ResponseEntity<PasswordResetResponseDto> verifyOtp(@RequestBody @Valid VerifyOtpRequestDto verifyOtpRequestDto) {
        return ResponseEntity.status(200).body(authService.verifyOtp(verifyOtpRequestDto));
    }

    @PostMapping("/reset-password")
    @RateLimitProtected(limiterName = "authRateLimiter")
    @Operation(summary = "Reset Password", description = "Sets new password after OTP verification")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset successfully", content = @Content(schema = @Schema(implementation = PasswordResetResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Invalid token or OTP"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded", content = @Content(schema = @Schema(implementation = com.hms.error.RateLimitExceededResponse.class)))
    })
    public ResponseEntity<PasswordResetResponseDto> resetPassword(@RequestBody @Valid ResetPasswordRequestDto resetPasswordRequestDto) {
        return ResponseEntity.status(200).body(authService.resetPassword(resetPasswordRequestDto));
    }

    @PostMapping("/resend-otp")
    @RateLimitProtected(limiterName = "authRateLimiter")
    @Operation(summary = "Resend OTP", description = "Resends OTP to user's email if not received")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP resent successfully", content = @Content(schema = @Schema(implementation = PasswordResetResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded", content = @Content(schema = @Schema(implementation = com.hms.error.RateLimitExceededResponse.class)))
    })
    public ResponseEntity<PasswordResetResponseDto> resendOtp(@RequestBody @Valid ForgotPasswordRequestDto forgotPasswordRequestDto) {
        return ResponseEntity.status(200).body(authService.resendOtp(forgotPasswordRequestDto));
    }

}
