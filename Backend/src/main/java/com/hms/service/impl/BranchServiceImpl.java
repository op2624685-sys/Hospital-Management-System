package com.hms.service.impl;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import com.hms.dto.BranchDto;
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
    @CacheEvict(value = "branches", allEntries = true)
    public BranchResponseDto createNewBranch(BranchRequestDto branchRequestDto) {
        Branch branch = new Branch();
        branch.setName(branchRequestDto.getBranchName());
        branch.setAddress(branchRequestDto.getBranchAddress());
        branch.setContactNumber(branchRequestDto.getBranchContactNumber());
        branch.setEmail(branchRequestDto.getBranchEmail());
        Branch savedBranch = branchRepository.save(branch);
        return modelMapper.map(savedBranch, BranchResponseDto.class);
    }

    @Override
    @Cacheable(value = "branches", key = "'all'")
    public List<BranchDto> getAllBranches() {
        return branchRepository.findAll()
                .stream()
                .map(branch -> modelMapper.map(branch, BranchDto.class))
                .collect(Collectors.toList());
    }


}
