package com.hms.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Request.OnBoardDoctorRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.service.AdminService;
import com.hms.service.DoctorService;
import com.hms.service.PatientService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final AdminService adminService;

    @GetMapping("/patients")
    public ResponseEntity<List<PatientResponseDto>> getAllPatients(
            @RequestParam(value = "page", defaultValue = "0") Integer pageNumber,
            @RequestParam(value = "size", defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(patientService.getAllPatients(pageNumber, pageSize));
    }

    @PostMapping("/onBoardNewDoctor")
    public ResponseEntity<DoctorResponseDto> onBoardNewDoctor(
            @RequestBody OnBoardDoctorRequestDto onBoardDoctorRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.onBoardNewDoctor(onBoardDoctorRequestDto));
    }

    @PostMapping("/onBoardNewAdmin")
    public ResponseEntity<AdminResponseDto> onBoardNewAdmin(
            @RequestBody OnBoardAdminRequestDto onBoardAdminRequestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.onBoardNewAdmin(onBoardAdminRequestDto));
    }
    
}
