package com.hms.dto.Response;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BranchResponseDto implements Serializable {

    private Long id;
    private String name;
    private String address;
    private String email;
    private String contactNumber;
}
