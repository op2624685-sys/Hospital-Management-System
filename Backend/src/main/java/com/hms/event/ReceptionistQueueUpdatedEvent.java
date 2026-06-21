package com.hms.event;

import java.time.LocalDate;

public class ReceptionistQueueUpdatedEvent {
    private final String appointmentId;
    private final Long departmentId;
    private final Long branchId;
    private final LocalDate queueDate;

    public ReceptionistQueueUpdatedEvent(String appointmentId, Long departmentId, Long branchId, LocalDate queueDate) {
        this.appointmentId = appointmentId;
        this.departmentId = departmentId;
        this.branchId = branchId;
        this.queueDate = queueDate;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public Long getBranchId() {
        return branchId;
    }

    public LocalDate getQueueDate() {
        return queueDate;
    }
}
