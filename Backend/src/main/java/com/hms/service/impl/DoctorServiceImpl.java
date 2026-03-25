package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Comparator;
import org.springframework.data.domain.PageRequest;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import com.hms.dto.DoctorDto;
import com.hms.dto.Request.OnBoardDoctorRequestDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.dto.BranchDto;
import com.hms.dto.DepartmentDto;
import com.hms.dto.AdminDto;
import com.hms.entity.Branch;
import com.hms.entity.Admin;
import com.hms.entity.Doctor;
import com.hms.entity.User;
import com.hms.entity.Department;
import com.hms.entity.type.RoleType;
import com.hms.repository.AdminRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.service.DoctorService;
import lombok.RequiredArgsConstructor;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "doctors", key = "'all:' + #page + ':' + #size")
    public List<DoctorDto> getAllDoctors(int page, int size) {
        return doctorRepository.findAll(PageRequest.of(page, size))
                .stream()
                .map(this::mapToDoctorDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "doctors", key = "'id:' + #id")
    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return mapToDoctorDto(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "doctors", key = "'name:' + #name")
    public List<DoctorDto> getDoctorByName(String name) {
        List<Doctor> doctors = doctorRepository.findByName(name);
        return doctors
                .stream()
                .map(this::mapToDoctorDto)
                .toList();
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "doctors", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true)
    })
    public String deleteDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        doctorRepository.delete(doctor);
        return "Doctor deleted successfully with id: " + id;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('HEADADMIN', 'ADMIN')")
    @Caching(evict = {
        @CacheEvict(value = "doctors", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true)
    })
    public DoctorResponseDto onBoardNewDoctor(OnBoardDoctorRequestDto onBoardDoctorRequestDto) {
        String username = onBoardDoctorRequestDto.getUsername() == null ? "" : onBoardDoctorRequestDto.getUsername().trim();
        User currentUser = getCurrentUser();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Branch branch = resolveBranchForOnboarding(onBoardDoctorRequestDto, currentUser);

        if (doctorRepository.existsById(user.getId())) {
            throw new IllegalArgumentException("Already a doctor");
        }

        Doctor doctor = Doctor.builder()
                .name(onBoardDoctorRequestDto.getName())
                .specialization(onBoardDoctorRequestDto.getSpecialization())
                .email(onBoardDoctorRequestDto.getEmail())
                .branch(branch)
                .user(user)
                .build();

            user.setRoles(new HashSet<>(Set.of(RoleType.DOCTOR)));
            user.setEmail(onBoardDoctorRequestDto.getEmail());
            userRepository.save(user);

            return mapToDoctorResponseDto(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    @Cacheable(value = "branchDoctors", key = "#root.target.getCurrentUser().id + ':' + #page + ':' + #size + ':' + #search + ':' + #specialization + ':' + #sortBy")
    public List<DoctorResponseDto> getDoctorsForAdminBranch(int page, int size, String search, String specialization, String sortBy) {
        User currentUser = getCurrentUser();
        Admin admin = adminRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Admin profile not found for user id: " + currentUser.getId()));
        String safeSearch = search == null ? "" : search.trim().toLowerCase();
        String safeSpec = specialization == null ? "" : specialization.trim().toLowerCase();
        String safeSort = sortBy == null ? "name" : sortBy.trim().toLowerCase();

        Comparator<Doctor> comparator = Comparator.comparing(d -> (d.getName() == null ? "" : d.getName()).toLowerCase());
        if ("department".equals(safeSort)) {
            comparator = Comparator.comparing(d -> (getPrimaryDepartmentName(d)).toLowerCase());
        }

        List<Doctor> filtered = doctorRepository.findByBranch_Id(admin.getBranch().getId())
                .stream()
                .filter(d -> safeSearch.isBlank() || (d.getName() != null && d.getName().toLowerCase().contains(safeSearch)))
                .filter(d -> safeSpec.isBlank() || (d.getSpecialization() != null && d.getSpecialization().toLowerCase().contains(safeSpec)))
                .sorted(comparator)
                .toList();

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int from = Math.min(safePage * safeSize, filtered.size());
        int to = Math.min(from + safeSize, filtered.size());
        return filtered.subList(from, to)
                .stream()
                .map(this::mapToDoctorResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getMyDepartments() {
        User currentUser = getCurrentUser();
        Doctor doctor = doctorRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found for user id: " + currentUser.getId()));
        return mapDepartments(doctor).stream().toList();
    }

    private String getPrimaryDepartmentName(Doctor doctor) {
        if (doctor.getDepartments() == null || doctor.getDepartments().isEmpty()) return "";
        return doctor.getDepartments().iterator().next().getName() == null ? "" : doctor.getDepartments().iterator().next().getName();
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new RuntimeException("Authenticated user not found");
    }

    private Branch resolveBranchForOnboarding(OnBoardDoctorRequestDto dto, User currentUser) {
        if (currentUser.getRoles().contains(RoleType.ADMIN)) {
            Admin admin = adminRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Admin profile not found for user id: " + currentUser.getId()));
            return admin.getBranch();
        }
        if (currentUser.getRoles().contains(RoleType.HEADADMIN)) {
            String branchName = dto.getBranchName() == null ? "" : dto.getBranchName().trim();
            if (branchName.isBlank()) {
                throw new IllegalArgumentException("branchName is required for head admin onboarding");
            }
            return resolveBranchByName(branchName);
        }
        throw new RuntimeException("Only admin or head admin can onboard doctors");
    }

    private Branch resolveBranchByName(String branchName) {
        return branchRepository.findByNameIgnoreCase(branchName).orElseGet(() -> {
            List<Branch> partialMatches = branchRepository.findByNameContainingIgnoreCase(branchName);
            if (partialMatches.size() == 1) {
                return partialMatches.get(0);
            }
            throw new RuntimeException("Branch not found with name: " + branchName);
        });
    }

    private DoctorDto mapToDoctorDto(Doctor doctor) {
        return new DoctorDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                mapDepartments(doctor),
                mapBranch(doctor.getBranch()),
                isDoctorHeadOfAnyDepartment(doctor)
        );
    }

    private DoctorResponseDto mapToDoctorResponseDto(Doctor doctor) {
        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                mapDepartments(doctor),
                mapBranchResponse(doctor.getBranch())
        );
    }

    private boolean isDoctorHeadOfAnyDepartment(Doctor doctor) {
        return departmentRepository.existsByHeadDoctor_Id(doctor.getId());
    }

    @Override
    @Transactional
    public void addDoctorToDepartment(Long deptId, Long doctorId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (dept.getHeadDoctor() == null || !dept.getHeadDoctor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the head of this department");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        dept.getDoctors().add(doctor);
        doctor.getDepartments().add(dept);
        departmentRepository.save(dept);
    }

    @Override
    @Transactional
    public void removeDoctorFromDepartment(Long deptId, Long doctorId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (dept.getHeadDoctor() == null || !dept.getHeadDoctor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the head of this department");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        dept.getDoctors().remove(doctor);
        doctor.getDepartments().remove(dept);
        departmentRepository.save(dept);
    }

    @Override
    @Transactional
    public void updateDepartment(Long deptId, DepartmentDto deptDto) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (dept.getHeadDoctor() == null || !dept.getHeadDoctor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the head of this department");
        }
        
        dept.setDescription(deptDto.getDescription());
        // Map other fields as needed, e.g., services if they exist in Entity
        departmentRepository.save(dept);
    }

    private Set<DepartmentDto> mapDepartments(Doctor doctor) {
        if (doctor.getDepartments() == null) return Set.of();
        return doctor.getDepartments().stream()
                .map(department -> {
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
                    dto.setPatientCount(department.getPatients() == null ? 0 : department.getPatients().size());
                    dto.setSectionsJson(department.getSectionsJson());
                    return dto;
                })
                .collect(Collectors.toSet());
    }

    private BranchDto mapBranch(Branch branch) {
        if (branch == null) return null;
        return new BranchDto(
                branch.getId(),
                branch.getName(),
                branch.getAddress(),
                branch.getContactNumber(),
                branch.getEmail(),
                mapAdmin(branch)
        );
    }

    private BranchResponseDto mapBranchResponse(Branch branch) {
        if (branch == null) return null;
        return new BranchResponseDto(
                branch.getId(),
                branch.getName(),
                branch.getAddress(),
                branch.getEmail(),
                branch.getContactNumber()
        );
    }

    private AdminDto mapAdmin(Branch branch) {
        if (branch.getAdmin() == null) return null;
        return new AdminDto(
                branch.getAdmin().getId(),
                branch.getAdmin().getName(),
                branch.getAdmin().getEmail(),
                branch.getId()
        );
    }

}
