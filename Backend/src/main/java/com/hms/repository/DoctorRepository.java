package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import com.hms.entity.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByName(String name);

    List<Doctor> findByBranch_Id(Long branchId);

    long countByBranch_Id(Long branchId);

    List<Doctor> findByBranch_IdOrderByIdDesc(Long branchId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Doctor d where d.id = :id")
    Optional<Doctor> findByIdForUpdate(@Param("id") Long id);
}
