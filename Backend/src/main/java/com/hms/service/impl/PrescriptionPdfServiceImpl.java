package com.hms.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.dto.PrescriptionMedicineDto;
import com.hms.entity.Appointment;
import com.hms.entity.Branch;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.Prescription;
import com.hms.error.ValidationException;
import com.hms.service.PrescriptionPdfService;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionPdfServiceImpl implements PrescriptionPdfService {

    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private final ObjectMapper objectMapper;

    @Override
    public byte[] generate(Prescription prescription) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 32, 32);
            PdfWriter.getInstance(document, out);
            document.open();

            Appointment appointment = prescription.getAppointment();
            Doctor doctor = appointment.getDoctor();
            Patient patient = appointment.getPatient();
            Branch branch = appointment.getBranch();

            addHeader(document, branch, appointment);
            addPeopleBlock(document, appointment, doctor, patient);
            addSection(document, "Diagnosis", prescription.getDiagnosis());
            addSection(document, "Vitals", prescription.getVitals());
            addSection(document, "Clinical Notes", prescription.getClinicalNotes());
            addMedicines(document, parseMedicines(prescription.getMedicinesJson()));
            addSection(document, "Recommended Tests", prescription.getRecommendedTests());
            addSection(document, "Advice", prescription.getAdvice());
            String followUp = prescription.getFollowUpDate() != null
                    ? DATE_FORMAT.format(prescription.getFollowUpDate())
                    : "";
            if (prescription.getFollowUpNotes() != null && !prescription.getFollowUpNotes().isBlank()) {
                followUp = (followUp.isBlank() ? "" : followUp + "\n") + prescription.getFollowUpNotes();
            }
            addSection(document, "Follow Up", followUp);
            addStamp(document, doctor);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new ValidationException("Failed to generate prescription PDF: " + e.getMessage());
        }
    }

    private void addHeader(Document document, Branch branch, Appointment appointment) throws Exception {
        Font title = new Font(Font.HELVETICA, 20, Font.BOLD);
        Font meta = new Font(Font.HELVETICA, 10);
        Paragraph hospital = new Paragraph(branch != null ? branch.getName() : "Hospital Branch", title);
        hospital.setAlignment(Element.ALIGN_CENTER);
        document.add(hospital);
        if (branch != null) {
            Paragraph branchMeta = new Paragraph(
                    safe(branch.getAddress()) + "\n" + safe(branch.getContactNumber()) + " | " + safe(branch.getEmail()),
                    meta);
            branchMeta.setAlignment(Element.ALIGN_CENTER);
            document.add(branchMeta);
        }
        Paragraph heading = new Paragraph("Medical Prescription", new Font(Font.HELVETICA, 15, Font.BOLD));
        heading.setSpacingBefore(14);
        heading.setAlignment(Element.ALIGN_CENTER);
        document.add(heading);
        document.add(new Paragraph("Appointment: " + appointment.getAppointmentId()
                + " | " + DATE_TIME_FORMAT.format(appointment.getAppointmentTime()), meta));
    }

    private void addPeopleBlock(Document document, Appointment appointment, Doctor doctor, Patient patient) throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(14);
        table.addCell(cell("Doctor\nDr. " + safe(doctor.getName()) + "\n" + safe(doctor.getSpecialization())
                + "\n" + safe(doctor.getEmail())));
        table.addCell(cell("Patient\n" + safe(patient.getName())
                + "\nDOB: " + (patient.getBirthDate() != null ? patient.getBirthDate() : "-")
                + "\nGender: " + (patient.getGender() != null ? patient.getGender() : "-")
                + "\nBlood Group: " + (patient.getBloodGroup() != null ? patient.getBloodGroup() : "-")
                + "\n" + safe(patient.getEmail())));
        table.addCell(cell("Department\n" + (appointment.getDepartment() != null ? appointment.getDepartment().getName() : "-")));
        table.addCell(cell("Reason For Visit\n" + safe(appointment.getReason())));
        document.add(table);
    }

    private void addSection(Document document, String label, String value) throws Exception {
        if (value == null || value.isBlank()) {
            return;
        }
        Paragraph title = new Paragraph(label, new Font(Font.HELVETICA, 12, Font.BOLD));
        title.setSpacingBefore(12);
        document.add(title);
        document.add(new Paragraph(value, new Font(Font.HELVETICA, 10)));
    }

    private void addMedicines(Document document, List<PrescriptionMedicineDto> medicines) throws Exception {
        if (medicines == null || medicines.isEmpty()) {
            return;
        }
        Paragraph title = new Paragraph("Medicines", new Font(Font.HELVETICA, 12, Font.BOLD));
        title.setSpacingBefore(12);
        document.add(title);
        PdfPTable table = new PdfPTable(new float[]{3, 2, 2, 2, 3});
        table.setWidthPercentage(100);
        table.addCell(headerCell("Medicine"));
        table.addCell(headerCell("Dosage"));
        table.addCell(headerCell("Frequency"));
        table.addCell(headerCell("Duration"));
        table.addCell(headerCell("Instructions"));
        for (PrescriptionMedicineDto medicine : medicines) {
            table.addCell(cell(safe(medicine.getMedicineName())));
            table.addCell(cell(safe(medicine.getDosage())));
            table.addCell(cell(safe(medicine.getFrequency())));
            table.addCell(cell(safe(medicine.getDuration())));
            table.addCell(cell(safe(medicine.getInstructions())));
        }
        document.add(table);
    }

    private void addStamp(Document document, Doctor doctor) throws Exception {
        Paragraph signature = new Paragraph("Doctor Stamp", new Font(Font.HELVETICA, 11, Font.BOLD));
        signature.setSpacingBefore(24);
        signature.setAlignment(Element.ALIGN_RIGHT);
        document.add(signature);
        try {
            Image stamp = Image.getInstance(new URL(doctor.getDoctorStampUrl()));
            stamp.scaleToFit(150, 90);
            stamp.setAlignment(Element.ALIGN_RIGHT);
            document.add(stamp);
        } catch (MalformedURLException e) {
            throw new ValidationException("Invalid doctor stamp URL" + doctor.getDoctorStampUrl());
        } catch (IOException e) {
            throw new ValidationException("Failed to read doctor stamp image" + doctor.getDoctorStampUrl());
        }
        Paragraph name = new Paragraph("Dr. " + safe(doctor.getName()), new Font(Font.HELVETICA, 10, Font.BOLD));
        name.setAlignment(Element.ALIGN_RIGHT);
        document.add(name);
    }

    private List<PrescriptionMedicineDto> parseMedicines(String medicinesJson) throws Exception {
        if (medicinesJson == null || medicinesJson.isBlank()) {
            return List.of();
        }
        return objectMapper.readValue(medicinesJson, new TypeReference<List<PrescriptionMedicineDto>>() {});
    }

    private PdfPCell headerCell(String value) {
        PdfPCell cell = cell(value);
        cell.setPhrase(new Phrase(value, new Font(Font.HELVETICA, 10, Font.BOLD)));
        return cell;
    }

    private PdfPCell cell(String value) {
        PdfPCell cell = new PdfPCell(new Phrase(value == null ? "" : value, new Font(Font.HELVETICA, 10)));
        cell.setPadding(7);
        cell.setBorder(Rectangle.BOX);
        return cell;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
