package com.hms.service;

import com.hms.dto.Request.BranchRequestDto;
import com.hms.dto.Response.BranchResponseDto;

public interface BranchService {

    BranchResponseDto createNewBranch(BranchRequestDto branchRequestDto);
}
