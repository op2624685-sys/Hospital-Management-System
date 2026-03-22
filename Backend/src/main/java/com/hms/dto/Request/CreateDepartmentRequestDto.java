package com.hms.dto.Request;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateDepartmentRequestDto {

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must be at most 100 characters")
    private String name;

    private Long branchId;

    @NotNull(message = "headDoctorId is required")
    @Positive(message = "headDoctorId must be positive")
    private Long headDoctorId;

    private Set<Long> doctorIds;

    @Size(max = 2000, message = "description must be at most 2000 characters")
    private String description;

    @Size(max = 2000, message = "imageUrl must be at most 2000 characters")
    private String imageUrl;

    @Size(max = 20, message = "accentColor must be at most 20 characters")
    private String accentColor;

    @Size(max = 20, message = "bgColor must be at most 20 characters")
    private String bgColor;

    @Size(max = 20, message = "icon must be at most 20 characters")
    private String icon;

    @Size(max = 10000, message = "sectionsJson must be at most 10000 characters")
    private String sectionsJson;
}
