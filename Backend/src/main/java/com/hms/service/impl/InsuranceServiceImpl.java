package com.hms.service.impl;

import org.springframework.stereotype.Service;

import com.hms.entity.Insurance;
import com.hms.entity.Patient;
import com.hms.repository.InsuranceRepository;
import com.hms.repository.PatientRepository;
import com.hms.service.InsuranceService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class InsuranceServiceImpl implements InsuranceService {
    
    private final InsuranceRepository insuranceRepository;
    private final PatientRepository patientRepository;
    
    @Override
    @Transactional
    public Patient assignInsuranceToPatient(Insurance insurance, Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));
        
        patient.setInsurance(insurance);
        insurance.setPatient(patient); // Ensure bidirectional consistency

        return patient;
    }

    @Override
    @Transactional
    public Patient disassociatePatientFromInsurance(Long patientId) {
        Patient patient = patientRepository.findById(patientId).orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));
        
        patient.setInsurance(null);

        return patient;
    }
}
