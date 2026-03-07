package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hms.entity.Branch;


public interface BranchRepository extends JpaRepository<Branch, Long> {
    
    Branch findByName(String name);
    java.util.Optional<Branch> findByNameIgnoreCase(String name);

    Branch findByEmail(String email);

    Branch findByContactNumber(String contactNumber);

    Branch findByAddress(String address);

    java.util.List<Branch> findTop10ByNameStartingWithIgnoreCase(String name);

    java.util.List<Branch> findByNameContainingIgnoreCase(String name);
}
