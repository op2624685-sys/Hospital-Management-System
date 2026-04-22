package com.hms.patient;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.controller.PatientController;
import com.hms.dto.Request.PatientRequest;
import com.hms.dto.Response.SignupCompletionResponseDto;
import com.hms.entity.User;
import com.hms.entity.type.BloodGroupType;
import com.hms.entity.type.GenderType;
import com.hms.entity.type.RoleType;
import com.hms.service.AppointmentService;
import com.hms.service.InsuranceService;
import com.hms.service.PatientService;

@ExtendWith(MockitoExtension.class)
class PatientControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PatientService patientService;

    @Mock
    private AppointmentService appointmentService;

    @Mock
    private InsuranceService insuranceService;

    @InjectMocks
    private PatientController patientController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        SecurityContextHolder.clearContext();
    }

    @Test
    void registerPatient_ShouldReturnCreated() throws Exception {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));

        PatientRequest request = new PatientRequest(
                "Test User",
                java.time.LocalDate.of(1990, 1, 1),
                GenderType.MALE,
                BloodGroupType.A_POSITIVE,
                "test@example.com");

        SignupCompletionResponseDto response = SignupCompletionResponseDto.builder()
                .token("token")
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .roles(Set.of(RoleType.PATIENT))
                .build();

        when(patientService.registerCurrentUserAsPatient(any(Long.class), any(PatientRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/patients/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.roles[0]").value("PATIENT"));
    }
}
