package com.hms.dto.Request;

import java.util.Set;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddDepartmentToBranchRequestDto {

    @NotNull(message = "templateId is required")
    @Positive(message = "templateId must be positive")
    private Long templateId;

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
