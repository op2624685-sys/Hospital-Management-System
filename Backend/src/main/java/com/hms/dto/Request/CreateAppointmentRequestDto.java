package com.hms.dto.Request;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateAppointmentRequestDto {

    private Long doctorId;
    private Long patientId;
    private LocalDateTime appointmentTime;
    private String reason;
    private Long branchId;
}
