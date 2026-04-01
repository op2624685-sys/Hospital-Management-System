package com.hms.dto.Response;

import com.hms.entity.type.UpiPaymentOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpiPaymentOrderStatusResponse {
    private String orderId;
    private String appointmentId;
    private UpiPaymentOrderStatus status;
    private String transactionId;
}
