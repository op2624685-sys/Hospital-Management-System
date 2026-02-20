package com.hms.dto.Request;

import lombok.Data;

@Data
public class OnBoardDoctorRequestDto {

    private Long userId;
    private String name;
    private String specialization;
}
