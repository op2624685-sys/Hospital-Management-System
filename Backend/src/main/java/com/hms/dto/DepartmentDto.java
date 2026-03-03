package com.hms.dto;

import java.util.Set;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentDto {

    private Long id;
    private String name;
    private Long branchId;
    private Long headDoctorId;
    private Set<Long> doctorIds;

}
