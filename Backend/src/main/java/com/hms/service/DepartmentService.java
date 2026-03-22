package com.hms.service;

import java.util.List;

import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.AddDepartmentToBranchRequestDto;
import com.hms.dto.Request.CreateDepartmentTemplateRequestDto;

public interface DepartmentService {

    List<DepartmentDto> getAllDepartment();

    DepartmentDto getDepartmentById(Long id);

    DepartmentDto createDepartmentTemplate(CreateDepartmentTemplateRequestDto createDepartmentTemplateRequestDto);

    DepartmentDto addDepartmentToBranch(AddDepartmentToBranchRequestDto addDepartmentToBranchRequestDto);

    List<DepartmentDto> getDepartmentTemplates();

    java.util.List<com.hms.dto.Response.AdminDepartmentListDto> getDepartmentsForAdminBranch();

}
