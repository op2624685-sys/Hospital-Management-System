package com.hms.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.hms.dto.Request.UpdateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.entity.User;
import com.hms.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.validation.Valid;


@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor")
public class DoctorController {

    private final AppointmentService appointmentService;

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
    
}
