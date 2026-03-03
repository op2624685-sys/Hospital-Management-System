package com.hms.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.entity.User;
import com.hms.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor")
public class DoctorController {

    private final AppointmentService appointmentService;

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointmentsOfDoctor(
            @RequestParam(value = "doctorId", required = false) Long doctorId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long targetDoctorId = doctorId != null ? doctorId : user.getId();
        return ResponseEntity.ok(appointmentService.getAllAppointmentsOfDoctor(targetDoctorId));
    }
    
}
