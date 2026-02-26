package com.hms.dto;

import java.time.LocalDateTime;

import com.hms.entity.type.AppointmentStatusType;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDto {

    private Long id;
    private String name;
    private LocalDateTime appointmentTime;
    private String reason;
    private AppointmentStatusType status;
    private PatientDto patient;
    private DoctorDto doctor;

}
