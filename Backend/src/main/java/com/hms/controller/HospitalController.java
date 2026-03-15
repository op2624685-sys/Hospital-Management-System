package com.hms.controller;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.BranchDto;
import com.hms.dto.DoctorDto;
import com.hms.service.AppointmentService;
import com.hms.service.BranchService;
import com.hms.service.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/public")

public class HospitalController {

    private final DoctorService doctorService;
    private final BranchService branchService;
    private final AppointmentService appointmentService;

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorDto>> getAllDoctors(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(doctorService.getAllDoctors(page, size));
    }

    @GetMapping("/doctors/{doctorId}/booked-slots")
    public ResponseEntity<List<String>> getBookedSlots(
            @PathVariable(name = "doctorId") Long doctorId,
            @RequestParam(name = "date") LocalDate date) {
        List<String> slots = appointmentService.getBookedSlotsForDoctor(doctorId, date).stream()
                .map(LocalDateTime::toString)
                .toList();
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/branches")
    public ResponseEntity<List<BranchDto>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }
}
