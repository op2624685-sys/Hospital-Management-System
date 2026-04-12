package com.hms.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
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
import com.hms.dto.Request.ForgotPasswordRequestDto;
import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Request.ResetPasswordRequestDto;
import com.hms.dto.Request.SignupRequestDto;
import com.hms.dto.Request.VerifyOtpRequestDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.dto.Response.PasswordResetResponseDto;
import com.hms.dto.Response.SignupResponseDto;
import com.hms.entity.type.BloodGroupType;
import com.hms.entity.type.GenderType;
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
    void signup_ShouldReturnCreated() throws Exception {
        SignupRequestDto request = new SignupRequestDto();
        request.setUsername("testuser");
        request.setPassword("password123");
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setBirthDate(LocalDate.of(1990, 1, 1));
        request.setGender(GenderType.MALE);
        request.setBloodGroup(BloodGroupType.A_POSITIVE);

        SignupResponseDto response = new SignupResponseDto(1L, "testuser", Set.of(RoleType.PATIENT));

        when(authService.signup(any(SignupRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.id").value(1));
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

    
}
