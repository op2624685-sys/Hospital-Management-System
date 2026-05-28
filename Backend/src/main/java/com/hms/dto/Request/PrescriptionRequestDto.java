package com.hms.dto.Request;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.hms.dto.PrescriptionMedicineDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequestDto {

    @NotBlank(message = "diagnosis is required")
    private String diagnosis;

    private String clinicalNotes;
    private String vitals;

    @Valid
    private List<PrescriptionMedicineDto> medicines = new ArrayList<>();

    private String recommendedTests;
    private String advice;
    private LocalDate followUpDate;
    private String followUpNotes;
}
