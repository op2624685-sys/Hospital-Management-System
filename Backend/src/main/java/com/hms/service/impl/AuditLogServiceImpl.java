package com.hms.service.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.dto.AuditLogDto;
import com.hms.entity.AuditLog;
import com.hms.entity.User;
import com.hms.repository.AuditLogRepository;
import com.hms.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void logAction(String action, String entityName, Long entityId, String details) {
        String performedBy = "SYSTEM";
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User user) {
                performedBy = user.getEmail(); // Fallback could be username
            }
        } catch (Exception e) {
            // Ignore if invoked outside a security context
        }

        AuditLog log = AuditLog.builder()
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .performedBy(performedBy)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();

        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size))
                .map(log -> AuditLogDto.builder()
                        .id(log.getId())
                        .action(log.getAction())
                        .entityName(log.getEntityName())
                        .entityId(log.getEntityId())
                        .performedBy(log.getPerformedBy())
                        .timestamp(log.getTimestamp())
                        .details(log.getDetails())
                        .build());
    }
}
