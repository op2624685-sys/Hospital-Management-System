package com.hms.dto;

import java.io.Serializable;
import java.util.Set;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDto implements Serializable{

    private Long id;
    private String name;
    private String specialization;
    private String email;
    private Set<DepartmentDto> departments;
    private BranchDto branch;
}
