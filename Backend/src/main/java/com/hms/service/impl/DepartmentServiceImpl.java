package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.AddDepartmentToBranchRequestDto;
import com.hms.dto.Request.CreateDepartmentTemplateRequestDto;
import com.hms.entity.Department;
import com.hms.entity.Doctor;
import com.hms.entity.Admin;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.dto.Response.AdminDepartmentListDto;
import com.hms.error.ForbiddenException;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AdminRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.service.DepartmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService{

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;

    @Override
    @Cacheable(value = "departmentListAll", key = "'all'")
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartment() {
        List<Department> departments = departmentRepository.findAll();
        return departments
                .stream()
                .filter(department -> department.getBranch() != null)
                .map(this::mapToDepartmentDto)
                .toList();
    }

    @Override
    @Cacheable(value = "departmentById", key = "'id:' + #id")
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found with id: " + id));
        return mapToDepartmentDto(department);
    }

    @Override
    @PreAuthorize("hasRole('HEADADMIN')")
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "departmentListAll", allEntries = true),
            @CacheEvict(value = "departmentById", allEntries = true),
            @CacheEvict(value = "adminDepartments", allEntries = true),
            @CacheEvict(value = "departmentTemplates", allEntries = true)
    })
    public DepartmentDto createDepartmentTemplate(CreateDepartmentTemplateRequestDto createDepartmentTemplateRequestDto) {
        String name = createDepartmentTemplateRequestDto.getName().trim();
        if (departmentRepository.existsByNameAndBranchIsNull(name)) {
            throw new IllegalArgumentException("Department template already exists: " + name);
        }

        Department department = new Department();
        department.setName(name);
        department.setDescription(createDepartmentTemplateRequestDto.getDescription());
        department.setImageUrl(createDepartmentTemplateRequestDto.getImageUrl());
        department.setAccentColor(createDepartmentTemplateRequestDto.getAccentColor());
        department.setBgColor(createDepartmentTemplateRequestDto.getBgColor());
        department.setIcon(createDepartmentTemplateRequestDto.getIcon());
        department.setSectionsJson(createDepartmentTemplateRequestDto.getSectionsJson());
        Department savedDepartment = departmentRepository.save(department);
        return mapToDepartmentTemplateDto(savedDepartment);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "departmentListAll", allEntries = true),
            @CacheEvict(value = "departmentById", allEntries = true),
            @CacheEvict(value = "adminDepartments", allEntries = true),
            @CacheEvict(value = "doctorById", key = "'id:' + #addDepartmentToBranchRequestDto.headDoctorId", condition = "#addDepartmentToBranchRequestDto.headDoctorId != null"),
            @CacheEvict(value = "doctorListPaged", allEntries = true),
            @CacheEvict(value = "doctorListByName", allEntries = true),
            @CacheEvict(value = "branchDoctors", allEntries = true)
    })
    public DepartmentDto addDepartmentToBranch(AddDepartmentToBranchRequestDto addDepartmentToBranchRequestDto) {
        Admin admin = resolveAdmin();
        Department template = departmentRepository.findById(addDepartmentToBranchRequestDto.getTemplateId())
                .orElseThrow(() -> new NotFoundException("Department template not found with id: " + addDepartmentToBranchRequestDto.getTemplateId()));
        if (template.getBranch() != null) {
            throw new IllegalArgumentException("Selected department is already assigned to a branch");
        }

        if (departmentRepository.existsByNameAndBranch_Id(template.getName(), admin.getBranch().getId())) {
            throw new IllegalArgumentException("Department already exists in this branch: " + template.getName());
        }

        Department department = new Department();
        department.setName(template.getName());
        department.setBranch(admin.getBranch());
        department.setDescription(pickValue(addDepartmentToBranchRequestDto.getDescription(), template.getDescription()));
        department.setImageUrl(pickValue(addDepartmentToBranchRequestDto.getImageUrl(), template.getImageUrl()));
        department.setAccentColor(pickValue(addDepartmentToBranchRequestDto.getAccentColor(), template.getAccentColor()));
        department.setBgColor(pickValue(addDepartmentToBranchRequestDto.getBgColor(), template.getBgColor()));
        department.setIcon(pickValue(addDepartmentToBranchRequestDto.getIcon(), template.getIcon()));
        department.setSectionsJson(pickValue(addDepartmentToBranchRequestDto.getSectionsJson(), template.getSectionsJson()));

        Set<Doctor> doctors = new HashSet<>();
        if (addDepartmentToBranchRequestDto.getDoctorIds() != null && !addDepartmentToBranchRequestDto.getDoctorIds().isEmpty()) {
            doctors.addAll(doctorRepository.findAllById(addDepartmentToBranchRequestDto.getDoctorIds()));
            if (doctors.size() != addDepartmentToBranchRequestDto.getDoctorIds().size()) {
                throw new NotFoundException("One or more doctors not found");
            }
            validateDoctorsBelongToBranch(doctors, admin.getBranch().getId());
        }

        if (addDepartmentToBranchRequestDto.getHeadDoctorId() != null) {
            Doctor headDoctor = doctorRepository.findById(addDepartmentToBranchRequestDto.getHeadDoctorId())
                    .orElseThrow(() -> new NotFoundException("Head doctor not found with id: " + addDepartmentToBranchRequestDto.getHeadDoctorId()));
            validateDoctorBelongsToBranch(headDoctor, admin.getBranch().getId());
            department.setHeadDoctor(headDoctor);
            doctors.add(headDoctor);
        }

        department.setDoctors(doctors);
        Department savedDepartment = departmentRepository.save(department);
        return mapToDepartmentDto(savedDepartment);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','HEADADMIN')")
    @Cacheable(value = "departmentTemplates", key = "'all'")
    @Transactional(readOnly = true)
    public List<DepartmentDto> getDepartmentTemplates() {
        return departmentRepository.findByBranchIsNull()
                .stream()
                .map(this::mapToDepartmentTemplateDto)
                .toList();
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new ForbiddenException("Authenticated user not found");
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    @Cacheable(value = "adminDepartments", key = "#root.target.getCurrentUser().id")
    public List<AdminDepartmentListDto> getDepartmentsForAdminBranch() {
        Admin admin = resolveAdmin();
        Long branchId = admin.getBranch().getId();
        return departmentRepository.findByBranch_Id(branchId)
                .stream()
                .map(dep -> {
                    AdminDepartmentListDto dto = new AdminDepartmentListDto();
                    dto.setId(dep.getId());
                    dto.setName(dep.getName());
                    dto.setHeadDoctorName(dep.getHeadDoctor() != null ? dep.getHeadDoctor().getName() : "N/A");
                    dto.setMemberCount(dep.getDoctors() == null ? 0 : dep.getDoctors().size());
                    dto.setDescription(dep.getDescription());
                    dto.setImageUrl(dep.getImageUrl());
                    dto.setAccentColor(dep.getAccentColor());
                    dto.setBgColor(dep.getBgColor());
                    dto.setIcon(dep.getIcon());
                    dto.setSectionsJson(dep.getSectionsJson());
                    return dto;
                })
                .toList();
    }

    private Admin resolveAdmin() {
        User currentUser = getCurrentUser();
        if (!currentUser.getRoles().contains(RoleType.ADMIN)) {
            throw new ForbiddenException("Only admin can perform this operation");
        }
        return adminRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Admin profile not found for user id: " + currentUser.getId()));
    }

    private String pickValue(String candidate, String fallback) {
        return StringUtils.hasText(candidate) ? candidate : fallback;
    }

    private void validateDoctorsBelongToBranch(Set<Doctor> doctors, Long branchId) {
        for (Doctor doctor : doctors) {
            validateDoctorBelongsToBranch(doctor, branchId);
        }
    }

    private void validateDoctorBelongsToBranch(Doctor doctor, Long branchId) {
        if (doctor.getBranch() == null || !branchId.equals(doctor.getBranch().getId())) {
            throw new ValidationException("Doctor does not belong to the department branch: " + doctor.getId());
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
        dto.setHeadDoctorName(department.getHeadDoctor() != null ? department.getHeadDoctor().getName() : null);
        dto.setMemberCount(department.getDoctors() == null ? 0 : department.getDoctors().size());
        dto.setDescription(department.getDescription());
        dto.setImageUrl(department.getImageUrl());
        dto.setAccentColor(department.getAccentColor());
        dto.setBgColor(department.getBgColor());
        dto.setIcon(department.getIcon());
        dto.setSectionsJson(department.getSectionsJson());
        return dto;
    }

    private DepartmentDto mapToDepartmentTemplateDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setBranchId(null);
        dto.setHeadDoctorId(null);
        dto.setDoctorIds(Set.of());
        dto.setHeadDoctorName(null);
        dto.setMemberCount(0);
        dto.setDescription(department.getDescription());
        dto.setImageUrl(department.getImageUrl());
        dto.setAccentColor(department.getAccentColor());
        dto.setBgColor(department.getBgColor());
        dto.setIcon(department.getIcon());
        dto.setSectionsJson(department.getSectionsJson());
        return dto;
    }
}

