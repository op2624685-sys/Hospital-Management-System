package com.hms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.AdminDto;
import com.hms.dto.Request.BranchRequestDto;
import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.service.AdminService;
import com.hms.service.BranchService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/head-admin")
@RequiredArgsConstructor
public class HeadAdminController {

    private final AdminService adminService;
    private final BranchService branchService;

    
    @PostMapping("/onBoardNewAdmin")
    public ResponseEntity<AdminResponseDto> onBoardNewAdmin(
            @Valid @RequestBody OnBoardAdminRequestDto onBoardAdminRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.onBoardNewAdmin(onBoardAdminRequestDto));
    }

    @GetMapping("/getAllAdmins")
    public ResponseEntity<List<AdminDto>> getAllAdmins() {
        return ResponseEntity.status(HttpStatus.OK).body(adminService.getAllAdmins());
    }

    @PostMapping("/createNewBranch")
    public ResponseEntity<BranchResponseDto> createNewBranch(
        @Valid @RequestBody BranchRequestDto branchRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.createNewBranch(branchRequestDto));
    }
}
