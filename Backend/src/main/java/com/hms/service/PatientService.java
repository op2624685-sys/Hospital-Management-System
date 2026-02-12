package com.hms.service;

import java.time.LocalDate;
import java.util.List;

import com.hms.dto.PatientDto;
import com.hms.dto.Request.PatientRequest;

public interface PatientService {

    List<PatientDto> getAllPatients();

    PatientDto getPatientById(Long id);

    List<PatientDto> getPatientByName(String name);

    PatientDto getPatientByNameAndBirthDate(String name, LocalDate birthDate);

    PatientDto createNewPatient(PatientRequest patientRequest);

    PatientDto updatePatientById(PatientRequest patientRequest);

    String deletePatient(Long id);
}
