package com.hms.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.hms.dto.PatientDto;
import com.hms.dto.Request.PatientRequest;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.entity.Patient;
import com.hms.repository.PatientRepository;
import com.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;

    @Override
    @Cacheable(value = "patients", key = "'all'")
    public List<PatientDto> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        return patients
                .stream()
                .map(patient -> modelMapper.map(patient, PatientDto.class))
                .toList();
    }

    @Override
    @Cacheable(value = "patients", key = "#id")
    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        return modelMapper.map(patient, PatientDto.class);
    }

    @Override
    @Cacheable(value = "patients", key = "'name:' + #name")
    public List<PatientDto> getPatientByName(String name) {
        List<Patient> patients = patientRepository.findByName(name);
        return patients
                .stream()
                .map(patient -> modelMapper.map(patient, PatientDto.class))
                .toList();
    }
    
    @Override
    public PatientDto getPatientByNameAndBirthDate(String name, LocalDate birthDate) {
        List<Patient> patients = patientRepository.findByNameAndBirthDate(name, birthDate);
        if (patients.isEmpty()) {
            throw new RuntimeException("Patient not found with name: " + name + " and birth date: " + birthDate);
        }
        return modelMapper.map(patients.get(0), PatientDto.class);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "patients", allEntries = true)
    })
    public PatientDto createNewPatient(PatientRequest patientRequest) {
        Patient patient = modelMapper.map(patientRequest, Patient.class);
        Patient savedPatient = patientRepository.save(patient);
        return modelMapper.map(savedPatient, PatientDto.class);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "patients", allEntries = true)
    })
    public String deletePatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        patientRepository.delete(patient);
        return "Patient deleted successfully with id: " + id;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "patients", allEntries = true)
    })
    public PatientDto updatePatientById(PatientRequest patientRequest) {
        Patient patient = modelMapper.map(patientRequest, Patient.class);
        Patient updatedPatient = patientRepository.save(patient);
        return modelMapper.map(updatedPatient, PatientDto.class);
    }

    @Override
    @Cacheable(value = "patients", key = "'all:' + #pageNumber + ':' + #pageSize")
    public List<PatientResponseDto> getAllPatients(Integer pageNumber, Integer pageSize) {
        return patientRepository.findAllPatients(PageRequest.of(pageNumber, pageSize))
                .stream()
                .map(patient -> modelMapper.map(patient, PatientResponseDto.class))
                .collect(Collectors.toList());
    }

}
