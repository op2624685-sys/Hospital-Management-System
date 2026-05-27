package com.hms.controller;

import java.util.List;
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
public class DoctorController {

    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final PrescriptionService prescriptionService;

    @GetMapping("/my-departments")
    public ResponseEntity<List<DepartmentDto>> getMyDepartments() {
        return ResponseEntity.ok(doctorService.getMyDepartments());
    }

    @GetMapping("/profile")
    public ResponseEntity<DoctorDto> getDoctorProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(doctorService.getDoctorById(user.getId()));
    }

    @PostMapping("/profile/stamp")
    public ResponseEntity<DoctorStampResponseDto> updateDoctorStamp(
            @RequestParam("stamp") MultipartFile stamp) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(doctorService.updateDoctorStamp(user.getId(), stamp));
    }

    @PostMapping("/departments/{deptId}/doctors/{doctorId}")
    public ResponseEntity<String> addDoctorToDepartment(@PathVariable Long deptId, @PathVariable Long doctorId) {
        doctorService.addDoctorToDepartment(deptId, doctorId);
        return ResponseEntity.ok("Doctor added successfully");
    }

    @DeleteMapping("/departments/{deptId}/doctors/{doctorId}")
    public ResponseEntity<String> removeDoctorFromDepartment(@PathVariable Long deptId, @PathVariable Long doctorId) {
        doctorService.removeDoctorFromDepartment(deptId, doctorId);
        return ResponseEntity.ok("Doctor removed successfully");
    }

    @PutMapping("/departments/{deptId}")
    public ResponseEntity<String> updateDepartment(@PathVariable Long deptId, @RequestBody DepartmentDto deptDto) {
        doctorService.updateDepartment(deptId, deptDto);
        return ResponseEntity.ok("Department updated successfully");
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointmentsOfDoctor(
            @RequestParam(name = "doctorId", required = false) Long doctorId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "15") int size) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long targetDoctorId = doctorId != null ? doctorId : user.getId();
        return ResponseEntity.ok(appointmentService.getAllAppointmentsOfDoctor(targetDoctorId, page, size));
    }

    @PutMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable(name = "appointmentId") String appointmentId,
            @RequestParam(name = "status") AppointmentStatusType status) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(appointmentId, status));
    }

    @PutMapping("/appointments/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(
            @PathVariable(name = "appointmentId") String appointmentId,
            @Valid @RequestBody UpdateAppointmentRequestDto updateAppointmentRequestDto) {
        return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, updateAppointmentRequestDto));
    }

    @PostMapping("/appointments/{appointmentId}/prescription")
    public ResponseEntity<PrescriptionResponseDto> createPrescription(
            @PathVariable String appointmentId,
            @Valid @RequestBody PrescriptionRequestDto request) {
        return ResponseEntity.ok(prescriptionService.createPrescription(appointmentId, request));
    }

    @PutMapping("/appointments/{appointmentId}/prescription")
    public ResponseEntity<PrescriptionResponseDto> updatePrescription(
            @PathVariable String appointmentId,
            @Valid @RequestBody PrescriptionRequestDto request) {
        return ResponseEntity.ok(prescriptionService.updatePrescription(appointmentId, request));
    }

    @GetMapping("/appointments/{appointmentId}/prescription")
    public ResponseEntity<PrescriptionResponseDto> getPrescription(@PathVariable String appointmentId) {
        return ResponseEntity.ok(prescriptionService.getPrescription(appointmentId));
    }

    @PostMapping("/appointments/{appointmentId}/prescription/retry")
    public ResponseEntity<PrescriptionResponseDto> retryPrescriptionGeneration(@PathVariable String appointmentId) {
        return ResponseEntity.ok(prescriptionService.retryGeneration(appointmentId));
    }
    
}
