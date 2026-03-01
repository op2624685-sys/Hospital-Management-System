package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.Branch;


public interface BranchRepository extends JpaRepository<Branch, Long> {
    
    Branch findByName(String name);

    Branch findByEmail(String email);

    Branch findByContactNumber(String contactNumber);

    Branch findByAddress(String address);
}
