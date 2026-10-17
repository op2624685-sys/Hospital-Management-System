package com.hms.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.AdminDto;
import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.AddDepartmentToBranchRequestDto;
import com.hms.dto.Request.OnBoardDoctorRequestDto;
import com.hms.dto.Request.OnBoardReceptionistRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.AdminOverviewDto;
import com.hms.dto.Response.AdminDepartmentListDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.dto.Response.ReceptionistResponseDto;
import com.hms.service.AppointmentService;
import com.hms.service.DepartmentService;
import com.hms.service.DoctorService;
import com.hms.service.PatientService;
import com.hms.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "High-level administrative endpoints for hospital management, staff onboarding, and system overview")
public class AdminController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final AppointmentService appointmentService;
    private final AdminService adminService;

    @GetMapping("/patients")
    @Operation(summary = "Get All Patients", description = "Retrieves a paginated list of all patients registered in the system for administrative review")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Patient list retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid pagination parameters") })
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(
            @RequestParam(name = "page", defaultValue = "0") Integer pageNumber,
            @RequestParam(name = "size", defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(patientService.getAllPatients(pageNumber, pageSize));
    }

    @GetMapping("/profile")
    @Operation(summary = "View Admin Profile", description = "Retrieves the administrative profile of the currently logged-in administrator")
    @ApiResponse(responseCode = "200", description = "Administrator profile retrieved successfully")
    public ResponseEntity<AdminDto> getAdminProfile() {
        return ResponseEntity.ok(adminService.getAdminProfile());
    }

    @GetMapping("/overview")
    @Operation(summary = "System Overview", description = "Retrieves a high-level dashboard overview of hospital statistics for the administrator")
    @ApiResponse(responseCode = "200", description = "System overview retrieved successfully")
    public ResponseEntity<AdminOverviewDto> getAdminOverview() {
        return ResponseEntity.ok(adminService.getAdminOverview());
    }

    @GetMapping("/departments")
    @Operation(summary = "Get Branch Departments", description = "Retrieves all departments associated with the administrator's current hospital branch")
    @ApiResponse(responseCode = "200", description = "Branch departments retrieved successfully")
    public ResponseEntity<List<AdminDepartmentListDto>> getDepartmentsForAdminBranch() {
        return ResponseEntity.ok(departmentService.getDepartmentsForAdminBranch());
    }

    @GetMapping("/department-templates")
    @Operation(summary = "Get Department Templates", description = "Retrieves pre-defined department templates for creating new branches")
    @ApiResponse(responseCode = "200", description = "Department templates retrieved successfully")
    public ResponseEntity<List<DepartmentDto>> getDepartmentTemplates() {
        return ResponseEntity.ok(departmentService.getDepartmentTemplates());
    }

    @PostMapping("/onBoardNewDoctor")
    @Operation(summary = "Onboard New Doctor", description = "Registers a new doctor into the hospital system and assigns them to a branch")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Doctor onboarded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid onboarding data")
    })
    public ResponseEntity<DoctorResponseDto> onBoardNewDoctor(
            @Valid @RequestBody OnBoardDoctorRequestDto onBoardDoctorRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.onBoardNewDoctor(onBoardDoctorRequestDto));
    }

    @PostMapping("/onBoardNewReceptionist")
    @Operation(summary = "Onboard New Receptionist", description = "Registers a new receptionist into the hospital system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Receptionist onboarded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid onboarding data")
    })
    public ResponseEntity<ReceptionistResponseDto> onBoardNewReceptionist(
            @Valid @RequestBody OnBoardReceptionistRequestDto onBoardReceptionistRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.onBoardNewReceptionist(onBoardReceptionistRequestDto));
    }

    @PostMapping("/addDepartmentToBranch")
    @Operation(summary = "Add Department to Branch", description = "Assigns a specific medical department to a hospital branch")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Department added to branch successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<DepartmentDto> addDepartmentToBranch(
            @Valid @RequestBody AddDepartmentToBranchRequestDto addDepartmentToBranchRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.addDepartmentToBranch(addDepartmentToBranchRequestDto));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get Branch Doctors", description = "Retrieves a filtered list of doctors associated with the admin's current branch")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Branch doctors retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid filter or pagination parameters") })
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
    @Operation(summary = "Get Recent Appointments", description = "Retrieves a paginated list of the most recent appointments for administrative monitoring")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Appointments retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid pagination parameters") })
    public ResponseEntity<List<AppointmentResponseDto>> getRecentAppointments(
            @RequestParam(name = "page", defaultValue = "0") Integer pageNumber,
            @RequestParam(name = "size", defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(appointmentService.getRecentAppointmentsForAdmin(pageNumber, pageSize));
    }
}
