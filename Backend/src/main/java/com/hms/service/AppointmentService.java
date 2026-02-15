package com.hms.service;

import java.util.List;

import com.hms.dto.AppointmentDto;
import com.hms.entity.Appointment;

public interface AppointmentService{

    Appointment createNewAppointment(Appointment appointment, Long patientId, Long doctorId);

    Appointment reAssignAppointmentToAnotherDoctor(Long appointmentId, Long newDoctorId);

    List<AppointmentDto> getAllAppointmentsOfDoctor(Long doctorId);

}
