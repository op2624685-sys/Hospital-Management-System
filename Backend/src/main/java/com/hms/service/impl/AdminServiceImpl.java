package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;
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
import com.hms.dto.Request.OnBoardReceptionistRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.dto.Response.AdminOverviewDto;
import com.hms.dto.Response.AdminStatsDto;
import com.hms.dto.Response.AdminDepartmentLoadDto;
import com.hms.dto.Response.AdminWeeklyCountDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.ReceptionistResponseDto;
import com.hms.entity.Admin;
import com.hms.entity.Branch;
import com.hms.entity.Department;

import com.hms.entity.Doctor;
import com.hms.entity.Receptionist;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.error.ConflictException;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AdminRepository;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.PaymentRepository;
import com.hms.repository.ReceptionistRepository;
import com.hms.repository.UserRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.dto.Response.AdminRevenueGrowthDto;
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
    private final PaymentRepository paymentRepository;
    private final ReceptionistRepository receptionistRepository;

    
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
    @Transactional
    public ReceptionistResponseDto onBoardNewReceptionist(OnBoardReceptionistRequestDto dto) {
        Long adminUserId = getAuthenticatedUserId();
        Admin admin = adminRepository.findById(adminUserId)
                .orElseThrow(() -> new NotFoundException("Admin profile not found"));

        User user = userRepository.findByUsernameIgnoreCase(dto.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found"));

        if (department.getBranch() == null || !department.getBranch().getId().equals(admin.getBranch().getId())) {
            throw new ValidationException("Department does not belong to your branch");
        }
        if (receptionistRepository.existsByDepartment_Id(department.getId())) {
            throw new ConflictException("This department already has a receptionist");
        }

        Receptionist receptionist = Receptionist.builder()
                .user(user)
                .name(dto.getName())
                .email(dto.getEmail())
                .branch(admin.getBranch())
                .department(department)
                .build();

        user.setRoles(new HashSet<>(Set.of(RoleType.RECEPTIONIST)));
        user.setEmail(dto.getEmail());
        userRepository.save(user);

        return mapToReceptionistResponseDto(receptionistRepository.save(receptionist));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminOverviewDto getAdminOverview() {
        Long adminUserId = getAuthenticatedUserId();
        Admin admin = adminRepository.findById(adminUserId).orElseThrow(() -> new RuntimeException("Admin profile not found"));
        Long branchId = admin.getBranch().getId();
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);

        // 1. Stats & Revenue (Fast Database Aggregations)
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalDoctors(doctorRepository.countByBranch_Id(branchId));
        stats.setTotalPatients(patientRepository.countByBranches_Id(branchId));
        stats.setTodayAppointments(appointmentRepository.countByBranch_IdAndAppointmentTimeBetween(branchId, start, end));
        
        List<Object[]> statusCounts = appointmentRepository.countStatusByBranch(branchId);
        for (Object[] row : statusCounts) {
            if (row[0] != null) {
                AppointmentStatusType status = (AppointmentStatusType) row[0];
                long count = ((Number) row[1]).longValue();
                if (status == AppointmentStatusType.PENDING) stats.setPendingAppointments(count);
                else if (status == AppointmentStatusType.CONFIRMED) stats.setConfirmedAppointments(count);
                else if (status == AppointmentStatusType.COMPLETED) stats.setCompletedAppointments(count);
                else if (status == AppointmentStatusType.CANCELLED) stats.setCancelledAppointments(count);
            }
        }

        Double totalRev = paymentRepository.sumRevenueByBranch(branchId);
        Double todayRev = paymentRepository.sumRevenueByBranchAndDate(branchId, start, end);
        stats.setTotalRevenue(totalRev != null ? totalRev : 0.0);
        stats.setTodayRevenue(todayRev != null ? todayRev : 0.0);

        // 2. Recent Doctors
        List<Object[]> recentDocsNative = doctorRepository.findRecentDoctorsNative(branchId);
        List<DoctorResponseDto> recentDoctors = recentDocsNative.stream().map(row -> {
            DoctorResponseDto dto = new DoctorResponseDto();
            dto.setId(((Number) row[0]).longValue());
            dto.setName((String) row[1]);
            dto.setSpecialization((String) row[2]);
            dto.setProfilePhoto((String) row[3]);
            return dto;
        }).toList();

        // 3. Department Load
        List<AdminDepartmentLoadDto> departmentLoad = appointmentRepository.getDepartmentLoad(branchId);
        
        // 4. Weekly Activity (Optimized Aggregation)
        LocalDateTime weekStart = today.minusDays(6).atStartOfDay();
        List<Object[]> weeklyData = appointmentRepository.getWeeklyCount(branchId, weekStart);
        java.util.Map<String, Long> weeklyMap = new java.util.HashMap<>();
        for (Object[] row : weeklyData) {
            if (row[0] != null) weeklyMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        List<AdminWeeklyCountDto> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            weekly.add(new AdminWeeklyCountDto(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), weeklyMap.getOrDefault(d.toString(), 0L)));
        }

        // 5. Monthly Growth (Optimized Aggregation)
        LocalDateTime sixMonthsAgo = today.minusMonths(5).withDayOfMonth(1).atStartOfDay();
        List<Object[]> monthlyData = paymentRepository.getMonthlyRevenue(branchId, sixMonthsAgo);
        java.util.Map<Integer, Double> monthlyMap = new java.util.HashMap<>();
        for (Object[] row : monthlyData) {
            if (row[0] != null) {
                // Robust parsing for various timestamp formats
                String tsStr = row[0].toString();
                int monthVal = Integer.parseInt(tsStr.split("-")[1]); // Get MM from YYYY-MM-...
                monthlyMap.put(monthVal, ((Number) row[1]).doubleValue());
            }
        }
        List<AdminRevenueGrowthDto> growth = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate m = today.minusMonths(i);
            growth.add(new AdminRevenueGrowthDto(m.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), monthlyMap.getOrDefault(m.getMonthValue(), 0.0)));
        }

        return new AdminOverviewDto(stats, recentDoctors, departmentLoad, weekly, growth);
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

    private ReceptionistResponseDto mapToReceptionistResponseDto(Receptionist receptionist) {
        return new ReceptionistResponseDto(
                receptionist.getUser() != null ? receptionist.getUser().getId() : receptionist.getId(),
                receptionist.getName(),
                receptionist.getEmail(),
                receptionist.getBranch() == null ? null : new BranchResponseDto(
                        receptionist.getBranch().getId(),
                        receptionist.getBranch().getName(),
                        receptionist.getBranch().getAddress(),
                        receptionist.getBranch().getEmail(),
                        receptionist.getBranch().getContactNumber()),
                receptionist.getDepartment() != null ? receptionist.getDepartment().getId() : null,
                receptionist.getDepartment() != null ? receptionist.getDepartment().getName() : null
        );
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
                doctor.getConsultationFee(),
                doctor.getUser() != null ? doctor.getUser().getProfilePhoto() : null,
                doctor.getDoctorStampUrl()
        );
    }

    private Set<com.hms.dto.DepartmentDto> mapDoctorDepartments(Doctor doctor) {
        Set<com.hms.entity.Department> allDepts = new HashSet<>();
        if (doctor.getDepartments() != null) {
            allDepts.addAll(doctor.getDepartments());
        }
        if (doctor.getHeadedDepartments() != null) {
            allDepts.addAll(doctor.getHeadedDepartments());
        }
        
        return allDepts.stream().map(dep -> {
            com.hms.dto.DepartmentDto dto = new com.hms.dto.DepartmentDto();
            dto.setId(dep.getId());
            dto.setName(dep.getName());
            return dto;
        }).collect(java.util.stream.Collectors.toSet());
    }
}
