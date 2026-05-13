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
    private long completedAppointments;
    private long cancelledAppointments;
    private double totalRevenue;
    private double todayRevenue;

    // Manual setters to ensure compilation if Lombok lags
    public void setCompletedAppointments(long completedAppointments) {
        this.completedAppointments = completedAppointments;
    }
    public void setCancelledAppointments(long cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }
}
