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
public class QueueEntryDto {
    private String appointmentId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime appointmentTime;
    private Integer queueNumber;
    private LocalDate queueDate;
    private AppointmentStatusType status;
}
