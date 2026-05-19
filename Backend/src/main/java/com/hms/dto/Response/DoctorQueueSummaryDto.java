package com.hms.dto.Response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorQueueSummaryDto {
    private Long doctorId;
    private String doctorName;
    private String departmentName;
    private long waitingCount;
    private QueueEntryDto nextPatient;
    private List<QueueEntryDto> queue;
}
