package com.hms.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.hms.entity.Appointment;
import com.hms.entity.Doctor;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctor(Doctor doctor);

    Page<Appointment> findByBranch_IdOrderByAppointmentTimeDesc(Long branchId, Pageable pageable);

    Optional<Appointment> findByAppointmentId(String appointmentId);

    long countByBranch_Id(Long branchId);

    long countByBranch_IdAndStatus(Long branchId, com.hms.entity.type.AppointmentStatusType status);

    long countByBranch_IdAndAppointmentTimeBetween(Long branchId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByBranch_IdAndAppointmentTimeBetween(Long branchId, LocalDateTime start, LocalDateTime end);

    boolean existsByDoctorAndAppointmentTimeBetweenAndStatusNot(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end,
            com.hms.entity.type.AppointmentStatusType status);

    boolean existsByDoctorAndAppointmentTimeBetweenAndStatusNotAndAppointmentIdNot(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end,
            com.hms.entity.type.AppointmentStatusType status,
            String appointmentId);

    List<Appointment> findByDoctorAndAppointmentTimeBetweenAndStatusNot(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end,
            com.hms.entity.type.AppointmentStatusType status);
    
    //  @Query("SELECT a.doctor FROM Appointment a WHERE a.doctor.name = :doctorName")
    //     Doctor findDoctorByName(@Param("doctorName") String doctorName);
}
