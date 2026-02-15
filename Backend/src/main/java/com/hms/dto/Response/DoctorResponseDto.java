package com.hms.dto.Response;

import com.hms.dto.DepartmentDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorResponseDto {
    
    private Long id;
    private String name;
    private String specialization;
    private String email;
    private DepartmentDto department;
}
