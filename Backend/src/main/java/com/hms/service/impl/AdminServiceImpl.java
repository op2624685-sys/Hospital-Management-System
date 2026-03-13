package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.AdminDto;
import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.dto.Response.AdminOverviewDto;
import com.hms.dto.Response.AdminStatsDto;
import com.hms.dto.Response.AdminDepartmentLoadDto;
import com.hms.dto.Response.AdminWeeklyCountDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.entity.Admin;
import com.hms.entity.Branch;
import com.hms.entity.Doctor;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.repository.AdminRepository;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.repository.UserRepository;
import com.hms.service.AdminService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final DepartmentRepository departmentRepository;
    
    @Override
    public List<AdminDto> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return admins
                .stream()
                .map(this::mapToAdminDto)
                .toList();
    }

    @Override
    public AdminDto getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        return mapToAdminDto(admin);
    }

    @Override
    public List<AdminDto> getAdminByName(String name) {
        List<Admin> admins = adminRepository.findByName(name);
        return admins
                .stream()
                .map(this::mapToAdminDto)
                .toList();
    }

    @Override
    public String deleteAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        adminRepository.delete(admin);
        return "Admin deleted successfully with id: " + id;
    }

    @Override
    @Transactional
    public AdminResponseDto onBoardNewAdmin(OnBoardAdminRequestDto onBoardAdminRequestDto) {
        String username = onBoardAdminRequestDto.getUsername() == null ? "" : onBoardAdminRequestDto.getUsername().trim();
        String branchName = onBoardAdminRequestDto.getBranchName() == null ? "" : onBoardAdminRequestDto.getBranchName().trim();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        Branch branch = resolveBranchByName(branchName);
        if (adminRepository.existsByEmail(onBoardAdminRequestDto.getEmail())) {
            throw new RuntimeException("Admin already exists with email: " + onBoardAdminRequestDto.getEmail());
        }
        if (adminRepository.existsByBranch_Id(branch.getId())) {
            throw new RuntimeException("This branch already has an admin assigned");
        }
        Admin admin = Admin.builder()
                .name(onBoardAdminRequestDto.getName())
                .email(onBoardAdminRequestDto.getEmail())
                .branch(branch)
                .user(user)
                .build();
        user.setRoles(new HashSet<>(Set.of(RoleType.ADMIN)));
        user.setEmail(onBoardAdminRequestDto.getEmail());
        userRepository.save(user);
        Admin savedAdmin = adminRepository.save(admin);
        return mapToAdminResponseDto(savedAdmin);
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

    private AdminDto mapToAdminDto(Admin admin) {
        return new AdminDto(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getBranch() != null ? admin.getBranch().getId() : null);
    }

    private AdminResponseDto mapToAdminResponseDto(Admin admin) {
        return new AdminResponseDto(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getBranch() != null ? admin.getBranch().getId() : null);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public AdminOverviewDto getAdminOverview() {
        Long adminUserId = getAuthenticatedUserId();
        Admin admin = adminRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found for user id: " + adminUserId));
        Long branchId = admin.getBranch().getId();

        long totalDoctors = doctorRepository.countByBranch_Id(branchId);
        long totalPatients = patientRepository.countByBranches_Id(branchId);

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);
        long todayAppointments = appointmentRepository.countByBranch_IdAndAppointmentTimeBetween(branchId, start, end);
        long pendingAppointments = appointmentRepository.countByBranch_IdAndStatus(branchId, AppointmentStatusType.PENDING);
        long confirmedAppointments = appointmentRepository.countByBranch_IdAndStatus(branchId, AppointmentStatusType.CONFIRMED);

        AdminStatsDto stats = new AdminStatsDto(
                totalDoctors,
                totalPatients,
                todayAppointments,
                pendingAppointments,
                confirmedAppointments
        );

        List<DoctorResponseDto> recentDoctors = doctorRepository.findByBranch_IdOrderByIdDesc(branchId)
                .stream()
                .sorted(Comparator.comparing(Doctor::getId).reversed())
                .limit(5)
                .map(this::mapToDoctorResponseDto)
                .toList();

        List<AdminDepartmentLoadDto> departmentLoad = departmentRepository.findByBranch_Id(branchId)
                .stream()
                .map(dep -> new AdminDepartmentLoadDto(dep.getName(), dep.getPatients() == null ? 0 : dep.getPatients().size()))
                .sorted(Comparator.comparing(AdminDepartmentLoadDto::getPatientCount).reversed())
                .toList();

        List<AdminWeeklyCountDto> weeklyAppointments = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDateTime dayStart = day.atStartOfDay();
            LocalDateTime dayEnd = day.plusDays(1).atStartOfDay().minusNanos(1);
            long count = appointmentRepository.countByBranch_IdAndAppointmentTimeBetween(branchId, dayStart, dayEnd);
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            weeklyAppointments.add(new AdminWeeklyCountDto(label, count));
        }

        return new AdminOverviewDto(stats, recentDoctors, departmentLoad, weeklyAppointments);
    }

    private Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.hms.entity.User user) {
            return user.getId();
        }
        throw new RuntimeException("User authentication is required");
    }

    private DoctorResponseDto mapToDoctorResponseDto(Doctor doctor) {
        if (doctor == null) return null;
        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                doctor.getDepartments() == null ? java.util.Set.of() : doctor.getDepartments().stream()
                        .map(dep -> new com.hms.dto.DepartmentDto(
                                dep.getId(),
                                dep.getName(),
                                dep.getBranch() != null ? dep.getBranch().getId() : null,
                                dep.getHeadDoctor() != null ? dep.getHeadDoctor().getId() : null,
                                dep.getDoctors() == null ? java.util.Set.of()
                                        : dep.getDoctors().stream().map(Doctor::getId).collect(Collectors.toSet())
                        ))
                        .collect(Collectors.toSet()),
                doctor.getBranch() == null ? null : new com.hms.dto.Response.BranchResponseDto(
                        doctor.getBranch().getId(),
                        doctor.getBranch().getName(),
                        doctor.getBranch().getAddress(),
                        doctor.getBranch().getEmail(),
                        doctor.getBranch().getContactNumber()
                )
        );
    }
}
