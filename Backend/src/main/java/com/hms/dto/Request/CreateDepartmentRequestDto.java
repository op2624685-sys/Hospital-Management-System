package com.hms.dto.Request;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateDepartmentRequestDto {

    @NotBlank(message = "name is required")
    private String name;

    private Long branchId;

    @NotNull(message = "headDoctorId is required")
    @Positive(message = "headDoctorId must be positive")
    private Long headDoctorId;

    private Set<Long> doctorIds;

    private String description;

    private String imageUrl;

    private String accentColor;

    private String bgColor;

    private String icon;

    private String sectionsJson;
}
