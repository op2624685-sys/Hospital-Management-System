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
public class SignupCompletionResponseDto {

    private String token;
    private Long userId;
    private String username;
    private String email;
    private Set<RoleType> roles;
}
