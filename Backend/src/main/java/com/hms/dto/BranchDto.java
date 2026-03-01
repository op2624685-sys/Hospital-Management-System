package com.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BranchDto {

    private Long id;
    private String name;
    private String address;
    private String contactNumber;
    private String email;
    private AdminDto admin;
}
