package com.hms.service.impl;

import java.util.List;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.hms.dto.DoctorDto;
import com.hms.dto.Request.OnBoardDoctorRequestDto;
import com.hms.dto.Response.DoctorResponseDto;
import com.hms.entity.Doctor;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;
import com.hms.service.DoctorService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
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
    public String deleteDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        doctorRepository.delete(doctor);
        return "Doctor deleted successfully with id: " + id;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public DoctorResponseDto onBoardNewDoctor(OnBoardDoctorRequestDto onBoardDoctorRequestDto) {
        User user = userRepository.findById(onBoardDoctorRequestDto.getUserId()).orElseThrow();

        if (doctorRepository.existsById(onBoardDoctorRequestDto.getUserId())) {
            throw new IllegalArgumentException("Already a doctor");
        }

        Doctor doctor = Doctor.builder()
                .name(onBoardDoctorRequestDto.getName())
                .specialization(onBoardDoctorRequestDto.getSpecialization())
                .email(onBoardDoctorRequestDto.getEmail())
                .user(user)
                .build();

            user.getRoles().add(RoleType.DOCTOR);

            return modelMapper.map(doctorRepository.save(doctor), DoctorResponseDto.class);
    }

}
