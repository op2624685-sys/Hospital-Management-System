package com.hms.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.InsuranceDto;
import com.hms.dto.PatientDto;
import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Request.CreateInsuranceRequestDto;
import com.hms.dto.Request.PatientUpdateRequest;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.ProfileCompletionStatusDto;
import com.hms.entity.User;
import com.hms.service.AppointmentService;
import com.hms.service.InsuranceService;
import com.hms.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final InsuranceService insuranceService;

     @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDto> createNewAppointment(@Valid @RequestBody CreateAppointmentRequestDto createAppointmentRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.createConfirmedAppointment(createAppointmentRequestDto));
    }

    @GetMapping("/appointments/check/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentByAppointmentId(@PathVariable(name = "appointmentId") String appointmentId) {
        return ResponseEntity.ok(appointmentService.getAppointmentByAppointmentId(appointmentId));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointmentsOfLoggedInPatient(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "15") int size) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(appointmentService.getAllAppointmentsOfPatient(user.getId(), page, size));
    }

    @PutMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponseDto> cancelAppointmentByPatient(@PathVariable(name = "appointmentId") String appointmentId) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByPatient(appointmentId));
    }

    @PostMapping("/insurance")
    public ResponseEntity<InsuranceDto> createInsurance(@Valid @RequestBody CreateInsuranceRequestDto createInsuranceRequestDto) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(insuranceService.createInsuranceForPatient(createInsuranceRequestDto, user.getId()));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<PatientDto> getPatientProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok().body(patientService.getPatientById(user.getId()));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<PatientDto> updatePatientProfile(@Valid @RequestBody PatientUpdateRequest patientUpdateRequest) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        PatientDto updatedPatient = patientService.updatePatientProfileWithEditLimit(user.getId(), patientUpdateRequest);
        return ResponseEntity.ok(updatedPatient);
    }
    
    @GetMapping("/profile/completion-status")
    public ResponseEntity<ProfileCompletionStatusDto> getProfileCompletionStatus() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        ProfileCompletionStatusDto completionStatus = patientService.getProfileCompletionStatus(user.getId());
        return ResponseEntity.ok(completionStatus);
    }
    
}
