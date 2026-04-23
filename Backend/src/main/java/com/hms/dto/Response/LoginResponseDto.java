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
    private String username;
    private String email;
    private String profilePhoto;
    private Set<RoleType> roles;
}
