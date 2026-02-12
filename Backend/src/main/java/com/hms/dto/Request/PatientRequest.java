package com.hms.dto.Request;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {
    
    private String name;
    private LocalDate birthDate;
    private String gender;
    private String bloodGroup;
    private String email;
}
