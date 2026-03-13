package com.hms.dto.Response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewDto {
    private AdminStatsDto stats;
    private List<DoctorResponseDto> recentDoctors;
    private List<AdminDepartmentLoadDto> departmentLoad;
    private List<AdminWeeklyCountDto> weeklyAppointments;
}
