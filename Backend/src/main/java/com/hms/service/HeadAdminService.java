package com.hms.service;

import java.util.List;

import com.hms.dto.Response.HeadAdminBranchDetailsDto;
import com.hms.dto.Response.HeadAdminBranchSummaryDto;

public interface HeadAdminService {

    List<HeadAdminBranchSummaryDto> getBranchOverview();

    HeadAdminBranchDetailsDto getBranchDetails(Long branchId);

    List<String> suggestUsernames(String query);

    List<String> suggestBranchNames(String query);
}
