package com.hms.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.hms.dto.DepartmentDto;
import com.hms.entity.Department;
import com.hms.repository.DepartmentRepository;
import com.hms.service.DepartmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService{

    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<DepartmentDto> getAllDepartment() {
        List<Department> departments = departmentRepository.findAll();
        return departments
                .stream()
                .map(department -> modelMapper.map(department, DepartmentDto.class))
                .toList();
    }

    @Override
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return modelMapper.map(department, DepartmentDto.class);
    }

}
