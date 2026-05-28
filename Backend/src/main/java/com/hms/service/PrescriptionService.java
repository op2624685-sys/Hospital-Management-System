package com.hms.service;

import com.hms.dto.Request.PrescriptionRequestDto;
import com.hms.dto.Response.PrescriptionResponseDto;

public interface PrescriptionService {

    PrescriptionResponseDto createPrescription(String appointmentId, PrescriptionRequestDto request);

    PrescriptionResponseDto updatePrescription(String appointmentId, PrescriptionRequestDto request);

    PrescriptionResponseDto getPrescription(String appointmentId);

    PrescriptionResponseDto retryGeneration(String appointmentId);

    void generateDocument(Long prescriptionId, java.time.LocalDateTime requestVersion);
}
