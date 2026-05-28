package com.hms.dto.Response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.hms.dto.PrescriptionMedicineDto;
import com.hms.entity.type.PrescriptionDocumentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDto {

    private Long id;
    private String appointmentId;
    private String diagnosis;
    private String clinicalNotes;
    private String vitals;
    private List<PrescriptionMedicineDto> medicines = new ArrayList<>();
    private String recommendedTests;
    private String advice;
    private LocalDate followUpDate;
    private String followUpNotes;
    private PrescriptionDocumentStatus documentStatus;
    private String documentUrl;
    private LocalDateTime documentGeneratedAt;
    private String generationError;
    private Integer generationAttemptCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private AppointmentResponseDto appointment;
}
