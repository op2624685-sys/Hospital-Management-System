package com.hms.service;

import com.hms.entity.Prescription;

public interface PrescriptionPdfService {
    byte[] generate(Prescription prescription);
}
