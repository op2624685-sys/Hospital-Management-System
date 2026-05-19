package com.hms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.Receptionist;

public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {

    @EntityGraph(attributePaths = {"branch", "department", "user"})
    Optional<Receptionist> findById(Long id);

    boolean existsByDepartment_Id(Long departmentId);
}
