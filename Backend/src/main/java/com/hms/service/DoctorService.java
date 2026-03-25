package com.hms.service;

import java.util.List;

import com.hms.dto.DoctorDto;
import com.hms.dto.DepartmentDto;
import com.hms.dto.Request.OnBoardDoctorRequestDto;
import com.hms.dto.Response.DoctorResponseDto;

public interface DoctorService {

    List<DoctorDto> getAllDoctors(int page, int size);

    DoctorDto getDoctorById(Long id);

    List<DoctorDto> getDoctorByName(String name);

    String deleteDoctorById(Long id);

    DoctorResponseDto onBoardNewDoctor(OnBoardDoctorRequestDto onBoardDoctorRequestDto);

    List<DoctorResponseDto> getDoctorsForAdminBranch(int page, int size, String search, String specialization, String sortBy);

    List<DepartmentDto> getMyDepartments();
    void addDoctorToDepartment(Long deptId, Long doctorId);
    void removeDoctorFromDepartment(Long deptId, Long doctorId);
    void updateDepartment(Long deptId, DepartmentDto deptDto);

}
