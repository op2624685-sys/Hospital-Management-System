package com.hms.dto.Response;

import java.util.List;

import com.hms.dto.AdminDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeadAdminBranchDetailsDto {

    private HeadAdminBranchSummaryDto summary;
    private List<AdminDto> admins;
    private List<HeadAdminDoctorInfoDto> doctors;
    private List<PatientResponseDto> patients;
    private List<HeadAdminDepartmentDetailsDto> departments;
}
