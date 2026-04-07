package com.hms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    @org.springframework.data.jpa.repository.Query("SELECT d FROM Department d WHERE d.headDoctor.id = :doctorId AND d.branch IS NOT NULL")
    java.util.List<Department> findHeadedDepartments(@org.springframework.data.repository.query.Param("doctorId") Long doctorId);

    @Query(
        value = "SELECT EXISTS (" +
                "SELECT 1 FROM department_patient dp " +
                "WHERE dp.department_id = :departmentId AND dp.patient_id = :patientId" +
                ")",
        nativeQuery = true
    )
    boolean existsDepartmentPatientLink(@Param("departmentId") Long departmentId, @Param("patientId") Long patientId);

    @Modifying
    @Query(
        value = "INSERT INTO department_patient (department_id, patient_id) VALUES (:departmentId, :patientId)",
        nativeQuery = true
    )
    void insertDepartmentPatientLink(@Param("departmentId") Long departmentId, @Param("patientId") Long patientId);
}
