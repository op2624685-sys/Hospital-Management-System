package com.hms.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;

import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.type.AppointmentStatusType;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctor(Doctor doctor);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient", "branch", "department"})
    Page<Appointment> findByDoctor_IdOrderByAppointmentTimeDesc(Long doctorId, Pageable pageable);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient", "branch", "department"})
    Page<Appointment> findByPatient_IdOrderByAppointmentTimeDesc(Long patientId, Pageable pageable);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient", "branch", "department"})
    Page<Appointment> findByBranch_IdOrderByAppointmentTimeDesc(Long branchId, Pageable pageable);

    Optional<Appointment> findByAppointmentId(String appointmentId);

    @Query("""
            SELECT a FROM Appointment a
            LEFT JOIN FETCH a.patient p
            LEFT JOIN FETCH a.doctor d
            LEFT JOIN FETCH a.branch b
            WHERE a.appointmentId = :appointmentId
            """)
    Optional<Appointment> findByAppointmentIdWithDetails(@Param("appointmentId") String appointmentId);

    long countByBranch_Id(Long branchId);

    long countByBranch_IdAndStatus(Long branchId, AppointmentStatusType status);

    long countByBranch_IdAndAppointmentTimeBetween(Long branchId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT new com.hms.dto.Response.AdminDepartmentLoadDto(d.name, CAST(COUNT(a) AS int)) " +

           "FROM Appointment a JOIN a.department d WHERE a.branch.id = :branchId GROUP BY d.id, d.name")
    List<com.hms.dto.Response.AdminDepartmentLoadDto> getDepartmentLoad(@Param("branchId") Long branchId);

    List<Appointment> findByBranch_IdAndAppointmentTimeBetween(Long branchId, LocalDateTime start, LocalDateTime end);



    boolean existsByDoctorAndAppointmentTimeBetweenAndStatusNot(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end,
            AppointmentStatusType status);

    boolean existsByDoctorAndAppointmentTimeBetweenAndStatusNotAndAppointmentIdNot(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end,
            AppointmentStatusType status,
            String appointmentId);

    List<Appointment> findByDoctorAndAppointmentTimeBetweenAndStatusNot(
            Doctor doctor,
            LocalDateTime start,
            LocalDateTime end,
            AppointmentStatusType status);
    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.branch.id = :branchId GROUP BY a.status")
    List<Object[]> countStatusByBranch(@Param("branchId") Long branchId);

    @Query("SELECT CAST(a.appointmentTime AS date), COUNT(a) FROM Appointment a " +
           "WHERE a.branch.id = :branchId AND a.appointmentTime >= :startDate " +
           "GROUP BY CAST(a.appointmentTime AS date) ORDER BY CAST(a.appointmentTime AS date)")
    List<Object[]> getWeeklyCount(@Param("branchId") Long branchId, @Param("startDate") java.time.LocalDateTime startDate);
}
