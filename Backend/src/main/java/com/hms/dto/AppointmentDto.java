package com.hms.dto;

import java.time.LocalDateTime;

import com.hms.entity.AppointmentStatus;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDto {

    private Long id;
    private LocalDateTime appointmentTime;
    private String reason;
    private AppointmentStatus status;
    private PatientDto patient;
    private DoctorDto doctor;

}
