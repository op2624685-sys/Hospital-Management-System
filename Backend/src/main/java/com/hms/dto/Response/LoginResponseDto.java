package com.hms.dto.Response;

import java.util.Set;
import com.hms.entity.type.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {

    private String token;
    private Long userId;
    private Set<RoleType> roles;
}
