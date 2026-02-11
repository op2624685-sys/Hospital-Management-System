package com.hms.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.hms.dto.PatientDto;
import com.hms.entity.Patient;
import com.hms.repository.PatientRepository;
import com.hms.service.PatientService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<PatientDto> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        return patients
                .stream()
                .map(Patient -> modelMapper.map(patients, PatientDto.class))
                .toList();
    }

}
