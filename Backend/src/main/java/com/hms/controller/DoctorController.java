package com.hms.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hms.dto.DoctorDto;
import com.hms.dto.Request.DoctorRequest;
import com.hms.service.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/{name}")
    public ResponseEntity<List<DoctorDto>> getDoctorByName(@PathVariable String name){
        return ResponseEntity.ok(doctorService.getDoctorByName(name));
    }

    @PostMapping()
    public ResponseEntity<DoctorDto> createDoctor(@RequestBody DoctorRequest doctorRequest) {
        return ResponseEntity.status(201).body(doctorService.createNewDoctor(doctorRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.deleteDoctorById(id));
    }
}
