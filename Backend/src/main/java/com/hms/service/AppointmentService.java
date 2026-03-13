package com.hms.service;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.hms.dto.Request.CreateAppointmentRequestDto;
import com.hms.dto.Request.UpdateAppointmentRequestDto;
import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.entity.Appointment;
import com.hms.entity.type.AppointmentStatusType;

public interface AppointmentService{

    Appointment reAssignAppointmentToAnotherDoctor(Long appointmentId, Long newDoctorId);

    AppointmentResponseDto getAppointmentByAppointmentId(String appointmentId);

    List<AppointmentResponseDto> getAllAppointmentsOfDoctor(Long doctorId);
    
    List<AppointmentResponseDto> getAllAppointmentsOfPatient(Long patientId);

    AppointmentResponseDto createNewAppointment(CreateAppointmentRequestDto createAppointmentRequestDto);

    AppointmentResponseDto updateAppointmentStatus(String appointmentId, AppointmentStatusType status);

    AppointmentResponseDto cancelAppointmentByPatient(String appointmentId);

    AppointmentResponseDto updateAppointment(String appointmentId, UpdateAppointmentRequestDto updateAppointmentRequestDto);

    List<LocalDateTime> getBookedSlotsForDoctor(Long doctorId, LocalDate date);

    List<AppointmentResponseDto> getRecentAppointmentsForAdmin(int page, int size);

}
