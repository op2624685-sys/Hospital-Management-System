package com.hms.repository;

import com.hms.entity.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipient_IdAndIsReadFalse(Long recipientId);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.id = :id and n.recipient.id = :recipientId")
    int markAsRead(@Param("id") Long id, @Param("recipientId") Long recipientId);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.recipient.id = :recipientId and n.isRead = false")
    int markAllAsRead(@Param("recipientId") Long recipientId);
}
