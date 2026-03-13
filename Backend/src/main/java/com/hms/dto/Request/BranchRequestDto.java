package com.hms.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BranchRequestDto {

    @NotBlank(message = "branchName is required")
    private String branchName;

    @NotBlank(message = "branchAddress is required")
    private String branchAddress;

    @NotBlank(message = "branchContactNumber is required")
    private String branchContactNumber;

    @NotBlank(message = "branchEmail is required")
    @Email(message = "branchEmail must be valid")
    private String branchEmail;
}
