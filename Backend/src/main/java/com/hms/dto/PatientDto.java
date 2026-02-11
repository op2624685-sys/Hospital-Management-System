package com.hms.dto;

import java.time.LocalDate;

import com.hms.entity.BloodGroup;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDto {
    
    private Long id;
    private String name;
    private LocalDate birthDate;
    private String gender;
    private BloodGroup bloodGroup;
    private String email;
}
