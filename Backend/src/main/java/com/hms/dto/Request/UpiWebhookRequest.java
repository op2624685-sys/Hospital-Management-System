package com.hms.dto.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpiWebhookRequest {
    private String orderId;
    private String status;
    private String transactionId;
    private Long amount;
}
