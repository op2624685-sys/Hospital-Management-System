package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDto {
    
    private Long id;
    private String name;
    private String birthDate;
    private String gender;
    private String bloodGroup;
    private String email;
    
}
