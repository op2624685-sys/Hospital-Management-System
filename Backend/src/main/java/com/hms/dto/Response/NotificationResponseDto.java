package com.hms.dto.Response;

import com.hms.entity.type.NotificationType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String appointmentId;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime ttlExpiresAt;
}
