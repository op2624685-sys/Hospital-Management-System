package com.hms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hms.entity.Admin;
import com.hms.entity.Branch;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    List<Admin> findByName(String name);

    List<Admin> findByBranch(Branch branch);

    List<Admin> findByBranchId(Long branch_id);

    boolean existsByEmail(String email);

    boolean existsByBranch_Id(Long branchId);
}
