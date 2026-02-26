package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hms.entity.Appointment;
import com.hms.entity.Doctor;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctor(Doctor doctor);

    Optional<Appointment> findByAppointmentId(String appointmentId);
    
    //  @Query("SELECT a.doctor FROM Appointment a WHERE a.doctor.name = :doctorName")
    //     Doctor findDoctorByName(@Param("doctorName") String doctorName);
}
