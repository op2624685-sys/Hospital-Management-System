package com.hms.dto.Request;

import com.hms.entity.type.GenderType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequestDto {

    private String username;
    private String password;
    private String name;
    private GenderType gender;
    private String email;
}
