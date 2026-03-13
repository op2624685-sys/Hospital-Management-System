package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Comparator;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import com.hms.entity.type.RoleType;
import com.hms.repository.AdminRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;
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
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDto> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        return doctors
                .stream()
                .map(this::mapToDoctorDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return mapToDoctorDto(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDto> getDoctorByName(String name) {
        List<Doctor> doctors = doctorRepository.findByName(name);
        return doctors
                .stream()
                .map(this::mapToDoctorDto)
                .toList();
    }

    @Override
    public String deleteDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        doctorRepository.delete(doctor);
        return "Doctor deleted successfully with id: " + id;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('HEADADMIN', 'ADMIN')")
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
                mapBranch(doctor.getBranch())
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

    private Set<DepartmentDto> mapDepartments(Doctor doctor) {
        if (doctor.getDepartments() == null) return Set.of();
        return doctor.getDepartments().stream()
                .map(department -> new DepartmentDto(
                        department.getId(),
                        department.getName(),
                        department.getBranch() != null ? department.getBranch().getId() : null,
                        department.getHeadDoctor() != null ? department.getHeadDoctor().getId() : null,
                        department.getDoctors() == null ? Set.of()
                                : department.getDoctors().stream().map(Doctor::getId).collect(Collectors.toSet())
                ))
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
