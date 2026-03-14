package com.hms.dto.Response;

import java.io.Serializable;
import java.util.Set;

import com.hms.dto.DepartmentDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorResponseDto implements Serializable{
    
    private Long id;
    private String name;
    private String specialization;
    private String email;
    private Set<DepartmentDto> departments;
    private BranchResponseDto branch;
}
