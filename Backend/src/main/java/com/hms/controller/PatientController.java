package com.hms.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.PatientDto;
import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.entity.User;
import com.hms.service.AppointmentService;
import com.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;

     @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDto> createNewAppointment(@RequestBody CreateAppointmentRequestDto createAppointmentRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createNewAppointment(createAppointmentRequestDto));
    }

    @GetMapping("/appointments/check/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentByAppointmentId(@PathVariable String appointmentId) {
        return ResponseEntity.ok(appointmentService.getAppointmentByAppointmentId(appointmentId));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<PatientDto> getPatientProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok().body(patientService.getPatientById(user.getId()));
    }
    
}
