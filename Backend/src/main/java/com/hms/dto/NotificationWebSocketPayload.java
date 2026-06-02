package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import com.hms.entity.type.NotificationType;

/**
 * Payload sent via WebSocket to notify users about new notifications
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationWebSocketPayload {
    
    private Long notificationId;
    private String title;
    private String message;
    private NotificationType type;
    private String appointmentId;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime ttlExpiresAt;  // Timestamp when notification expires from UI (24h from creation)
    private Long unreadCount;  // Total unread notifications within TTL
}
