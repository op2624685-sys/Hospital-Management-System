package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MagicLinkResponseDto {

    private boolean success;
    private String message;
    private String email;
}
