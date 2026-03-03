package com.hms.dto.Request;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateInsuranceRequestDto {

    @NotBlank(message = "policyNumber is required")
    private String policyNumber;

    @NotBlank(message = "provider is required")
    private String provider;

    @NotNull(message = "validUntil is required")
    @Future(message = "validUntil must be a future date")
    private LocalDate validUntil;
}
