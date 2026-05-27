package com.hms.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
import com.hms.dto.Response.DoctorStampResponseDto;
import com.hms.dto.Response.BranchResponseDto;
import com.hms.dto.Response.PublicDoctorDepartmentDto;
import com.hms.dto.Response.PublicDoctorDepartmentRow;
import com.hms.dto.Response.PublicDoctorListDto;
import com.hms.dto.Response.PublicDoctorListRow;
import com.hms.dto.Response.RatingSummaryResponse;
import com.hms.dto.BranchDto;
import com.hms.dto.DepartmentDto;
import com.hms.dto.AdminDto;
import com.hms.entity.Branch;
import com.hms.entity.Admin;
import com.hms.entity.Doctor;
import com.hms.entity.DoctorRatingSummary;
import com.hms.entity.User;
import com.hms.entity.Department;
import com.hms.entity.type.RoleType;
import com.hms.entity.type.NotificationType;
import com.hms.error.ForbiddenException;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.AdminRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.DoctorRatingSummaryRepository;
import com.hms.repository.UserRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.service.DoctorService;
import com.hms.service.HMSAuditLogService;
import com.hms.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.function.Function;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {
    private static final int PUBLIC_DOCTOR_MAX_PAGE_SIZE = 10;
    private static final long MAX_STAMP_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> ALLOWED_STAMP_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp");

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRatingSummaryRepository doctorRatingSummaryRepository;
    private final CloudinaryService cloudinaryService;

    private final HMSAuditLogService auditLogService;
    private final NotificationServiceImpl notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDto> getAllDoctors(int page, int size) {
        return getAllDoctorsSearch(null, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "doctorListPaged", key = "'search:' + (#search == null ? '' : #search.trim().toLowerCase()) + ':' + #page + ':' + #size")
    public List<DoctorDto> getAllDoctorsSearch(String search, int page, int size) {
        List<Doctor> doctors = doctorRepository.findAllSearch(search, PageRequest.of(page, size))
                .stream()
                .toList();
        Map<Long, RatingSummaryResponse> ratingSummariesByDoctorId = getRatingSummariesByDoctorId(doctors);

        return doctors.stream()
                .map(doctor -> mapToDoctorDto(
                        doctor,
                        ratingSummariesByDoctorId.getOrDefault(
                                doctor.getId(),
                                emptyRatingSummary(doctor.getId()))))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "doctorListPaged", key = "'public:' + (#search == null ? '' : #search.trim().toLowerCase()) + ':' + T(java.lang.Math).max(#page, 0) + ':' + T(java.lang.Math).min(T(java.lang.Math).max(#size, 1), 10)")
    public List<PublicDoctorListDto> getPublicDoctors(String search, int page, int size) {
        int safePage = normalizePage(page);
        int safeSize = normalizePublicPageSize(size);
        String normalizedSearch = normalizeSearch(search);
        PageRequest pageable = PageRequest.of(safePage, safeSize);

        List<PublicDoctorListRow> doctorRows = (normalizedSearch == null
                ? doctorRepository.findPublicDoctorListRows(pageable)
                : doctorRepository.searchPublicDoctorListRows(normalizedSearch, pageable))
                .stream()
                .toList();

        List<Long> doctorIds = doctorRows.stream()
                .map(PublicDoctorListRow::id)
                .toList();

        Map<Long, List<PublicDoctorDepartmentDto>> departmentsByDoctorId = getPublicDepartmentsByDoctorId(doctorIds);
        Map<Long, RatingSummaryResponse> ratingSummariesByDoctorId = getRatingSummariesByDoctorIds(doctorIds);

        return doctorRows.stream()
                .map(row -> new PublicDoctorListDto(
                        row.id(),
                        row.name(),
                        row.specialization(),
                        departmentsByDoctorId.getOrDefault(row.id(), List.of()),
                        new BranchDto(
                                row.branchId(),
                                row.branchName(),
                                row.branchAddress(),
                                row.branchContactNumber(),
                                row.branchEmail()),
                        row.consultationFee(),
                        ratingSummariesByDoctorId.getOrDefault(row.id(), emptyRatingSummary(row.id())),
                        row.profilePhoto()))
                .toList();
    }

    private int normalizePage(int page) {
        return Math.max(page, 0);
    }

    private int normalizePublicPageSize(int size) {
        return Math.min(Math.max(size, 1), PUBLIC_DOCTOR_MAX_PAGE_SIZE);
    }

    private String normalizeSearch(String search) {
        if (search == null) {
            return null;
        }
        String trimmed = search.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "doctorById", key = "'id:' + #id")
    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + id));
        RatingSummaryResponse ratingSummary = doctorRatingSummaryRepository.findById(id)
                .map(this::mapToRatingSummaryResponse)
                .orElse(emptyRatingSummary(id));
        return mapToDoctorDto(doctor, ratingSummary);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "doctorListByName", key = "'name:' + (#name == null ? '' : #name.trim().toLowerCase())")
    public List<DoctorDto> getDoctorByName(String name) {
        List<Doctor> doctors = doctorRepository.findByName(name);
        return doctors
                .stream()
                .map(doctor -> mapToDoctorDto(doctor, null))
                .toList();
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "doctorById", allEntries = true),
        @CacheEvict(value = "doctorListPaged", allEntries = true),
        @CacheEvict(value = "doctorListByName", allEntries = true),
        @CacheEvict(value = "myDoctorDepartments", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true)
    })
    public String deleteDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + id));
        doctorRepository.delete(doctor);
        return "Doctor deleted successfully with id: " + id;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('HEADADMIN', 'ADMIN')")
    @Caching(evict = {
        @CacheEvict(value = "doctorById", allEntries = true),
        @CacheEvict(value = "doctorListPaged", allEntries = true),
        @CacheEvict(value = "doctorListByName", allEntries = true),
        @CacheEvict(value = "myDoctorDepartments", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true)
    })
    public DoctorResponseDto onBoardNewDoctor(OnBoardDoctorRequestDto onBoardDoctorRequestDto) {
        String username = onBoardDoctorRequestDto.getUsername() == null ? "" : onBoardDoctorRequestDto.getUsername().trim();
        User currentUser = getCurrentUser();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new NotFoundException("User not found with username: " + username));
        Branch branch = resolveBranchForOnboarding(onBoardDoctorRequestDto, currentUser);

        if (doctorRepository.existsById(user.getId())) {
            throw new ValidationException("Already a doctor");
        }

        Doctor doctor = Doctor.builder()
                .name(onBoardDoctorRequestDto.getName())
                .specialization(onBoardDoctorRequestDto.getSpecialization())
                .email(onBoardDoctorRequestDto.getEmail())
                .consultationFee(onBoardDoctorRequestDto.getConsultationFee() != null ? onBoardDoctorRequestDto.getConsultationFee() : 0L)
                .branch(branch)
                .user(user)
                .build();

        user.setRoles(new HashSet<>(Set.of(RoleType.DOCTOR)));
        user.setEmail(onBoardDoctorRequestDto.getEmail());
        userRepository.save(user);

        Doctor savedDoctor = doctorRepository.save(doctor);
        List<Doctor> branchDoctors = doctorRepository.findByBranch_Id(branch.getId());
        for (Doctor branchDoctor : branchDoctors) {
            if (branchDoctor.getId().equals(savedDoctor.getId())) {
                continue;
            }
            notificationService.createNotificationForUser(
                    branchDoctor.getId(),
                    NotificationType.BRANCH_DOCTOR_ADDED,
                    "New doctor joined branch",
                    "Dr. " + savedDoctor.getName() + " joined " + branch.getName() + ".",
                    null);
        }
        return mapToDoctorResponseDto(savedDoctor);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    @Cacheable(value = "branchDoctors", key = "#root.target.getCurrentUser().id + ':' + #page + ':' + #size + ':' + #search + ':' + #specialization + ':' + #sortBy")
    public List<DoctorResponseDto> getDoctorsForAdminBranch(int page, int size, String search, String specialization, String sortBy) {
        User currentUser = getCurrentUser();
        Admin admin = adminRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Admin profile not found for user id: " + currentUser.getId()));
        String safeSearch = search == null ? "" : search.trim().toLowerCase();
        String safeSpec = specialization == null ? "" : specialization.trim().toLowerCase();
        String safeSort = sortBy == null ? "name" : sortBy.trim().toLowerCase();
        String sortField = "name";
        if ("specialization".equals(safeSort)) {
            sortField = "specialization";
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, sortField));
        return doctorRepository.findBranchDoctors(admin.getBranch().getId(), safeSearch, safeSpec, pageable)
                .stream()
                .map(this::mapToDoctorResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "myDoctorDepartments", key = "#root.target.getCurrentUser().id")
    public List<DepartmentDto> getMyDepartments() {
        User currentUser = getCurrentUser();
        Doctor doctor = doctorRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Doctor profile not found for user id: " + currentUser.getId()));
        return mapDepartments(doctor).stream().toList();
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new ForbiddenException("Authenticated user not found");
    }

    private Branch resolveBranchForOnboarding(OnBoardDoctorRequestDto dto, User currentUser) {
        if (currentUser.getRoles().contains(RoleType.ADMIN)) {
            Admin admin = adminRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new NotFoundException("Admin profile not found for user id: " + currentUser.getId()));
            return admin.getBranch();
        }
        if (currentUser.getRoles().contains(RoleType.HEADADMIN)) {
            String branchName = dto.getBranchName() == null ? "" : dto.getBranchName().trim();
            if (branchName.isBlank()) {
                throw new IllegalArgumentException("branchName is required for head admin onboarding");
            }
            return resolveBranchByName(branchName);
        }
        throw new ForbiddenException("Only admin or head admin can onboard doctors");
    }

    private Branch resolveBranchByName(String branchName) {
        return branchRepository.findByNameIgnoreCase(branchName).orElseGet(() -> {
            List<Branch> partialMatches = branchRepository.findByNameContainingIgnoreCase(branchName);
            if (partialMatches.size() == 1) {
                return partialMatches.get(0);
            }
            throw new NotFoundException("Branch not found with name: " + branchName);
        });
    }

    private DoctorDto mapToDoctorDto(Doctor doctor, RatingSummaryResponse ratingSummary) {
        return new DoctorDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                mapDepartments(doctor),
                mapBranch(doctor.getBranch()),
                isDoctorHeadOfAnyDepartment(doctor),
                doctor.getConsultationFee(),
                ratingSummary,
                doctor.getUser() != null ? doctor.getUser().getProfilePhoto() : null,
                doctor.getDoctorStampUrl()
        );
    }

    private Map<Long, RatingSummaryResponse> getRatingSummariesByDoctorId(List<Doctor> doctors) {
        List<Long> doctorIds = doctors.stream()
                .map(Doctor::getId)
                .toList();
        if (doctorIds.isEmpty()) {
            return Map.of();
        }

        return doctorRatingSummaryRepository.findByDoctorIdIn(doctorIds)
                .stream()
                .map(this::mapToRatingSummaryResponse)
                .collect(Collectors.toMap(RatingSummaryResponse::doctorId, Function.identity()));
    }

    private Map<Long, RatingSummaryResponse> getRatingSummariesByDoctorIds(List<Long> doctorIds) {
        if (doctorIds.isEmpty()) {
            return Map.of();
        }

        return doctorRatingSummaryRepository.findByDoctorIdIn(doctorIds)
                .stream()
                .map(this::mapToRatingSummaryResponse)
                .collect(Collectors.toMap(RatingSummaryResponse::doctorId, Function.identity()));
    }

    private Map<Long, List<PublicDoctorDepartmentDto>> getPublicDepartmentsByDoctorId(List<Long> doctorIds) {
        if (doctorIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<PublicDoctorDepartmentDto>> departmentsByDoctorId = new LinkedHashMap<>();
        for (Long doctorId : doctorIds) {
            departmentsByDoctorId.put(doctorId, new ArrayList<>());
        }

        for (PublicDoctorDepartmentRow row : doctorRepository.findPublicDoctorDepartmentsByDoctorIds(doctorIds)) {
            List<PublicDoctorDepartmentDto> departments = departmentsByDoctorId.get(row.doctorId());
            if (departments != null) {
                departments.add(new PublicDoctorDepartmentDto(row.departmentId(), row.departmentName()));
            }
        }

        return departmentsByDoctorId.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> List.copyOf(entry.getValue())));
    }

    private RatingSummaryResponse mapToRatingSummaryResponse(DoctorRatingSummary summary) {
        return new RatingSummaryResponse(
                summary.getDoctorId(),
                summary.getAverageRating(),
                summary.getTotalReviews()
        );
    }

    private RatingSummaryResponse emptyRatingSummary(Long doctorId) {
        return new RatingSummaryResponse(doctorId, 0.0, 0L);
    }

    private DoctorResponseDto mapToDoctorResponseDto(Doctor doctor) {
        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail(),
                mapDepartments(doctor),
                mapBranchResponse(doctor.getBranch()),
                doctor.getConsultationFee(),
                doctor.getUser() != null ? doctor.getUser().getProfilePhoto() : null,
                doctor.getDoctorStampUrl()
        );
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "doctorById", allEntries = true),
        @CacheEvict(value = "doctorListPaged", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true)
    })
    public DoctorStampResponseDto updateDoctorStamp(Long doctorId, MultipartFile stamp) {
        validateDoctorStamp(stamp);
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found with id: " + doctorId));
        Map<?, ?> response = cloudinaryService.upload(stamp);
        Object secureUrl = response.get("secure_url");
        if (secureUrl == null || secureUrl.toString().isBlank()) {
            throw new ValidationException("Doctor stamp upload failed. Please try again.");
        }
        doctor.setDoctorStampUrl(secureUrl.toString());
        doctorRepository.save(doctor);
        return new DoctorStampResponseDto(doctor.getDoctorStampUrl());
    }

    private void validateDoctorStamp(MultipartFile stamp) {
        if (stamp == null || stamp.isEmpty()) {
            throw new ValidationException("Doctor stamp image is required");
        }
        if (stamp.getSize() > MAX_STAMP_FILE_SIZE_BYTES) {
            throw new ValidationException("Doctor stamp image must be 5 MB or less");
        }
        String contentType = stamp.getContentType() == null
                ? ""
                : stamp.getContentType().toLowerCase(Locale.ROOT).trim();
        if (!ALLOWED_STAMP_CONTENT_TYPES.contains(contentType)) {
            throw new ValidationException("Only JPG, PNG, or WEBP stamp images are allowed");
        }
        try {
            BufferedImage image = ImageIO.read(stamp.getInputStream());
            if (image == null) {
                throw new ValidationException("Invalid doctor stamp image content");
            }
        } catch (IOException e) {
            throw new ValidationException("Failed to read doctor stamp image");
        }
    }

    private boolean isDoctorHeadOfAnyDepartment(Doctor doctor) {
        return doctor.getHeadedDepartments() != null && !doctor.getHeadedDepartments().isEmpty();
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "doctorById", allEntries = true),
        @CacheEvict(value = "doctorListPaged", allEntries = true),
        @CacheEvict(value = "doctorListByName", allEntries = true),
        @CacheEvict(value = "myDoctorDepartments", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true),
        @CacheEvict(value = "departmentListAll", allEntries = true),
        @CacheEvict(value = "departmentById", key = "'id:' + #deptId"),
        @CacheEvict(value = "adminDepartments", allEntries = true)
    })
    public void addDoctorToDepartment(Long deptId, Long doctorId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (dept.getHeadDoctor() == null || !dept.getHeadDoctor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the head of this department");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        dept.getDoctors().add(doctor);
        doctor.getDepartments().add(dept);
        departmentRepository.save(dept);

        auditLogService.logAction(
                "ASSIGN_DOCTOR_TO_DEPARTMENT",
                "Department",
                deptId,
                "Assigned doctor ID " + doctorId + " to department ID " + deptId
        );
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "doctorById", allEntries = true),
        @CacheEvict(value = "doctorListPaged", allEntries = true),
        @CacheEvict(value = "doctorListByName", allEntries = true),
        @CacheEvict(value = "myDoctorDepartments", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true),
        @CacheEvict(value = "departmentListAll", allEntries = true),
        @CacheEvict(value = "departmentById", key = "'id:' + #deptId"),
        @CacheEvict(value = "adminDepartments", allEntries = true)
    })
    public void removeDoctorFromDepartment(Long deptId, Long doctorId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (dept.getHeadDoctor() == null || !dept.getHeadDoctor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the head of this department");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        dept.getDoctors().remove(doctor);
        doctor.getDepartments().remove(dept);
        departmentRepository.save(dept);

        auditLogService.logAction(
                "REMOVE_DOCTOR_FROM_DEPARTMENT",
                "Department",
                deptId,
                "Removed doctor ID " + doctorId + " from department ID " + deptId
        );
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "doctorById", allEntries = true),
        @CacheEvict(value = "doctorListPaged", allEntries = true),
        @CacheEvict(value = "doctorListByName", allEntries = true),
        @CacheEvict(value = "myDoctorDepartments", allEntries = true),
        @CacheEvict(value = "branchDoctors", allEntries = true),
        @CacheEvict(value = "departmentListAll", allEntries = true),
        @CacheEvict(value = "departmentById", key = "'id:' + #deptId"),
        @CacheEvict(value = "adminDepartments", allEntries = true)
    })
    public void updateDepartment(Long deptId, DepartmentDto deptDto) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (dept.getHeadDoctor() == null || !dept.getHeadDoctor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the head of this department");
        }
        
        dept.setDescription(deptDto.getDescription());
        // Map other fields as needed, e.g., services if they exist in Entity
        departmentRepository.save(dept);
    }

    private Set<DepartmentDto> mapDepartments(Doctor doctor) {
        java.util.Map<Long, Department> uniqueDepts = new java.util.HashMap<>();
        
        if (doctor.getDepartments() != null) {
            doctor.getDepartments().forEach(d -> {
                if (d != null && d.getId() != null && d.getBranch() != null) {
                    uniqueDepts.put(d.getId(), d);
                }
            });
        }
        
        // Use eager-loaded headedDepartments collection
        if (doctor.getHeadedDepartments() != null) {
            doctor.getHeadedDepartments().forEach(d -> {
                if (d != null && d.getId() != null && d.getBranch() != null) {
                    uniqueDepts.put(d.getId(), d);
                }
            });
        }

        if (uniqueDepts.isEmpty()) return Set.of();
        
        return uniqueDepts.values().stream()
                .map(department -> {
                    DepartmentDto dto = new DepartmentDto();
                    dto.setId(department.getId());
                    dto.setName(department.getName());
                    dto.setBranchId(department.getBranch().getId());
                    dto.setHeadDoctorId(department.getHeadDoctor() != null ? department.getHeadDoctor().getId() : null);
                    // Optimized: Avoid loading all members and patients for efficiency during bulk mapping
                    dto.setDoctorIds(Set.of());
                    dto.setHeadDoctorName(department.getHeadDoctor() != null ? department.getHeadDoctor().getName() : null);
                    dto.setMemberCount(0); 
                    dto.setDescription(department.getDescription());
                    dto.setImageUrl(department.getImageUrl());
                    dto.setAccentColor(department.getAccentColor());
                    dto.setBgColor(department.getBgColor());
                    dto.setIcon(department.getIcon());
                    dto.setPatientCount(0);
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
                branch.getEmail()
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
        BranchResponseDto branchDto = new BranchResponseDto(
                branch.getId(),
                branch.getName(),
                branch.getAddress(),
                branch.getEmail(),
                branch.getContactNumber()
        );
        return new AdminDto(
                branch.getAdmin().getId(),
                branch.getAdmin().getName(),
                branch.getAdmin().getEmail(),
                branchDto
        );
    }

}
