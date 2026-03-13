package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalDoctors;
    private long totalPatients;
    private long todayAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
}
