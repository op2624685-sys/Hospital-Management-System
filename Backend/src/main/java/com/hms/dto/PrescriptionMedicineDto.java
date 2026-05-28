package com.hms.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicineDto implements Serializable {

    @NotBlank(message = "medicineName is required")
    private String medicineName;

    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
