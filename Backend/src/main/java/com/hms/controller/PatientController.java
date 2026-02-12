package com.hms.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.PatientDto;
import com.hms.dto.Request.PatientRequest;
import com.hms.service.PatientService;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
@RequiredArgsConstructor
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientDto>> getAllPatient() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/{name}")
    public ResponseEntity<List<PatientDto>> getPatientByName(@PathVariable String name) {
        return ResponseEntity.ok(patientService.getPatientByName(name));
    }

    @GetMapping("{name}/{birthDate}")
    public ResponseEntity<PatientDto> getPatientByNameAndBirthDate(@PathVariable String name, @PathVariable LocalDate birthDate) {
        return ResponseEntity.ok(patientService.getPatientByNameAndBirthDate(name, birthDate));
    }

    @PostMapping
    public ResponseEntity<PatientDto> createNewPatient(@RequestBody PatientRequest patientRequest) {
        return ResponseEntity.status(201).body(patientService.createNewPatient(patientRequest));
    }

    @PutMapping
    public ResponseEntity<PatientDto> updatePatientById(@RequestBody PatientRequest patientRequest) {
        return ResponseEntity.ok(patientService.updatePatientById(patientRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.deletePatient(id));
    }
    
    
}
