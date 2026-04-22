package com.hms.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import com.hms.security.AuthUtil;

import com.hms.dto.PatientDto;
import com.hms.dto.Request.PatientUpdateRequest;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.entity.type.BloodGroupType;
import com.hms.entity.type.GenderType;
import com.hms.error.ValidationException;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;

class PatientServiceImplTest {

    private final PatientRepository patientRepository = org.mockito.Mockito.mock(PatientRepository.class);
    private final UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
    private final ModelMapper modelMapper = org.mockito.Mockito.mock(ModelMapper.class);
    private final AuthUtil authUtil = org.mockito.Mockito.mock(AuthUtil.class);
    private final PatientServiceImpl patientService = new PatientServiceImpl(patientRepository, userRepository, modelMapper, authUtil);

    @Test
    void updatePatientProfileWithNullProfileUpdateCountSetsCountToOne() {
        Long patientId = 1L;
        Patient existingPatient = Patient.builder()
                .id(patientId)
                .user(User.builder().id(patientId).username("patient1").email("p1@example.com").build())
                .name("Patient One")
                .email("p1@example.com")
                .birthDate(LocalDate.of(1998, 1, 20))
                .gender(GenderType.MALE)
                .bloodGroup(BloodGroupType.B_POSITIVE)
                .lastProfileUpdateTime(LocalDateTime.now().minusDays(1))
                .profileUpdateCount(null)
                .build();

        PatientUpdateRequest request = new PatientUpdateRequest(
                LocalDate.of(1998, 1, 20),
                GenderType.MALE,
                BloodGroupType.B_POSITIVE);

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(existingPatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(modelMapper.map(any(Patient.class), eq(PatientDto.class))).thenReturn(new PatientDto());

        PatientDto result = patientService.updatePatientProfileWithEditLimit(patientId, request);

        assertNotNull(result);
        assertEquals(1, existingPatient.getProfileUpdateCount());
        verify(patientRepository).save(existingPatient);
    }

    @Test
    void updatePatientProfileWhenEditLimitReachedThrowsValidationException() {
        Long patientId = 2L;
        Patient existingPatient = Patient.builder()
                .id(patientId)
                .user(User.builder().id(patientId).username("patient2").email("p2@example.com").build())
                .name("Patient Two")
                .email("p2@example.com")
                .birthDate(LocalDate.of(1995, 3, 10))
                .gender(GenderType.FEMALE)
                .bloodGroup(BloodGroupType.A_POSITIVE)
                .lastProfileUpdateTime(LocalDateTime.now().minusDays(1))
                .profileUpdateCount(3)
                .build();

        PatientUpdateRequest request = new PatientUpdateRequest(
                LocalDate.of(1995, 3, 10),
                GenderType.FEMALE,
                BloodGroupType.A_POSITIVE);

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(existingPatient));

        assertThrows(ValidationException.class, () -> patientService.updatePatientProfileWithEditLimit(patientId, request));
        verify(patientRepository, never()).save(any(Patient.class));
    }
}
