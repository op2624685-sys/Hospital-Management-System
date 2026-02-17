package com.hms.dto;

import java.time.LocalDate;

import com.hms.entity.type.BloodGroupType;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDto {
    
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Birth date is required")
    private LocalDate birthDate;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Blood group is required")
    private BloodGroupType bloodGroup;

    @NotBlank(message = "Email is required")
    private String email;
}
