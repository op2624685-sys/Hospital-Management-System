package com.hms.service;

import org.springframework.data.domain.Page;

import com.hms.dto.AuditLogDto;

public interface HMSAuditLogService {
    void logAction(String action, String entityName, Long entityId, String details);
    Page<AuditLogDto> getAuditLogs(int page, int size);
}
