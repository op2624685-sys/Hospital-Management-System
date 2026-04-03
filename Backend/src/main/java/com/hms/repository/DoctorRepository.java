package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("""
            SELECT d FROM Doctor d
            WHERE d.branch.id = :branchId
              AND (:search = '' OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:specialization = '' OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%')))
            """)
    Page<Doctor> findBranchDoctors(
            @Param("branchId") Long branchId,
            @Param("search") String search,
            @Param("specialization") String specialization,
            Pageable pageable);

    @Query("""
            SELECT d FROM Doctor d
            WHERE (:search IS NULL OR :search = '' OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Doctor> findAllSearch(@Param("search") String search, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Doctor d where d.id = :id")
    Optional<Doctor> findByIdForUpdate(@Param("id") Long id);
}
