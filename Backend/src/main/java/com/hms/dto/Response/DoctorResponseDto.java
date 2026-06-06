package com.hms.dto.Response;

import java.io.Serializable;
import java.util.Set;

import com.hms.dto.DepartmentDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponseDto implements Serializable {
    
    public DoctorResponseDto(Long id2, String name2, String specialization2, String email2,
            Set<DepartmentDto> mapDepartments, BranchResponseDto mapBranchResponse, Long consultationFee2,
            String profilePhoto2, String doctorStampUrl2) {
        this.id = id2;
        this.name = name2;
        this.specialization = specialization2;
        this.email = email2;
        this.departments = mapDepartments;
        this.branch = mapBranchResponse;
        this.consultationFee = consultationFee2;
        this.profilePhoto = profilePhoto2;
        this.doctorStampUrl = doctorStampUrl2;
    }
    private Long id;
    private String name;
    private String specialization;
    private String email;
    private Set<DepartmentDto> departments;
    private BranchResponseDto branch;
    private Long consultationFee;
    private String profilePhoto;
    private String doctorStampUrl;
    private Double averageRating = 0.0;
    private Long totalReviews = 0L;

}