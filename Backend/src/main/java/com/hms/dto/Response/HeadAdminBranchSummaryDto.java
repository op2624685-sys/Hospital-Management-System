package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeadAdminBranchSummaryDto {

    private Long branchId;
    private String branchName;
    private String branchAddress;
    private String branchContactNumber;
    private String branchEmail;
    private String adminName;
    private String adminUsername;
    private Long adminCount;
    private Long doctorCount;
    private Long patientCount;
    private Long departmentCount;
    private Long appointmentCount;
    private Long estimatedRevenue;
}
