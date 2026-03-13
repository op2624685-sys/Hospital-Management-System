package com.hms.dto.Request;

import java.time.LocalDate;

import com.hms.entity.type.BloodGroupType;
import com.hms.entity.type.GenderType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {
    
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;

    @NotNull(message = "Gender is required")
    private GenderType gender;

    @NotNull(message = "Blood group is required")
    private BloodGroupType bloodGroup;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
}
