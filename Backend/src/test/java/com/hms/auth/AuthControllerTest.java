package com.hms.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hms.controller.AuthController;
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
import com.hms.entity.type.RoleType;
import com.hms.security.AuthService;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void login_ShouldReturnOk() throws Exception {
        LoginRequestDto request = new LoginRequestDto("testuser", "password");
        LoginResponseDto response = new LoginResponseDto("token", 1L, Set.of(RoleType.PATIENT));

        when(authService.login(any(LoginRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"))
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    void requestSignupMagicLink_ShouldReturnOk() throws Exception {
        MagicLinkSignupRequestDto request = new MagicLinkSignupRequestDto("test@example.com");

        MagicLinkResponseDto response = MagicLinkResponseDto.builder()
                .success(true)
                .message("Magic link sent to your email address")
                .email("test@example.com")
                .build();

        when(authService.requestSignupMagicLink(any(MagicLinkSignupRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/signup-link")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void completeSignupWithMagicLink_ShouldReturnOk() throws Exception {
        MagicLinkSignupCompleteRequestDto request = new MagicLinkSignupCompleteRequestDto();
        request.setToken("magic-token");
        request.setUsername("testuser");
        request.setPassword("password123");

        SignupCompletionResponseDto response = SignupCompletionResponseDto.builder()
                .token("token")
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .build();

        when(authService.completeSignupWithMagicLink(any(MagicLinkSignupCompleteRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/signup/complete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    void forgotPassword_ShouldReturnOk() throws Exception {
        ForgotPasswordRequestDto request = new ForgotPasswordRequestDto();
        request.setUsername("testuser");
        
        PasswordResetResponseDto response = PasswordResetResponseDto.builder()
                .message("OTP sent successfully")
                .success(true)
                .email("test@example.com")
                .build();

        when(authService.forgotPassword(any(ForgotPasswordRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("OTP sent successfully"))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void verifyOtp_ShouldReturnOk() throws Exception {
        VerifyOtpRequestDto request = new VerifyOtpRequestDto();
        request.setEmail("test@example.com");
        request.setOtp("123456");

        PasswordResetResponseDto response = PasswordResetResponseDto.builder()
                .message("OTP verified successfully")
                .success(true)
                .email("test@example.com")
                .build();

        when(authService.verifyOtp(any(VerifyOtpRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("OTP verified successfully"))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void resetPassword_ShouldReturnOk() throws Exception {
        ResetPasswordRequestDto request = new ResetPasswordRequestDto();
        request.setEmail("test@example.com");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        PasswordResetResponseDto response = PasswordResetResponseDto.builder()
                .message("Password reset successfully")
                .success(true)
                .email("test@example.com")
                .build();

        when(authService.resetPassword(any(ResetPasswordRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void resendOtp_ShouldReturnOk() throws Exception {
        ForgotPasswordRequestDto request = new ForgotPasswordRequestDto();
        request.setUsername("testuser");

        PasswordResetResponseDto response = PasswordResetResponseDto.builder()
                .message("OTP resent successfully")
                .success(true)
                .email("test@example.com")
                .build();

        when(authService.resendOtp(any(ForgotPasswordRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/resend-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("OTP resent successfully"))
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getCurrentUser_ShouldReturnOk() throws Exception {
        LoginResponseDto response = new LoginResponseDto("token", 1L, Set.of(RoleType.PATIENT));

        when(authService.getCurrentUser()).thenReturn(response);

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1));
    }
}
