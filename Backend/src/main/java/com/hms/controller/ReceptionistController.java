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

@RestController
@RequestMapping("/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @GetMapping("/profile")
    public ResponseEntity<ReceptionistResponseDto> getProfile() {
        return ResponseEntity.ok(receptionistService.getProfile());
    }

    @GetMapping("/appointments")
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
    public ResponseEntity<List<AppointmentResponseDto>> searchAppointments(
            @RequestParam(name = "appointmentId", required = false) String appointmentId,
            @RequestParam(name = "patientName", required = false) String patientName,
            @RequestParam(name = "birthDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate) {
        return ResponseEntity.ok(receptionistService.searchAppointments(appointmentId, patientName, birthDate));
    }

    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> getAppointment(@PathVariable String appointmentId) {
        return ResponseEntity.ok(receptionistService.getAppointmentDetails(appointmentId));
    }

    @PutMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<AppointmentResponseDto> updateStatus(
            @PathVariable String appointmentId,
            @RequestParam(name = "status") AppointmentStatusType status) {
        return ResponseEntity.ok(receptionistService.updateAppointmentStatus(appointmentId, status));
    }

    @GetMapping("/queue")
    public ResponseEntity<List<DoctorQueueSummaryDto>> getDepartmentQueue(
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(receptionistService.getDepartmentQueue(date));
    }

    @GetMapping("/queue/doctors/{doctorId}")
    public ResponseEntity<DoctorQueueSummaryDto> getDoctorQueue(
            @PathVariable Long doctorId,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(receptionistService.getDoctorQueue(doctorId, date));
    }
}
