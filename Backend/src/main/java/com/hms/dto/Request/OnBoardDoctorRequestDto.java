package com.hms.dto.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OnBoardDoctorRequestDto {

    private Long userId;
    private String name;
    private String specialization;
    private String email;
}
