package com.hms.dto.Request;

import java.time.LocalDate;

import com.hms.entity.type.BloodGroupType;
import com.hms.entity.type.GenderType;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {
    
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Birth date is required")
    private LocalDate birthDate;

    @NotBlank(message = "Gender is required")
    private GenderType gender;

    @NotBlank(message = "Blood group is required")
    private BloodGroupType bloodGroup;

    @NotBlank(message = "Email is required")
    private String email;
}
