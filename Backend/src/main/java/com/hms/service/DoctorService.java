package com.hms.service;

import java.util.List;

import com.hms.dto.DoctorDto;
import com.hms.dto.Request.DoctorRequest;

public interface DoctorService {

    List<DoctorDto> getAllDoctors();

    DoctorDto getDoctorById(Long id);

    List<DoctorDto> getDoctorByName(String name);

    DoctorDto createNewDoctor(DoctorRequest doctorRequest);

    String deleteDoctorById(Long id);

}
