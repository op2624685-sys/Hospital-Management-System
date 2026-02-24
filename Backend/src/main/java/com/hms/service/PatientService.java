package com.hms.service;

import java.time.LocalDate;
import java.util.List;

import com.hms.dto.PatientDto;
import com.hms.dto.Request.PatientRequest;
import com.hms.dto.Response.PatientResponseDto;

public interface PatientService {

    List<PatientDto> getAllPatients();

    PatientDto getPatientById(Long id);

    List<PatientDto> getPatientByName(String name);

    PatientDto getPatientByNameAndBirthDate(String name, LocalDate birthDate);

    PatientDto createNewPatient(PatientRequest patientRequest);

    PatientDto updatePatientById(PatientRequest patientRequest);

    String deletePatientById(Long id);

    List<PatientResponseDto> getAllPatients(Integer pageNumber, Integer pageSize);
}
