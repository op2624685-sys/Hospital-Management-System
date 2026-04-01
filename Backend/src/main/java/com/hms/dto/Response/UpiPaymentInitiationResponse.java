package com.hms.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpiPaymentInitiationResponse {
    private String orderId;
    private String appointmentId;
    private Long amount;
    private String currency;
    private String upiVpa;
    private String payeeName;
    private String note;
    private String upiUri;
}
