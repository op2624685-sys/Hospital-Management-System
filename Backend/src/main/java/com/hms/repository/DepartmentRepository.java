package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hms.entity.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByNameAndBranch_Id(String name, Long branchId);

    java.util.List<Department> findByBranch_Id(Long branchId);

    boolean existsByNameAndBranchIsNull(String name);

    java.util.List<Department> findByBranchIsNull();

    java.util.List<Department> findByBranchIsNotNull();
    
    boolean existsByHeadDoctor_Id(Long doctorId);

}
