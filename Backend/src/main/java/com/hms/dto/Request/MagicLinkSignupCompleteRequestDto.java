package com.hms.dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MagicLinkSignupCompleteRequestDto {

    @NotBlank(message = "Signup token is required")
    private String token;

    private String username;

    private String password;
}
