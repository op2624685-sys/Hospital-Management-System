package com.hms.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.DoctorQueueSummaryDto;
import com.hms.dto.Response.ReceptionistResponseDto;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.service.ReceptionistService;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/receptionist")
@RequiredArgsConstructor
@Tag(name = "Reception Operations", description = "Receptionist endpoints for appointment management and doctor queue visibility")
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @GetMapping("/profile")
    @Operation(summary = "Get Receptionist Profile", description = "Returns the profile of the authenticated receptionist")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Receptionist profile retrieved successfully"), @ApiResponse(responseCode = "404", description = "Receptionist profile not found") })
    public ResponseEntity<ReceptionistResponseDto> getProfile() {
        return ResponseEntity.ok(receptionistService.getProfile());
    }

    @GetMapping("/appointments")
    @Operation(summary = "List Department Appointments", description = "Returns filtered and paginated appointments for the receptionist's department")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Appointments retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid filter or pagination parameters") })
    public ResponseEntity<List<AppointmentResponseDto>> getAppointments(
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "status", required = false) AppointmentStatusType status,
            @RequestParam(name = "doctorId", required = false) Long doctorId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "15") int size) {
        return ResponseEntity.ok(receptionistService.getDepartmentAppointments(date, status, doctorId, search, page, size));
    }

    @GetMapping("/appointments/search")
    @Operation(summary = "Search Appointments", description = "Searches appointments by appointment ID, patient name, or date of birth")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Matching appointments retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid search parameters") })
    public ResponseEntity<List<AppointmentResponseDto>> searchAppointments(
            @RequestParam(name = "appointmentId", required = false) String appointmentId,
            @RequestParam(name = "patientName", required = false) String patientName,
            @RequestParam(name = "birthDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate) {
        return ResponseEntity.ok(receptionistService.searchAppointments(appointmentId, patientName, birthDate));
    }

    @GetMapping("/appointments/{appointmentId}")
    @Operation(summary = "Get Appointment Details", description = "Retrieves complete details for a specific appointment")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Appointment details retrieved successfully"), @ApiResponse(responseCode = "404", description = "Appointment not found") })
    public ResponseEntity<AppointmentResponseDto> getAppointment(@PathVariable String appointmentId) {
        return ResponseEntity.ok(receptionistService.getAppointmentDetails(appointmentId));
    }

    @PutMapping("/appointments/{appointmentId}/status")
    @Operation(summary = "Update Appointment Status", description = "Updates the status of an appointment managed by reception")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Appointment status updated successfully"), @ApiResponse(responseCode = "400", description = "Invalid appointment status"), @ApiResponse(responseCode = "404", description = "Appointment not found") })
    public ResponseEntity<AppointmentResponseDto> updateStatus(
            @PathVariable String appointmentId,
            @RequestParam(name = "status") AppointmentStatusType status) {
        return ResponseEntity.ok(receptionistService.updateAppointmentStatus(appointmentId, status));
    }

    @GetMapping("/queue")
    @Operation(summary = "Get Department Queue", description = "Returns the appointment queue for the receptionist's department")
    @ApiResponse(responseCode = "200", description = "Department queue retrieved successfully")
    public ResponseEntity<List<DoctorQueueSummaryDto>> getDepartmentQueue(
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(receptionistService.getDepartmentQueue(date));
    }

    @GetMapping("/queue/doctors/{doctorId}")
    @Operation(summary = "Get Doctor Queue", description = "Returns the queue for a specific doctor")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Doctor queue retrieved successfully"), @ApiResponse(responseCode = "404", description = "Doctor not found") })
    public ResponseEntity<DoctorQueueSummaryDto> getDoctorQueue(
            @PathVariable Long doctorId,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(receptionistService.getDoctorQueue(doctorId, date));
    }
}
