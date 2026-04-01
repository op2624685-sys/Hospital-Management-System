package com.hms.entity.type;

import java.util.Locale;

public enum PaymentMethodType {
    CREDIT_CARD,
    DEBIT_CARD,
    UPI;

    public static PaymentMethodType fromMetadataValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        try {
            return PaymentMethodType.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
