package com.hms.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hms.dto.AuditLogDto;
import com.hms.service.HMSAuditLogService;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Secure endpoints for tracking system activities and user actions (Head Admin only)")
public class AuditLogController {

    private final HMSAuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('HEADADMIN')")
    @Operation(summary = "View System Audit Logs", description = "Retrieves a paginated history of all system activities, security events, and administrative changes")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully"), @ApiResponse(responseCode = "400", description = "Invalid pagination parameters"), @ApiResponse(responseCode = "403", description = "Head administrator access required") })
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            @Parameter(description = "Page index to retrieve") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of records per page") @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(page, size));
    }
}
