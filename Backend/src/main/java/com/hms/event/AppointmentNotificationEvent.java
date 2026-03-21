package com.hms.event;

public class AppointmentNotificationEvent {
    private final String appointmentId;
    private final AppointmentNotificationType type;
    private final String changeSummary;

    public AppointmentNotificationEvent(String appointmentId, AppointmentNotificationType type, String changeSummary) {
        this.appointmentId = appointmentId;
        this.type = type;
        this.changeSummary = changeSummary;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public AppointmentNotificationType getType() {
        return type;
    }

    public String getChangeSummary() {
        return changeSummary;
    }
}
