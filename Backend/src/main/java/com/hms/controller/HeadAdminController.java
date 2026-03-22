package com.hms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.hms.dto.AdminDto;
import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.CreateDepartmentTemplateRequestDto;
import com.hms.dto.Request.BranchRequestDto;
import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.dto.Response.HeadAdminBranchDetailsDto;
import com.hms.dto.Response.HeadAdminBranchSummaryDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.service.AdminService;
import com.hms.service.BranchService;
import com.hms.service.DepartmentService;
import com.hms.service.HeadAdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/head-admin")
@RequiredArgsConstructor
public class HeadAdminController {

    private final AdminService adminService;
    private final BranchService branchService;
    private final HeadAdminService headAdminService;
    private final DepartmentService departmentService;

    
    @GetMapping("/getAllAdmins")
    public ResponseEntity<List<AdminDto>> getAllAdmins() {
        return ResponseEntity.status(HttpStatus.OK).body(adminService.getAllAdmins());
    }

    @GetMapping("/overview")
    public ResponseEntity<List<HeadAdminBranchSummaryDto>> getBranchOverview() {
        return ResponseEntity.ok(headAdminService.getBranchOverview());
    }

    @GetMapping("/branch/{branchId}/details")
    public ResponseEntity<HeadAdminBranchDetailsDto> getBranchDetails(
            @PathVariable(name = "branchId") Long branchId) {
        return ResponseEntity.ok(headAdminService.getBranchDetails(branchId));
    }

    @GetMapping("/user-suggestions")
    public ResponseEntity<List<String>> suggestUsernames(
            @RequestParam(name = "query", defaultValue = "") String query) {
        return ResponseEntity.ok(headAdminService.suggestUsernames(query));
    }

    @GetMapping("/branch-suggestions")
    public ResponseEntity<List<String>> suggestBranchNames(
            @RequestParam(name = "query", defaultValue = "") String query) {
        return ResponseEntity.ok(headAdminService.suggestBranchNames(query));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDto>> getDepartmentTemplates() {
        return ResponseEntity.ok(departmentService.getDepartmentTemplates());
    }

    @PostMapping("/departments")
    public ResponseEntity<DepartmentDto> createDepartmentTemplate(
            @Valid @RequestBody CreateDepartmentTemplateRequestDto createDepartmentTemplateRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.createDepartmentTemplate(createDepartmentTemplateRequestDto));
    }

    @PostMapping("/onBoardNewAdmin")
    public ResponseEntity<AdminResponseDto> onBoardNewAdmin(
            @Valid @RequestBody OnBoardAdminRequestDto onBoardAdminRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.onBoardNewAdmin(onBoardAdminRequestDto));
    }

    @PostMapping("/createNewBranch")
    public ResponseEntity<BranchResponseDto> createNewBranch(
        @Valid @RequestBody BranchRequestDto branchRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.createNewBranch(branchRequestDto));
    }
}
