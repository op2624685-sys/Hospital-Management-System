package com.hms.dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequestDto {
    
    @NotBlank(message = "Username is required")
    private String username;
}
