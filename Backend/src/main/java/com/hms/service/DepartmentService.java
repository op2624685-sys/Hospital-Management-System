package com.hms.service;

import java.util.List;

import com.hms.dto.DepartmentDto;

public interface DepartmentService {

    List<DepartmentDto> getAllDepartment();

    DepartmentDto getDepartmentById(Long id);

}
