package com.hms.service;

import com.hms.entity.Appointment;

public interface AppointmentService{

    Appointment createNewAppointment(Appointment appointment, Long patientId, Long doctorId);

    Appointment reAssignAppointmentToAnotherDoctor(Long appointmentId, Long newDoctorId);

}
