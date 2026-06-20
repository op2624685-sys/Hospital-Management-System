package com.hms.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.entity.Appointment;
import com.hms.entity.Branch;
import com.hms.entity.Department;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.Receptionist;
import com.hms.entity.User;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.type.BloodGroupType;
import com.hms.entity.type.GenderType;
import com.hms.error.ValidationException;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.ReceptionistRepository;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class ReceptionistServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private ReceptionistRepository receptionistRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ReceptionistServiceImpl receptionistService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateAppointmentStatus_ShouldAssignQueueNumberAndTimestamp() {
        Receptionist receptionist = receptionist();
        Appointment appointment = appointment(AppointmentStatusType.VISITED);
        authenticate(receptionist.getUser());

        when(receptionistRepository.findById(1L)).thenReturn(Optional.of(receptionist));
        when(appointmentRepository.findByAppointmentIdAndBranch_IdAndDepartment_Id(
                "apt-1", 10L, 100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.findMaxQueueNumber(10L, 100L, 50L, LocalDate.now())).thenReturn(3);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppointmentResponseDto response = receptionistService.updateAppointmentStatus("apt-1", AppointmentStatusType.QUEUED);

        assertThat(response.getStatus()).isEqualTo(AppointmentStatusType.QUEUED);
        assertThat(response.getQueueNumber()).isEqualTo(4);
        assertThat(response.getQueueDate()).isEqualTo(LocalDate.now());
        assertThat(response.getQueuedAt()).isNotNull();
    }

    @Test
    void updateAppointmentStatus_ShouldRejectInvalidTransition() {
        Receptionist receptionist = receptionist();
        Appointment appointment = appointment(AppointmentStatusType.CONFIRMED);
        authenticate(receptionist.getUser());

        when(receptionistRepository.findById(1L)).thenReturn(Optional.of(receptionist));
        when(appointmentRepository.findByAppointmentIdAndBranch_IdAndDepartment_Id(
                "apt-1", 10L, 100L)).thenReturn(Optional.of(appointment));

        assertThrows(ValidationException.class,
                () -> receptionistService.updateAppointmentStatus("apt-1", AppointmentStatusType.COMPLETED));
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList()));
    }

    private Receptionist receptionist() {
        User user = User.builder().id(1L).username("desk").build();
        Branch branch = new Branch();
        branch.setId(10L);
        branch.setName("Central");
        Department department = new Department();
        department.setId(100L);
        department.setName("Cardiology");
        department.setBranch(branch);
        return Receptionist.builder()
                .id(1L)
                .user(user)
                .name("Desk User")
                .email("desk@example.com")
                .branch(branch)
                .department(department)
                .build();
    }

    private Appointment appointment(AppointmentStatusType status) {
        Branch branch = new Branch();
        branch.setId(10L);
        branch.setName("Central");

        Department department = new Department();
        department.setId(100L);
        department.setName("Cardiology");
        department.setBranch(branch);

        Doctor doctor = Doctor.builder()
                .id(50L)
                .name("Asha")
                .specialization("Cardiology")
                .build();
        doctor.setBranch(branch);

        Patient patient = Patient.builder()
                .id(70L)
                .name("Patient One")
                .email("patient@example.com")
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(GenderType.MALE)
                .bloodGroup(BloodGroupType.A_POSITIVE)
                .build();

        return Appointment.builder()
                .appointmentId("apt-1")
                .appointmentTime(LocalDateTime.now().plusHours(2))
                .status(status)
                .doctor(doctor)
                .patient(patient)
                .branch(branch)
                .department(department)
                .reason("Review")
                .confirmedAt(LocalDateTime.now())
                .build();
    }
}
