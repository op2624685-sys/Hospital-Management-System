package com.hms.dto.Response;

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
    private String departmentName;
}
