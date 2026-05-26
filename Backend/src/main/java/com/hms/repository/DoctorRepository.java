package com.hms.repository;

import java.util.List;
import java.util.Optional;

import com.hms.dto.Response.PublicDoctorDepartmentRow;
import com.hms.dto.Response.PublicDoctorListRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;

import com.hms.entity.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByName(String name);

    List<Doctor> findByBranch_Id(Long branchId);

    long countByBranch_Id(Long branchId);

    List<Doctor> findByBranch_IdOrderByIdDesc(Long branchId, org.springframework.data.domain.Pageable pageable);

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

    @Query(
            value = """
                    SELECT DISTINCT d FROM Doctor d
                    LEFT JOIN d.departments dept
                    WHERE (:search IS NULL OR :search = '' OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))
                       OR (:search IS NULL OR :search = '' OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%')))
                       OR (:search IS NULL OR :search = '' OR LOWER(dept.name) LIKE LOWER(CONCAT('%', :search, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT d) FROM Doctor d
                    LEFT JOIN d.departments dept
                    WHERE (:search IS NULL OR :search = '' OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))
                       OR (:search IS NULL OR :search = '' OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%')))
                       OR (:search IS NULL OR :search = '' OR LOWER(dept.name) LIKE LOWER(CONCAT('%', :search, '%')))
                    """
    )
    Page<Doctor> findAllSearch(@Param("search") String search, Pageable pageable);

    @Query("""
            SELECT new com.hms.dto.Response.PublicDoctorListRow(
                d.id,
                d.name,
                d.specialization,
                d.consultationFee,
                u.profilePhoto,
                b.id,
                b.name,
                b.address,
                b.contactNumber,
                b.email
            )
            FROM Doctor d
            LEFT JOIN d.user u
            LEFT JOIN d.branch b
            """)
    Page<PublicDoctorListRow> findPublicDoctorListRows(Pageable pageable);

    @Query(
            value = """
                    SELECT new com.hms.dto.Response.PublicDoctorListRow(
                        d.id,
                        d.name,
                        d.specialization,
                        d.consultationFee,
                        u.profilePhoto,
                        b.id,
                        b.name,
                        b.address,
                        b.contactNumber,
                        b.email
                    )
                    FROM Doctor d
                    LEFT JOIN d.user u
                    LEFT JOIN d.branch b
                    WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))
                       OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%'))
                       OR EXISTS (
                            SELECT 1
                            FROM d.departments dept
                            WHERE LOWER(dept.name) LIKE LOWER(CONCAT('%', :search, '%'))
                        )
                    """,
            countQuery = """
                    SELECT COUNT(d)
                    FROM Doctor d
                    WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))
                       OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%'))
                       OR EXISTS (
                            SELECT 1
                            FROM d.departments dept
                            WHERE LOWER(dept.name) LIKE LOWER(CONCAT('%', :search, '%'))
                        )
                    """
    )
    Page<PublicDoctorListRow> searchPublicDoctorListRows(@Param("search") String search, Pageable pageable);

    @Query("""
            SELECT new com.hms.dto.Response.PublicDoctorDepartmentRow(
                doc.id,
                dept.id,
                dept.name
            )
            FROM Doctor doc
            JOIN doc.departments dept
            WHERE doc.id IN :doctorIds
            ORDER BY doc.id ASC, dept.name ASC
            """)
    List<PublicDoctorDepartmentRow> findPublicDoctorDepartmentsByDoctorIds(@Param("doctorIds") List<Long> doctorIds);

    @Query("SELECT d.id FROM Doctor d WHERE d.branch.id = :branchId")
    List<Long> findBranchDoctorIds(@Param("branchId") Long branchId, Pageable pageable);

    @EntityGraph(attributePaths = {"departments", "headedDepartments", "branch", "user"})
    List<Doctor> findAllByIdIn(List<Long> ids);

    @Query(value = """
        SELECT d.user_id, d.name, d.specialization, u.profile_photo 
        FROM doctor d 
        JOIN app_user u ON d.user_id = u.id 
        WHERE d.branch_id = :branchId 
        ORDER BY d.user_id DESC LIMIT 5
        """, nativeQuery = true)
    List<Object[]> findRecentDoctorsNative(@Param("branchId") Long branchId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Doctor d where d.id = :id")
    Optional<Doctor> findByIdForUpdate(@Param("id") Long id);
}
