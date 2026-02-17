package com.hms.dto.Response;

import java.util.Set;

import com.hms.entity.type.RoleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignupResponseDto {

    private Long id;
    private String username;
    private Set<RoleType> roles;

}
