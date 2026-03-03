package com.hms.service;

import java.util.List;

import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.CreateDepartmentRequestDto;

public interface DepartmentService {

    List<DepartmentDto> getAllDepartment();

    DepartmentDto getDepartmentById(Long id);

    DepartmentDto createNewDepartment(CreateDepartmentRequestDto createDepartmentRequestDto);

}
