package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.CreateDepartmentRequestDto;
import com.hms.entity.Branch;
import com.hms.entity.Department;
import com.hms.entity.Doctor;
import com.hms.repository.BranchRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.service.DepartmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService{

    private final DepartmentRepository departmentRepository;
    private final BranchRepository branchRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public List<DepartmentDto> getAllDepartment() {
        List<Department> departments = departmentRepository.findAll();
        return departments
                .stream()
                .map(this::mapToDepartmentDto)
                .toList();
    }

    @Override
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return mapToDepartmentDto(department);
    }

    @Override
    @Transactional
    public DepartmentDto createNewDepartment(CreateDepartmentRequestDto createDepartmentRequestDto) {
        Branch branch = branchRepository.findById(createDepartmentRequestDto.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + createDepartmentRequestDto.getBranchId()));
        if (departmentRepository.existsByNameAndBranch_Id(createDepartmentRequestDto.getName(), branch.getId())) {
            throw new IllegalArgumentException("Department already exists in this branch: " + createDepartmentRequestDto.getName());
        }

        Department department = new Department();
        department.setName(createDepartmentRequestDto.getName());
        department.setBranch(branch);

        Set<Doctor> doctors = new HashSet<>();
        if (createDepartmentRequestDto.getDoctorIds() != null && !createDepartmentRequestDto.getDoctorIds().isEmpty()) {
            doctors.addAll(doctorRepository.findAllById(createDepartmentRequestDto.getDoctorIds()));
            if (doctors.size() != createDepartmentRequestDto.getDoctorIds().size()) {
                throw new RuntimeException("One or more doctors not found");
            }
            validateDoctorsBelongToBranch(doctors, branch.getId());
        }

        if (createDepartmentRequestDto.getHeadDoctorId() != null) {
            Doctor headDoctor = doctorRepository.findById(createDepartmentRequestDto.getHeadDoctorId())
                    .orElseThrow(() -> new RuntimeException("Head doctor not found with id: " + createDepartmentRequestDto.getHeadDoctorId()));
            validateDoctorBelongsToBranch(headDoctor, branch.getId());
            department.setHeadDoctor(headDoctor);
            doctors.add(headDoctor);
        }

        department.setDoctors(doctors);
        Department savedDepartment = departmentRepository.save(department);
        return mapToDepartmentDto(savedDepartment);
    }

    private void validateDoctorsBelongToBranch(Set<Doctor> doctors, Long branchId) {
        for (Doctor doctor : doctors) {
            validateDoctorBelongsToBranch(doctor, branchId);
        }
    }

    private void validateDoctorBelongsToBranch(Doctor doctor, Long branchId) {
        if (doctor.getBranch() == null || !branchId.equals(doctor.getBranch().getId())) {
            throw new IllegalArgumentException("Doctor does not belong to the department branch: " + doctor.getId());
        }
    }

    private DepartmentDto mapToDepartmentDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setBranchId(department.getBranch() != null ? department.getBranch().getId() : null);
        dto.setHeadDoctorId(department.getHeadDoctor() != null ? department.getHeadDoctor().getId() : null);
        dto.setDoctorIds(department.getDoctors() == null ? Set.of()
                : department.getDoctors().stream().map(Doctor::getId).collect(Collectors.toSet()));
        return dto;
    }
}
