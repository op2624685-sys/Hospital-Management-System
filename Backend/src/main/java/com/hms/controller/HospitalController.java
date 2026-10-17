package com.hms.controller;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.BranchDto;
import com.hms.dto.DoctorDto;
import com.hms.dto.Response.PublicDoctorListDto;
import com.hms.service.AppointmentService;
import com.hms.service.BranchService;
import com.hms.service.DoctorService;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequiredArgsConstructor
@RequestMapping("/public")
@Tag(name = "Public Hospital Directory", description = "Public endpoints for discovering doctors, branches, and appointment availability")
public class HospitalController {

    private final DoctorService doctorService;
    private final BranchService branchService;
    private final AppointmentService appointmentService;

    @GetMapping("/doctors")
    @Operation(summary = "List Public Doctors", description = "Returns a paginated directory of doctors available for appointment booking")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Doctor directory retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid pagination or search parameters")
    })
    public ResponseEntity<List<PublicDoctorListDto>> getAllDoctors(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(doctorService.getPublicDoctors(search, page, size));
    }

    @GetMapping("/doctors/{doctorId}")
    @Operation(summary = "Get Doctor Details", description = "Returns the public professional profile of a doctor")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Doctor profile retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Doctor not found")
    })
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable(name = "doctorId") Long doctorId) {
        return ResponseEntity.ok(doctorService.getDoctorById(doctorId));
    }

    @GetMapping("/doctors/{doctorId}/booked-slots")
    @Operation(summary = "Get Booked Time Slots", description = "Returns the appointment time slots already booked for a doctor on a selected date")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booked slots retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid doctor or date parameter"),
        @ApiResponse(responseCode = "404", description = "Doctor not found")
    })
    public ResponseEntity<List<String>> getBookedSlots(
            @Parameter(description = "Unique identifier of the doctor") @PathVariable(name = "doctorId") Long doctorId,
            @Parameter(description = "Date for which booked slots are requested, in ISO format (yyyy-MM-dd)") @RequestParam(name = "date") LocalDate date) {
        List<String> slots = appointmentService.getBookedSlotsForDoctor(doctorId, date).stream()
                .map(LocalDateTime::toString)
                .toList();
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/branches")
    @Operation(summary = "List Hospital Branches", description = "Returns all hospital branches available for public appointment discovery")
    @ApiResponse(responseCode = "200", description = "Branch list retrieved successfully")
    public ResponseEntity<List<BranchDto>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }
}
