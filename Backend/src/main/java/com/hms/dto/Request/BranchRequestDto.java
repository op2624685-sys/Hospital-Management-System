package com.hms.dto.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BranchRequestDto {

    private String branchName;
    private String branchAddress;
    private String branchContactNumber;
    private String branchEmail;
}
