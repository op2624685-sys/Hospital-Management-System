package com.hms.dto.Request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentRequestDto {

    private LocalDateTime appointmentTime;

    @Size(max = 500, message = "reason must be at most 500 characters")
    private String reason;
}
