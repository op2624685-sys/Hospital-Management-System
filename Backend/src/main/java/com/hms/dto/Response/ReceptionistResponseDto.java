package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReceptionistResponseDto {

    private Long id;
    private String name;
    private String email;
    private BranchResponseDto branch;
    private Long departmentId;
    private String departmentName;
}
