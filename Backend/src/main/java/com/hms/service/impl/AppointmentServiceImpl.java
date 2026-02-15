package com.hms.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.hms.dto.AppointmentDto;
import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.service.AppointmentService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public Appointment createNewAppointment(Appointment appointment, Long patientId, Long doctorId) {
        Patient patient = patientRepository.findById(patientId).orElseThrow();
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow();

        if (appointment.getId() != null)
            throw new IllegalArgumentException("Appointment should not have ID");

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);

        patient.getAppointments().add(appointment); // Ensure bidirectional consistency

        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment reAssignAppointmentToAnotherDoctor(Long appointmentId, Long newDoctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow();
        Doctor newDoctor = doctorRepository.findById(newDoctorId).orElseThrow();

        appointment.setDoctor(newDoctor);

        newDoctor.getAppointments().add(appointment); // Ensure bidirectional consistency

        return appointmentRepository.save(appointment);
    }

    @Override
    public List<AppointmentDto> getAllAppointmentsOfDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        List<Appointment> appointments = appointmentRepository.findByDoctor(doctor);
        return appointments
                .stream()
                .map(appointment -> modelMapper.map(appointment, AppointmentDto.class))
                .toList();
    }
}
