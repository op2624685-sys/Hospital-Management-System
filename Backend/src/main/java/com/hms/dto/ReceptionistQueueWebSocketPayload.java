package com.hms.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.hms.dto.Response.AppointmentResponseDto;
import com.hms.dto.Response.DoctorQueueSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReceptionistQueueWebSocketPayload {
    private Long branchId;
    private Long departmentId;
    private String departmentName;
    private LocalDate queueDate;
    private LocalDateTime updatedAt;
    private List<DoctorQueueSummaryDto> queue;
    private AppointmentResponseDto updatedAppointment;
}
