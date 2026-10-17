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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/head-admin")
@RequiredArgsConstructor
@Tag(name = "Head Administration", description = "Head administrator endpoints for branches, administrators, and department templates")
public class HeadAdminController {

    private final AdminService adminService;
    private final BranchService branchService;
    private final HeadAdminService headAdminService;
    private final DepartmentService departmentService;

    
    @GetMapping("/getAllAdmins")
    @Operation(summary = "List Administrators", description = "Returns all administrators managed by the head administrator")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Administrator list retrieved successfully") })
    public ResponseEntity<List<AdminDto>> getAllAdmins() {
        return ResponseEntity.status(HttpStatus.OK).body(adminService.getAllAdmins());
    }

    @GetMapping("/overview")
    @Operation(summary = "Get Branch Overview", description = "Returns summary metrics for all hospital branches")
    @ApiResponse(responseCode = "200", description = "Branch overview retrieved successfully")
    public ResponseEntity<List<HeadAdminBranchSummaryDto>> getBranchOverview() {
        return ResponseEntity.ok(headAdminService.getBranchOverview());
    }

    @GetMapping("/branch/{branchId}/details")
    @Operation(summary = "Get Branch Details", description = "Returns detailed information for a specific hospital branch")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Branch details retrieved successfully"), @ApiResponse(responseCode = "404", description = "Branch not found") })
    public ResponseEntity<HeadAdminBranchDetailsDto> getBranchDetails(
            @Parameter(description = "Unique identifier of the branch") @PathVariable(name = "branchId") Long branchId) {
        return ResponseEntity.ok(headAdminService.getBranchDetails(branchId));
    }

    @GetMapping("/user-suggestions")
    @Operation(summary = "Suggest Usernames", description = "Returns usernames matching the supplied search text")
    @ApiResponse(responseCode = "200", description = "Username suggestions retrieved successfully")
    public ResponseEntity<List<String>> suggestUsernames(
            @RequestParam(name = "query", defaultValue = "") String query) {
        return ResponseEntity.ok(headAdminService.suggestUsernames(query));
    }

    @GetMapping("/branch-suggestions")
    @Operation(summary = "Suggest Branch Names", description = "Returns branch names matching the supplied search text")
    @ApiResponse(responseCode = "200", description = "Branch name suggestions retrieved successfully")
    public ResponseEntity<List<String>> suggestBranchNames(
            @RequestParam(name = "query", defaultValue = "") String query) {
        return ResponseEntity.ok(headAdminService.suggestBranchNames(query));
    }

    @GetMapping("/departments")
    @Operation(summary = "List Department Templates", description = "Returns department templates available for branch configuration")
    @ApiResponse(responseCode = "200", description = "Department templates retrieved successfully")
    public ResponseEntity<List<DepartmentDto>> getDepartmentTemplates() {
        return ResponseEntity.ok(departmentService.getDepartmentTemplates());
    }

    @PostMapping("/departments")
    @Operation(summary = "Create Department Template", description = "Creates a reusable department template for hospital branches")
    @ApiResponses({ @ApiResponse(responseCode = "201", description = "Department template created successfully"), @ApiResponse(responseCode = "400", description = "Invalid department template data"), @ApiResponse(responseCode = "409", description = "Department template already exists") })
    public ResponseEntity<DepartmentDto> createDepartmentTemplate(
            @Valid @RequestBody CreateDepartmentTemplateRequestDto createDepartmentTemplateRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.createDepartmentTemplate(createDepartmentTemplateRequestDto));
    }

    @PostMapping("/onBoardNewAdmin")
    @Operation(summary = "Onboard Administrator", description = "Creates and registers a new branch administrator")
    @ApiResponses({ @ApiResponse(responseCode = "201", description = "Administrator onboarded successfully"), @ApiResponse(responseCode = "400", description = "Invalid administrator data"), @ApiResponse(responseCode = "409", description = "Administrator already exists") })
    public ResponseEntity<AdminResponseDto> onBoardNewAdmin(
            @Valid @RequestBody OnBoardAdminRequestDto onBoardAdminRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.onBoardNewAdmin(onBoardAdminRequestDto));
    }

    @PostMapping("/createNewBranch")
    @Operation(summary = "Create Hospital Branch", description = "Creates a new hospital branch and assigns its initial configuration")
    @ApiResponses({ @ApiResponse(responseCode = "201", description = "Hospital branch created successfully"), @ApiResponse(responseCode = "400", description = "Invalid branch data"), @ApiResponse(responseCode = "409", description = "Branch already exists") })
    public ResponseEntity<BranchResponseDto> createNewBranch(
        @Valid @RequestBody BranchRequestDto branchRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.createNewBranch(branchRequestDto));
    }
}
