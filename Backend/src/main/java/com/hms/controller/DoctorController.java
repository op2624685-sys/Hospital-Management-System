package com.hms.controller;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.hms.dto.Request.UpdateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.DoctorStampResponseDto;
import com.hms.dto.Response.PrescriptionResponseDto;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.User;
import com.hms.dto.DoctorDto;
import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.PrescriptionRequestDto;
import com.hms.service.AppointmentService;
import com.hms.service.DoctorService;
import com.hms.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;


@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor")
@Tag(name = "Doctor Operations", description = "Endpoints for medical professionals to manage their profiles, departments, and patient appointments")
public class DoctorController {

    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final PrescriptionService prescriptionService;

    @GetMapping("/my-departments")
    @Operation(summary = "Get Assigned Departments", description = "Retrieves a list of all medical departments the logged-in doctor is associated with")
    @ApiResponse(responseCode = "200", description = "Assigned departments retrieved successfully")
    public ResponseEntity<List<DepartmentDto>> getMyDepartments() {
        return ResponseEntity.ok(doctorService.getMyDepartments());
    }

    @GetMapping("/profile")
    @Operation(summary = "View Doctor Profile", description = "Retrieves the professional profile of the authenticated doctor")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Doctor profile retrieved successfully"), @ApiResponse(responseCode = "404", description = "Doctor profile not found") })
    public ResponseEntity<DoctorDto> getDoctorProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(doctorService.getDoctorById(user.getId()));
    }

    @PostMapping("/profile/stamp")
    @Operation(summary = "Update Digital Stamp", description = "Uploads and updates the doctor's digital signature/stamp used for prescriptions")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stamp updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file format or size")
    })
    public ResponseEntity<DoctorStampResponseDto> updateDoctorStamp(
            @RequestParam("stamp") MultipartFile stamp) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(doctorService.updateDoctorStamp(user.getId(), stamp));
    }

    @PostMapping("/departments/{deptId}/doctors/{doctorId}")
    @Operation(summary = "Assign Doctor to Department", description = "Administrative action to link a doctor to a specific department")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Doctor assigned to department successfully"), @ApiResponse(responseCode = "404", description = "Doctor or department not found"), @ApiResponse(responseCode = "409", description = "Doctor is already assigned") })
    public ResponseEntity<String> addDoctorToDepartment(@PathVariable Long deptId, @PathVariable Long doctorId) {
        doctorService.addDoctorToDepartment(deptId, doctorId);
        return ResponseEntity.ok("Doctor added successfully");
    }

    @DeleteMapping("/departments/{deptId}/doctors/{doctorId}")
    @Operation(summary = "Remove Doctor from Department", description = "Administrative action to unlink a doctor from a department")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Doctor removed from department successfully"), @ApiResponse(responseCode = "404", description = "Doctor or department not found") })
    public ResponseEntity<String> removeDoctorFromDepartment(@PathVariable Long deptId, @PathVariable Long doctorId) {
        doctorService.removeDoctorFromDepartment(deptId, doctorId);
        return ResponseEntity.ok("Doctor removed successfully");
    }

    @PutMapping("/departments/{deptId}")
    @Operation(summary = "Update Department Details", description = "Updates the information of a specific department")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Department updated successfully"), @ApiResponse(responseCode = "400", description = "Invalid department data"), @ApiResponse(responseCode = "404", description = "Department not found") })
    public ResponseEntity<String> updateDepartment(@PathVariable Long deptId, @RequestBody DepartmentDto deptDto) {
        doctorService.updateDepartment(deptId, deptDto);
        return ResponseEntity.ok("Department updated successfully");
    }

    @GetMapping("/appointments")
    @Operation(summary = "Get Doctor Appointments", description = "Retrieves a paginated list of appointments for a specific doctor")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Appointments retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid pagination parameters") })
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointmentsOfDoctor(
            @RequestParam(name = "doctorId", required = false) Long doctorId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "15") int size) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long targetDoctorId = doctorId != null ? doctorId : user.getId();
        return ResponseEntity.ok(appointmentService.getAllAppointmentsOfDoctor(targetDoctorId, page, size));
    }

    @PutMapping("/appointments/{appointmentId}/status")
    @Operation(summary = "Update Appointment Status", description = "Updates the status of an appointment (e.g., COMPLETED, CANCELLED)")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Appointment status updated successfully"), @ApiResponse(responseCode = "400", description = "Invalid appointment status"), @ApiResponse(responseCode = "404", description = "Appointment not found") })
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable(name = "appointmentId") String appointmentId,
            @RequestParam(name = "status") AppointmentStatusType status) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(appointmentId, status));
    }

    @PutMapping("/appointments/{appointmentId}")
    @Operation(summary = "Update Appointment Details", description = "Modifies details of an existing appointment")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Appointment updated successfully"), @ApiResponse(responseCode = "400", description = "Invalid appointment data"), @ApiResponse(responseCode = "404", description = "Appointment not found") })
    public ResponseEntity<AppointmentResponseDto> updateAppointment(
            @PathVariable(name = "appointmentId") String appointmentId,
            @Valid @RequestBody UpdateAppointmentRequestDto updateAppointmentRequestDto) {
        return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, updateAppointmentRequestDto));
    }

    @PostMapping("/appointments/{appointmentId}/prescription")
    @Operation(summary = "Create Prescription", description = "Generates a new medical prescription for a specific appointment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Prescription created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid prescription data")
    })
    public ResponseEntity<PrescriptionResponseDto> createPrescription(
            @PathVariable String appointmentId,
            @Valid @RequestBody PrescriptionRequestDto request) {
        return ResponseEntity.ok(prescriptionService.createPrescription(appointmentId, request));
    }

    @PutMapping("/appointments/{appointmentId}/prescription")
    @Operation(summary = "Update Prescription", description = "Modifies an existing prescription for an appointment")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Prescription updated successfully"), @ApiResponse(responseCode = "400", description = "Invalid prescription data"), @ApiResponse(responseCode = "404", description = "Appointment or prescription not found") })
    public ResponseEntity<PrescriptionResponseDto> updatePrescription(
            @PathVariable String appointmentId,
            @Valid @RequestBody PrescriptionRequestDto request) {
        return ResponseEntity.ok(prescriptionService.updatePrescription(appointmentId, request));
    }

    @GetMapping("/appointments/{appointmentId}/prescription")
    @Operation(summary = "Get Prescription", description = "Retrieves the prescription details for a specific appointment")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Prescription retrieved successfully"), @ApiResponse(responseCode = "404", description = "Prescription not found") })
    public ResponseEntity<PrescriptionResponseDto> getPrescription(@PathVariable String appointmentId) {
        return ResponseEntity.ok(prescriptionService.getPrescription(appointmentId));
    }

    @PostMapping("/appointments/{appointmentId}/prescription/retry")
    @Operation(summary = "Retry Prescription Generation", description = "Triggers a regeneration of the prescription document if the first attempt failed")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Prescription generation retried successfully"), @ApiResponse(responseCode = "404", description = "Appointment or prescription not found"), @ApiResponse(responseCode = "409", description = "Prescription generation cannot be retried") })
    public ResponseEntity<PrescriptionResponseDto> retryPrescriptionGeneration(@PathVariable String appointmentId) {
        return ResponseEntity.ok(prescriptionService.retryGeneration(appointmentId));
    }
    
}
