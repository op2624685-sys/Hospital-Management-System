package com.hms.event;

import java.time.LocalDateTime;

public record PrescriptionGenerationRequestedEvent(
        Long prescriptionId,
        String appointmentId,
        Long doctorId,
        LocalDateTime requestedAt,
        LocalDateTime requestVersion
) {
}
