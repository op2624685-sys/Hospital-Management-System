package com.hms.repository;

import com.hms.entity.DoctorRatingSummary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRatingSummaryRepository extends JpaRepository<DoctorRatingSummary, Long> {
    // findById(doctorId) inherited from JpaRepository
}
