package com.hms.dto.Request;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateDepartmentRequestDto {

    @NotBlank(message = "name is required")
    private String name;

    @NotNull(message = "branchId is required")
    private Long branchId;

    private Long headDoctorId;

    private Set<Long> doctorIds;
}
