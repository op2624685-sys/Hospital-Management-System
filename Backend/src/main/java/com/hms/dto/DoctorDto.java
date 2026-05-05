package com.hms.dto;

import java.io.Serializable;
import java.util.Set;

import com.hms.dto.Response.RatingSummaryResponse;
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
    private boolean isHead;
    private Long consultationFee;
    private RatingSummaryResponse ratingSummary;
    private String profilePhoto;
}
