package com.hms.dto.Request;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckAppointmentRequestDto {
    
    @NotBlank(message = "appointmentId is required")
    private String appointmentId;
}
