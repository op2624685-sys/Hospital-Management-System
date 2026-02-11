package com.hms.service;

import com.hms.entity.Insurance;
import com.hms.entity.Patient;

public interface InsuranceService {

    Patient assignInsuranceToPatient(Insurance insurance, Long patientId);

}
