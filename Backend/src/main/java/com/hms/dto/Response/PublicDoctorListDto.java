package com.hms.dto.Response;

import com.hms.dto.BranchDto;
import java.io.Serializable;
import java.util.List;

public record PublicDoctorListDto(
        Long id,
        String name,
        String specialization,
        List<PublicDoctorDepartmentDto> departments,
        BranchDto branch,
        Long consultationFee,
        RatingSummaryResponse ratingSummary,
        String profilePhoto
) implements Serializable {
}
