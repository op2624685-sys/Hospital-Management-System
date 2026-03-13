package com.hms.dto.Request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateAppointmentRequestDto {

    @NotNull(message = "doctorId is required")
    @Positive(message = "doctorId must be positive")
    private Long doctorId;

    @NotNull(message = "patientId is required")
    @Positive(message = "patientId must be positive")
    private Long patientId;

    @NotNull(message = "appointmentTime is required")
    private LocalDateTime appointmentTime;

    @NotBlank(message = "reason is required")
    @Size(max = 500, message = "reason must be at most 500 characters")
    private String reason;

    @Positive(message = "branchId must be positive")
    private Long branchId;
}
