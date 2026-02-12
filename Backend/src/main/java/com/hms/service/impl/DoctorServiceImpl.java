package com.hms.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.hms.dto.DoctorDto;
import com.hms.dto.Request.DoctorRequest;
import com.hms.entity.Doctor;
import com.hms.repository.DoctorRepository;
import com.hms.service.DoctorService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<DoctorDto> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        return doctors
                .stream()
                .map(doctor -> modelMapper.map(doctor, DoctorDto.class))
                .toList();
    }

    @Override
    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return modelMapper.map(doctor, DoctorDto.class);
    }

    @Override
    public List<DoctorDto> getDoctorByName(String name) {
        List<Doctor> doctors = doctorRepository.findByName(name);
        return doctors
                .stream()
                .map(doctor -> modelMapper.map(doctor, DoctorDto.class))
                .toList();
    }

    @Override
    public DoctorDto createNewDoctor(DoctorRequest doctorRequest) {
        Doctor doctor = modelMapper.map(doctorRequest, Doctor.class);
        Doctor savedDoctor = doctorRepository.save(doctor);
        return modelMapper.map(savedDoctor, DoctorDto.class);
    }

    @Override
    public String deleteDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        doctorRepository.delete(doctor);
        return "Doctor deleted successfully with id: " + id;
    }

    
    

    

}
