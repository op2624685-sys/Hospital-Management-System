package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hms.entity.Insurance;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    
}
