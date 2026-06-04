package com.hms.event;

/**
 * Enum representing different appointment event types for Kafka messaging.
 */
public enum AppointmentEventType {
    PENDING("PENDING"),
    CONFIRMED("CONFIRMED"),
    CANCELLED("CANCELLED"),
    REFUND("REFUND"),
    RESCHEDULED("RESCHEDULED");

    private final String value;

    AppointmentEventType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AppointmentEventType fromValue(String value) {
        for (AppointmentEventType type : AppointmentEventType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid appointment event type: " + value);
    }
}
