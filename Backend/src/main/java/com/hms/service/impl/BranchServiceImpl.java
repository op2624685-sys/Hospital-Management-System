package com.hms.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.hms.dto.Request.BranchRequestDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.entity.Branch;
import com.hms.repository.BranchRepository;
import com.hms.service.BranchService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final ModelMapper modelMapper;

    @Override
    public BranchResponseDto createNewBranch(BranchRequestDto branchRequestDto) {
        Branch branch = modelMapper.map(branchRequestDto, Branch.class);
        Branch savedBranch = branchRepository.save(branch);
        return modelMapper.map(savedBranch, BranchResponseDto.class);
    }


}
