package com.hms.migration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

import com.hms.entity.Patient;

class PatientProfileUpdateCountMigrationTest {

    @Test
    void patientEntityShouldDefaultProfileUpdateCountToZero() {
        Patient patient = Patient.builder().build();
        assertEquals(0, patient.getProfileUpdateCount());
    }
}
