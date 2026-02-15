package com.hms.service;

import java.util.List;

import com.hms.dto.AppointmentDto;
import com.hms.dto.CreateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.entity.Appointment;

public interface AppointmentService{

    Appointment reAssignAppointmentToAnotherDoctor(Long appointmentId, Long newDoctorId);

    List<AppointmentDto> getAllAppointmentsOfDoctor(Long doctorId);

    AppointmentResponseDto createNewAppointment(CreateAppointmentRequestDto createAppointmentRequestDto);

}
