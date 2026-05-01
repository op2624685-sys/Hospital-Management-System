package com.hms.repository;

import com.hms.entity.DoctorRatingSummary;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRatingSummaryRepository extends JpaRepository<DoctorRatingSummary, Long> {
    // findById(doctorId) inherited from JpaRepository
    List<DoctorRatingSummary> findByDoctorIdIn(Collection<Long> doctorIds);
}
