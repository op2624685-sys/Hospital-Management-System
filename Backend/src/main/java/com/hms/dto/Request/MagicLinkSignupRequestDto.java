package com.hms.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MagicLinkSignupRequestDto {

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;
}
