package com.hms.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.AdminDto;
import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.AddDepartmentToBranchRequestDto;
import com.hms.dto.Request.OnBoardDoctorRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.AdminOverviewDto;
import com.hms.dto.Response.AdminDepartmentListDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.service.AppointmentService;
import com.hms.service.DepartmentService;
import com.hms.service.DoctorService;
import com.hms.service.PatientService;
import com.hms.service.AdminService;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final AppointmentService appointmentService;
    private final AdminService adminService;

    @GetMapping("/patients")
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(
            @RequestParam(name = "page", defaultValue = "0") Integer pageNumber,
            @RequestParam(name = "size", defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(patientService.getAllPatients(pageNumber, pageSize));
    }

    @GetMapping("/profile")
    public ResponseEntity<AdminDto> getAdminProfile() {
        return ResponseEntity.ok(adminService.getAdminProfile());
    }

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewDto> getAdminOverview() {
        return ResponseEntity.ok(adminService.getAdminOverview());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<AdminDepartmentListDto>> getDepartmentsForAdminBranch() {
        return ResponseEntity.ok(departmentService.getDepartmentsForAdminBranch());
    }

    @GetMapping("/department-templates")
    public ResponseEntity<List<DepartmentDto>> getDepartmentTemplates() {
        return ResponseEntity.ok(departmentService.getDepartmentTemplates());
    }

    @PostMapping("/onBoardNewDoctor")
    public ResponseEntity<DoctorResponseDto> onBoardNewDoctor(
            @Valid @RequestBody OnBoardDoctorRequestDto onBoardDoctorRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.onBoardNewDoctor(onBoardDoctorRequestDto));
    }

    @PostMapping("/addDepartmentToBranch")
    public ResponseEntity<DepartmentDto> addDepartmentToBranch(
            @Valid @RequestBody AddDepartmentToBranchRequestDto addDepartmentToBranchRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.addDepartmentToBranch(addDepartmentToBranchRequestDto));
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDto>> getDoctorsForAdminBranch(
            @RequestParam(name = "page", defaultValue = "0") Integer pageNumber,
            @RequestParam(name = "size", defaultValue = "10") Integer pageSize,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "specialization", required = false) String specialization,
            @RequestParam(name = "sort", defaultValue = "name") String sortBy) {
        return ResponseEntity.ok(doctorService.getDoctorsForAdminBranch(
                pageNumber, pageSize, search, specialization, sortBy));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDto>> getRecentAppointments(
            @RequestParam(name = "page", defaultValue = "0") Integer pageNumber,
            @RequestParam(name = "size", defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(appointmentService.getRecentAppointmentsForAdmin(pageNumber, pageSize));
    }
}
