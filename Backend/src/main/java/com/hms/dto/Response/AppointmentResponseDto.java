package com.hms.dto.Response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.hms.entity.type.AppointmentStatusType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentResponseDto {
    
    private String appointmentId;
    private LocalDateTime appointmentTime;
    private String reason;
    private Long amount;
    private DoctorResponseDto doctor;
    private AppointmentStatusType status;
    private PatientResponseDto patient;
    private BranchResponseDto branch;
    private Long departmentId;
    private String departmentName;
    private Integer queueNumber;
    private LocalDate queueDate;
    private LocalDateTime confirmedAt;
    private LocalDateTime visitedAt;
    private LocalDateTime queuedAt;
    private LocalDateTime inProgressAt;
    private LocalDateTime completedAt;
    private LocalDateTime noShowAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime refundedAt;
}
