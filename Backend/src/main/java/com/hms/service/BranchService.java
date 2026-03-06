package com.hms.service;

import com.hms.dto.Request.BranchRequestDto;
import com.hms.dto.BranchDto;
import com.hms.dto.Response.BranchResponseDto;
import java.util.List;

public interface BranchService {

    BranchResponseDto createNewBranch(BranchRequestDto branchRequestDto);

    List<BranchDto> getAllBranches();
}
