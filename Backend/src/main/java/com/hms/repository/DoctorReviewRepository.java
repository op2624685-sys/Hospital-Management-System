package com.hms.repository;

import com.hms.entity.DoctorReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorReviewRepository extends JpaRepository<DoctorReview, Long> {

    /** Paginated reviews for a given doctor — newest first. */
    Page<DoctorReview> findByDoctorIdOrderByCreatedAtDesc(Long doctorId, Pageable pageable);

    /** Find existing review by the same patient for the same doctor (upsert check). */
    Optional<DoctorReview> findByPatientIdAndDoctorId(Long patientId, Long doctorId);

    /** Quick eligibility check — patient must have at least one COMPLETED appointment with the doctor. */
    @Query("""
        SELECT COUNT(a) > 0
        FROM Appointment a
        WHERE a.patient.id = :patientId
          AND a.doctor.id  = :doctorId
          AND a.status     = 'COMPLETED'
        """)
    boolean hasCompletedAppointment(@Param("patientId") Long patientId, @Param("doctorId") Long doctorId);

    /** Aggregate for the consumer: [COUNT(*), SUM(rating)] for a doctor. */
    @Query("""
        SELECT COUNT(r), SUM(r.rating)
        FROM DoctorReview r
        WHERE r.doctor.id = :doctorId
        """)
    List<Object[]> aggregateForDoctor(@Param("doctorId") Long doctorId);
}
