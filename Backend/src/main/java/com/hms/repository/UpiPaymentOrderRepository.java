package com.hms.repository;

import com.hms.entity.UpiPaymentOrder;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UpiPaymentOrderRepository extends JpaRepository<UpiPaymentOrder, Long> {
    Optional<UpiPaymentOrder> findByOrderId(String orderId);
    Optional<UpiPaymentOrder> findByAppointmentId(String appointmentId);
}
