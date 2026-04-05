package com.hms.dto.Response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileCompletionStatusDto {
    
    private boolean isComplete;
    
    private List<String> missingFields;
}
