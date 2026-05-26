package com.hms.dto.Response;

public record PublicDoctorListRow(
        Long id,
        String name,
        String specialization,
        Long consultationFee,
        String profilePhoto,
        Long branchId,
        String branchName,
        String branchAddress,
        String branchContactNumber,
        String branchEmail
) {
}
