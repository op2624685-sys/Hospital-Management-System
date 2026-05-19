package com.hms.service;

import java.time.LocalDate;
import java.util.List;

import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.DoctorQueueSummaryDto;
import com.hms.dto.Response.ReceptionistResponseDto;
import com.hms.entity.type.AppointmentStatusType;

public interface ReceptionistService {

    ReceptionistResponseDto getProfile();

    List<AppointmentResponseDto> getDepartmentAppointments(
            LocalDate date,
            AppointmentStatusType status,
            Long doctorId,
            String search,
            int page,
            int size);

    List<AppointmentResponseDto> searchAppointments(String appointmentId, String patientName, LocalDate birthDate);

    AppointmentResponseDto getAppointmentDetails(String appointmentId);

    AppointmentResponseDto updateAppointmentStatus(String appointmentId, AppointmentStatusType targetStatus);

    List<DoctorQueueSummaryDto> getDepartmentQueue(LocalDate date);

    DoctorQueueSummaryDto getDoctorQueue(Long doctorId, LocalDate date);
}
