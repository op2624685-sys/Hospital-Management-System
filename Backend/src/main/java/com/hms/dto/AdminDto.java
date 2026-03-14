package com.hms.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDto implements Serializable {

    private Long id;
    private String name;
    private String email;
    private Long branchId;
}
