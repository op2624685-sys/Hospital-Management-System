package com.hms.dto;

import java.time.LocalDate;

import com.hms.entity.Patient;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InsuranceDto {

    private Long id;
    private String policyNumber;
    private String provider;
    private LocalDate validUntil;
    private Patient patient;
}
