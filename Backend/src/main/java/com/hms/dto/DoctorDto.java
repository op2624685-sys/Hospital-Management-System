package com.hms.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDto {

    private Long id;
    private String name;
    private String speciality;
    private String email;
    private DepartmentDto department;
}
