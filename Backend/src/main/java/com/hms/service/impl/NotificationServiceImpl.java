package com.hms.service.impl;

import com.hms.dto.Response.NotificationResponseDto;
import com.hms.entity.Notification;
import com.hms.entity.User;
import com.hms.entity.type.NotificationType;
import com.hms.error.NotFoundException;
import com.hms.repository.NotificationRepository;
import com.hms.repository.UserRepository;
import com.hms.service.NotificationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyNotifications(int size) {
        Long userId = getAuthenticatedUserId();
        int safeSize = Math.min(Math.max(size, 1), 50);
        return notificationRepository.findTop50ByRecipient_IdOrderByCreatedAtDesc(userId).stream()
                .limit(safeSize)
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getMyUnreadCount() {
        return notificationRepository.countByRecipient_IdAndIsReadFalse(getAuthenticatedUserId());
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
        notificationRepository.save(notification);
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
