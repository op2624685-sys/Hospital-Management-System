package com.hms.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BranchDto implements Serializable {

    private Long id;
    private String name;
    private String address;
    private String contactNumber;
    private String email;
    private AdminDto admin;
}
