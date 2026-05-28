package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hms.entity.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    boolean existsByAppointment_AppointmentId(String appointmentId);

    Optional<Prescription> findByAppointment_AppointmentId(String appointmentId);

    @EntityGraph(attributePaths = {
            "appointment",
            "appointment.doctor",
            "appointment.doctor.user",
            "appointment.patient",
            "appointment.branch",
            "appointment.department"
    })
    Optional<Prescription> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {
            "appointment",
            "appointment.doctor",
            "appointment.doctor.user",
            "appointment.patient",
            "appointment.branch",
            "appointment.department"
    })
    Optional<Prescription> findWithDetailsByAppointment_AppointmentId(String appointmentId);
}
