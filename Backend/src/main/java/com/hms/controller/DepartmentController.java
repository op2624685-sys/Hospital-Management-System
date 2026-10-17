package com.hms.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.DepartmentDto;
import com.hms.service.DepartmentService;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
@Tag(name = "Department Management", description = "Endpoints for managing hospital medical departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @Operation(summary = "Get All Departments", description = "Retrieves a complete list of all medical departments available in the system")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Department list retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "No departments found")
    })
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartment());
    }
}
