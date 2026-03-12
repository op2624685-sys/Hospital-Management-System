package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
import com.hms.entity.Doctor;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.repository.BranchRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;
import com.hms.service.DoctorService;
import lombok.RequiredArgsConstructor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
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
        String branchName = onBoardDoctorRequestDto.getBranchName() == null ? "" : onBoardDoctorRequestDto.getBranchName().trim();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Branch branch = resolveBranchByName(branchName);

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
