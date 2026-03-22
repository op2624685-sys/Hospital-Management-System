package com.hms.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.AdminDto;
import com.hms.dto.Response.HeadAdminBranchDetailsDto;
import com.hms.dto.Response.HeadAdminBranchSummaryDto;
import com.hms.dto.Response.HeadAdminDepartmentDetailsDto;
import com.hms.dto.Response.HeadAdminDoctorInfoDto;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.entity.Branch;
import com.hms.repository.AdminRepository;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.service.HeadAdminService;
import com.hms.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HeadAdminServiceImpl implements HeadAdminService {

    private static final long ESTIMATED_REVENUE_PER_APPOINTMENT = 500L;

    private final BranchRepository branchRepository;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HeadAdminBranchSummaryDto> getBranchOverview() {
        return branchRepository.findAll().stream().map(this::toBranchSummary).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HeadAdminBranchDetailsDto getBranchDetails(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + branchId));

        List<AdminDto> admins = adminRepository.findByBranchId(branchId).stream()
                .map(admin -> new AdminDto(admin.getId(), admin.getName(), admin.getEmail(), branchId))
                .toList();

        List<HeadAdminDoctorInfoDto> doctors = doctorRepository.findByBranch_Id(branchId).stream()
                .map(doctor -> new HeadAdminDoctorInfoDto(
                        doctor.getId(),
                        doctor.getName(),
                        doctor.getSpecialization(),
                        doctor.getEmail()))
                .toList();

        List<PatientResponseDto> patients = patientRepository.findByBranches_Id(branchId).stream()
                .map(patient -> new PatientResponseDto(
                        patient.getId(),
                        patient.getName(),
                        patient.getBirthDate() != null ? patient.getBirthDate().toString() : null,
                        patient.getGender() != null ? patient.getGender().name() : null,
                        patient.getBloodGroup() != null ? patient.getBloodGroup().name() : null,
                        patient.getEmail()))
                .toList();

        List<HeadAdminDepartmentDetailsDto> departments = departmentRepository.findByBranch_Id(branchId).stream()
                .map(department -> new HeadAdminDepartmentDetailsDto(
                        department.getId(),
                        department.getName(),
                        department.getHeadDoctor() != null ? department.getHeadDoctor().getId() : null,
                        department.getHeadDoctor() != null ? department.getHeadDoctor().getName() : null,
                        department.getDoctors() != null ? (long) department.getDoctors().size() : 0L,
                        department.getPatients() != null ? (long) department.getPatients().size() : 0L))
                .toList();

        return new HeadAdminBranchDetailsDto(
                toBranchSummary(branch),
                admins,
                doctors,
                patients,
                departments);
    }

    @Override
    public List<String> suggestUsernames(String query) {
        String q = query == null ? "" : query.trim();
        if (q.isEmpty()) return List.of();
        return userRepository.findTop10ByUsernameStartingWithIgnoreCase(q)
                .stream()
                .map(user -> user.getUsername())
                .toList();
    }

    @Override
    public List<String> suggestBranchNames(String query) {
        String q = query == null ? "" : query.trim();
        if (q.isEmpty()) return List.of();
        return branchRepository.findTop10ByNameStartingWithIgnoreCase(q)
                .stream()
                .map(branch -> branch.getName())
                .toList();
    }

    private HeadAdminBranchSummaryDto toBranchSummary(Branch branch) {
        Long branchId = branch.getId();
        long appointmentCount = appointmentRepository.countByBranch_Id(branchId);
        List<AdminDto> admins = adminRepository.findByBranchId(branchId).stream()
                .map(admin -> new AdminDto(admin.getId(), admin.getName(), admin.getEmail(), branchId))
                .toList();

        if (admins.size() > 1) {
            throw new RuntimeException("Data integrity issue: more than one admin mapped to branch id " + branchId);
        }

        String adminName = admins.isEmpty() ? "Not Assigned" : admins.get(0).getName();
        String adminUsername = admins.isEmpty() || branch.getAdmin() == null || branch.getAdmin().getUser() == null
                ? "-"
                : branch.getAdmin().getUser().getUsername();
        return new HeadAdminBranchSummaryDto(
                branchId,
                branch.getName(),
                branch.getAddress(),
                branch.getContactNumber(),
                branch.getEmail(),
                adminName,
                adminUsername,
                (long) admins.size(),
                (long) doctorRepository.findByBranch_Id(branchId).size(),
                (long) patientRepository.findByBranches_Id(branchId).size(),
                (long) departmentRepository.findByBranch_Id(branchId).size(),
                appointmentCount,
                appointmentCount * ESTIMATED_REVENUE_PER_APPOINTMENT);
    }
}
