package com.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hms.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentIntentId(String paymentIntentId);
    List<Payment> findByStatus(String status);

    List<Payment> findByAppointment_Branch_Id(Long branchId);

    @Query("SELECT p FROM Payment p WHERE p.appointment.branch.id = :branchId AND p.createdAt >= :startDate")
    List<Payment> getRecentPayments(@Param("branchId") Long branchId, @Param("startDate") java.time.LocalDateTime startDate);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.appointment.branch.id = :branchId")
    Double sumRevenueByBranch(@Param("branchId") Long branchId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.appointment.branch.id = :branchId AND p.createdAt BETWEEN :start AND :end")
    Double sumRevenueByBranchAndDate(@Param("branchId") Long branchId, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT FUNCTION('date_trunc', 'month', p.createdAt), SUM(p.amount) FROM Payment p " +
           "WHERE p.appointment.branch.id = :branchId AND p.createdAt >= :startDate " +
           "GROUP BY FUNCTION('date_trunc', 'month', p.createdAt) ORDER BY FUNCTION('date_trunc', 'month', p.createdAt)")
    List<Object[]> getMonthlyRevenue(@Param("branchId") Long branchId, @Param("startDate") java.time.LocalDateTime startDate);
}
