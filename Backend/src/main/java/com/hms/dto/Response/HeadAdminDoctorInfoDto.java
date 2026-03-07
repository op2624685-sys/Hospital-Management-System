package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeadAdminDoctorInfoDto {

    private Long id;
    private String name;
    private String specialization;
    private String email;
}
