package com.hms.service.impl;

import com.hms.dto.Response.NotificationResponseDto;
import com.hms.entity.Notification;
import com.hms.entity.User;
import com.hms.entity.type.NotificationType;
import com.hms.error.NotFoundException;
import com.hms.repository.NotificationRepository;
import com.hms.repository.UserRepository;
import com.hms.service.NotificationService;
import java.time.LocalDateTime;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.hms.dto.NotificationWebSocketPayload;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private static final long NOTIFICATION_TTL_HOURS = 24;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyNotifications(int size) {
        Long userId = getAuthenticatedUserId();
        int safeSize = Math.min(Math.max(size, 1), 50);
        LocalDateTime ttlThreshold = LocalDateTime.now().minusHours(NOTIFICATION_TTL_HOURS);
        return notificationRepository.findTop50ByRecipient_IdAndCreatedAtAfterOrderByCreatedAtDesc(userId, ttlThreshold).stream()
                .limit(safeSize)
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getMyUnreadCount() {
        LocalDateTime ttlThreshold = LocalDateTime.now().minusHours(NOTIFICATION_TTL_HOURS);
        return notificationRepository.countByRecipient_IdAndIsReadFalseAndCreatedAtAfter(getAuthenticatedUserId(), ttlThreshold);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        int updated = notificationRepository.markAsRead(notificationId, getAuthenticatedUserId());
        if (updated == 0) {
            throw new NotFoundException("Notification not found");
        }
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsRead(getAuthenticatedUserId());
    }

    public void createNotificationForUser(
            Long recipientUserId,
            NotificationType type,
            String title,
            String message,
            String appointmentId) {
        Notification notification = Notification.builder()
                .recipient(userRepository.getReferenceById(recipientUserId))
                .type(type)
                .title(title)
                .message(message)
                .appointmentId(appointmentId)
                .isRead(false)
                .build();
        Notification savedNotification = notificationRepository.save(notification);
        pushNotificationWebSocket(savedNotification, recipientUserId);
    }

    private void pushNotificationWebSocket(Notification notification, Long recipientId) {
        try {
            LocalDateTime createdAt = notification.getCreatedAt() != null ? notification.getCreatedAt() : LocalDateTime.now();
            LocalDateTime ttlExpiresAt = createdAt.plusHours(NOTIFICATION_TTL_HOURS);

            NotificationWebSocketPayload payload = NotificationWebSocketPayload.builder()
                    .notificationId(notification.getId())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .type(notification.getType())
                    .appointmentId(notification.getAppointmentId())
                    .read(notification.isRead())
                    .createdAt(createdAt)
                    .ttlExpiresAt(ttlExpiresAt)
                    .unreadCount(getUnreadCountWithinTTL(recipientId))
                    .build();

            simpMessagingTemplate.convertAndSendToUser(
                    recipientId.toString(),
                    "/queue/notifications",
                    payload
            );
            log.info("Notification pushed via WebSocket to user: {}", recipientId);
        } catch (Exception e) {
            log.error("Failed to push notification via WebSocket to user: {}. Error: {}", recipientId, e.getMessage());
        }
    }

    private Long getUnreadCountWithinTTL(Long userId) {
        LocalDateTime ttlThreshold = LocalDateTime.now().minusHours(NOTIFICATION_TTL_HOURS);
        return notificationRepository.countByRecipient_IdAndIsReadFalseAndCreatedAtAfter(userId, ttlThreshold);
    }

    private NotificationResponseDto mapToDto(Notification n) {
        return NotificationResponseDto.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .appointmentId(n.getAppointmentId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .ttlExpiresAt(n.getCreatedAt().plusHours(NOTIFICATION_TTL_HOURS))
                .build();
    }

    private Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        throw new AccessDeniedException("User authentication is required");
    }
}
