package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import com.hms.dto.AdminDto;
import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.dto.Response.AdminOverviewDto;
import com.hms.dto.Response.AdminStatsDto;
import com.hms.dto.Response.AdminDepartmentLoadDto;
import com.hms.dto.Response.AdminWeeklyCountDto;
import com.hms.dto.Response.BranchResponseDto;
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
        return adminRepository.findAll().stream().map(this::mapToAdminDto).toList();
    }

    @Override
    public AdminDto getAdminById(Long id) {
        Admin admin = adminRepository.findById(id).orElseThrow(() -> new RuntimeException("Admin not found"));
        return mapToAdminDto(admin);
    }

    @Override
    public List<AdminDto> getAdminByName(String name) {
        return adminRepository.findByName(name).stream().map(this::mapToAdminDto).toList();
    }

    @Override
    public String deleteAdminById(Long id) {
        adminRepository.deleteById(id);
        return "Admin deleted";
    }

    @Override
    @Transactional
    public AdminResponseDto onBoardNewAdmin(OnBoardAdminRequestDto dto) {
        User user = userRepository.findByUsernameIgnoreCase(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Branch branch = branchRepository.findByNameIgnoreCase(dto.getBranchName())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        
        Admin admin = Admin.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .branch(branch)
                .user(user)
                .build();
        
        user.setRoles(new HashSet<>(Set.of(RoleType.ADMIN)));
        user.setEmail(dto.getEmail());
        userRepository.save(user);
        return mapToAdminResponseDto(adminRepository.save(admin));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminOverviewDto getAdminOverview() {
        Long adminUserId = getAuthenticatedUserId();
        Admin admin = adminRepository.findById(adminUserId).orElseThrow(() -> new RuntimeException("Admin profile not found"));
        Long branchId = admin.getBranch().getId();

        long totalDoctors = doctorRepository.countByBranch_Id(branchId);
        long totalPatients = patientRepository.countByBranches_Id(branchId);

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);
        long todayAppointments = appointmentRepository.countByBranch_IdAndAppointmentTimeBetween(branchId, start, end);
        long confirmedAppointments = appointmentRepository.countByBranch_IdAndStatus(branchId, AppointmentStatusType.CONFIRMED);

        AdminStatsDto stats = new AdminStatsDto(totalDoctors, totalPatients, todayAppointments, 0L, confirmedAppointments);

        List<DoctorResponseDto> recentDoctors = doctorRepository.findByBranch_IdOrderByIdDesc(branchId)
                .stream().limit(5).map(this::mapToDoctorResponseDto).toList();

        List<AdminDepartmentLoadDto> departmentLoad = departmentRepository.findByBranch_Id(branchId).stream()
                .map(dep -> new AdminDepartmentLoadDto(dep.getName(), dep.getPatients() == null ? 0 : dep.getPatients().size()))
                .sorted(Comparator.comparing(AdminDepartmentLoadDto::getPatientCount).reversed()).toList();

        List<AdminWeeklyCountDto> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = appointmentRepository.countByBranch_IdAndAppointmentTimeBetween(branchId, day.atStartOfDay(), day.plusDays(1).atStartOfDay().minusNanos(1));
            weekly.add(new AdminWeeklyCountDto(day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), count));
        }

        return new AdminOverviewDto(stats, recentDoctors, departmentLoad, weekly);
    }

    private Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) return user.getId();
        throw new RuntimeException("User authentication required");
    }

    private AdminDto mapToAdminDto(Admin admin) {
        BranchResponseDto branchDto = null;
        if (admin.getBranch() != null) {
            Branch branch = admin.getBranch();
            branchDto = new BranchResponseDto(
                    branch.getId(),
                    branch.getName(),
                    branch.getAddress(),
                    branch.getEmail(),
                    branch.getContactNumber()
            );
        }
        return new AdminDto(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                branchDto
        );
    }

    private AdminResponseDto mapToAdminResponseDto(Admin admin) {
        return new AdminResponseDto(
                admin.getUser() != null ? admin.getUser().getId() : admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getBranch() != null ? admin.getBranch().getId() : null);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminDto getAdminProfile() {
        Long adminUserId = getAuthenticatedUserId();
        Admin admin = adminRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin profile not found"));
        return mapToAdminDto(admin);
    }

    private DoctorResponseDto mapToDoctorResponseDto(Doctor doctor) {
        if (doctor == null) return null;
        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                mapDoctorDepartments(doctor), 
                null,          // No branch mapping here
                doctor.getConsultationFee()
        );
    }

    private Set<com.hms.dto.DepartmentDto> mapDoctorDepartments(Doctor doctor) {
        Set<com.hms.entity.Department> allDepts = new HashSet<>();
        if (doctor.getDepartments() != null) {
            allDepts.addAll(doctor.getDepartments());
        }
        java.util.List<com.hms.entity.Department> headedDepts = departmentRepository.findHeadedDepartments(doctor.getId());
        if (headedDepts != null) {
            allDepts.addAll(headedDepts);
        }
        
        return allDepts.stream().map(dep -> {
            com.hms.dto.DepartmentDto dto = new com.hms.dto.DepartmentDto();
            dto.setId(dep.getId());
            dto.setName(dep.getName());
            return dto;
        }).collect(java.util.stream.Collectors.toSet());
    }
}
