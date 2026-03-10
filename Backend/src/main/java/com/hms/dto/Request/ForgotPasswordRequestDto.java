package com.hms.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequestDto {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
}
