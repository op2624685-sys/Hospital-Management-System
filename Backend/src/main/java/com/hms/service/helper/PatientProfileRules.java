package com.hms.service.helper;

import com.hms.entity.Patient;

public final class PatientProfileRules {

    private PatientProfileRules() {
    }

    public static boolean isProfileComplete(Patient patient) {
        if (patient == null) {
            return false;
        }
        return patient.getBirthDate() != null &&
                patient.getGender() != null &&
                patient.getBloodGroup() != null &&
                patient.getName() != null && !patient.getName().isBlank() &&
                patient.getEmail() != null && !patient.getEmail().isBlank();
    }
}
