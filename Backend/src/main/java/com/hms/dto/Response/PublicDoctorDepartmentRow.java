package com.hms.dto.Response;

public record PublicDoctorDepartmentRow(
        Long doctorId,
        Long departmentId,
        String departmentName
) {
}
