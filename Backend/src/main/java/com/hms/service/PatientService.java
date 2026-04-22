package com.hms.service;

import java.time.LocalDate;
import java.util.List;

import com.hms.dto.PatientDto;
import com.hms.dto.Request.PatientRequest;
import com.hms.dto.Request.PatientUpdateRequest;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.dto.Response.ProfileCompletionStatusDto;
import com.hms.dto.Response.SignupCompletionResponseDto;

public interface PatientService {

    List<PatientDto> getAllPatients();

    PatientDto getPatientById(Long id);

    List<PatientDto> getPatientByName(String name);

    PatientDto getPatientByNameAndBirthDate(String name, LocalDate birthDate);

    PatientDto createNewPatient(PatientRequest patientRequest);

    SignupCompletionResponseDto registerCurrentUserAsPatient(Long userId, PatientRequest patientRequest);

    PatientDto updatePatientById(PatientRequest patientRequest);

    String deletePatientById(Long id);

    List<PatientResponseDto> getAllPatients(Integer pageNumber, Integer pageSize);
    
    PatientDto updatePatientProfileWithEditLimit(Long patientId, PatientUpdateRequest patientUpdateRequest);
    
    ProfileCompletionStatusDto getProfileCompletionStatus(Long patientId);
}
