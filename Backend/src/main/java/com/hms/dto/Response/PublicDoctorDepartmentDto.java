package com.hms.dto.Response;

import java.io.Serializable;

public record PublicDoctorDepartmentDto(
        Long id,
        String name
) implements Serializable {
}
