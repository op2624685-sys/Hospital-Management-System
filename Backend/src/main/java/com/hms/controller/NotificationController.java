package com.hms.controller;

import com.hms.dto.Response.NotificationResponseDto;
import com.hms.dto.Response.UnreadCountResponseDto;
import com.hms.service.NotificationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/user/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing user alerts and system notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get My Notifications", description = "Retrieves a list of notifications for the currently authenticated user")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid notification limit") })
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(
            @Parameter(description = "Number of notifications to retrieve") @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(notificationService.getMyNotifications(size));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get Unread Count", description = "Retrieves the total count of unread notifications for the current user")
    @ApiResponse(responseCode = "200", description = "Unread notification count retrieved successfully")
    public ResponseEntity<UnreadCountResponseDto> getUnreadCount() {
        return ResponseEntity.ok(new UnreadCountResponseDto(notificationService.getMyUnreadCount()));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark Notification as Read", description = "Marks a specific notification as read")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Notification marked as read successfully"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> markAsRead(@Parameter(description = "ID of the notification") @PathVariable(name = "id") Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark All as Read", description = "Marks all notifications for the authenticated user as read")
    @ApiResponses({ @ApiResponse(responseCode = "204", description = "All notifications marked as read successfully") })
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }
}
