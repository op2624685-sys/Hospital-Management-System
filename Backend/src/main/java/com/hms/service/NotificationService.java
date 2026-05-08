package com.hms.service;

import com.hms.dto.Response.NotificationResponseDto;
import java.util.List;

public interface NotificationService {
    List<NotificationResponseDto> getMyNotifications(int size);

    long getMyUnreadCount();

    void markAsRead(Long notificationId);

    void markAllAsRead();
}
