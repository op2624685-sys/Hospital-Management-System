package com.hms.service;

import com.hms.dto.InsuranceDto;
import com.hms.dto.Request.CreateInsuranceRequestDto;
import com.hms.entity.Insurance;
import com.hms.entity.Patient;

public interface InsuranceService {

    Patient assignInsuranceToPatient(Insurance insurance, Long patientId);

    Patient disassociatePatientFromInsurance(Long patientId);

    InsuranceDto createInsuranceForPatient(CreateInsuranceRequestDto createInsuranceRequestDto, Long patientId);

}
