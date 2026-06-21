package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import com.hms.entity.Receptionist;

public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {

    @EntityGraph(attributePaths = {"branch", "department", "user"})
    @NonNull
    Optional<Receptionist> findById(Long id);

    @EntityGraph(attributePaths = {"branch", "department", "user"})
    Optional<Receptionist> findByDepartment_Id(Long departmentId);

    boolean existsByDepartment_Id(Long departmentId);
}
