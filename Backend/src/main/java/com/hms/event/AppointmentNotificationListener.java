package com.hms.event;

import com.hms.entity.Appointment;
import com.hms.entity.Doctor;
import com.hms.entity.Patient;
import com.hms.entity.type.AppointmentStatusType;
import com.hms.repository.AppointmentRepository;
import com.hms.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentNotificationListener {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    @Value("${app.appointment-details-base-url}")
    private String appointmentDetailsBaseUrl;

    @Async("emailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAppointmentNotification(AppointmentNotificationEvent event) {
        Appointment appointment = appointmentRepository.findByAppointmentIdWithDetails(event.getAppointmentId()).orElse(null);
        if (appointment == null) {
            log.warn("Appointment not found for notification event: {}", event.getAppointmentId());
            return;
        }

        switch (event.getType()) {
            case CREATED -> sendAppointmentCreatedEmails(appointment);
            case STATUS_CHANGED -> sendAppointmentStatusNotification(appointment);
            case UPDATED -> sendAppointmentUpdatedEmails(appointment, event.getChangeSummary());
            case CANCELLED -> sendPatientCancelledEmails(appointment);
            default -> log.warn("Unhandled appointment notification type: {}", event.getType());
        }
    }

    private void sendAppointmentCreatedEmails(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        if (StringUtils.hasText(patient.getEmail())) {
            sendSafely(
                    patient.getEmail(),
                    "Appointment Booked Successfully",
                    String.format(
                            "Hello %s,%n%nYour appointment has been booked successfully.%nAppointment ID: %s%nDoctor: Dr. %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nThank you.",
                            patient.getName(),
                            appointment.getAppointmentId(),
                            doctor.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            sendSafely(
                    doctor.getEmail(),
                    "New Appointment Booked",
                    String.format(
                            "Hello Dr. %s,%n%nA new appointment has been booked.%nAppointment ID: %s%nPatient: %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nPlease review in HMS.",
                            doctor.getName(),
                            appointment.getAppointmentId(),
                            patient.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }
    }

    private void sendAppointmentStatusNotification(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();
        AppointmentStatusType status = appointment.getStatus();

        if (StringUtils.hasText(patient.getEmail())) {
            String subject = "Appointment Status Update: " + status;
            String message;

            switch (status) {
                case CONFIRMED -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s has been CONFIRMED.%n%nDetails:%nTime: %s%nReason: %s%nLink: %s%n%nPlease arrive 10 minutes before your scheduled time.",
                        patient.getName(), doctor.getName(), appointment.getAppointmentTime(), appointment.getReason(), getAppointmentLink(appointment));
                case REJECTED -> message = String.format(
                        "Hello %s,%n%nWe regret to inform you that your appointment with Dr. %s has been REJECTED.%n%nDetails:%nTime: %s%nReason: %s%n%nPlease contact the hospital or book another slot if needed.",
                        patient.getName(), doctor.getName(), appointment.getAppointmentTime(), appointment.getReason());
                case IN_PROGRESS -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s is now IN PROGRESS.%n%nLink: %s",
                        patient.getName(), doctor.getName(), getAppointmentLink(appointment));
                case COMPLETED -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s has been COMPLETED.%n%nWe hope you had a satisfactory experience. You can view your appointment details here: %s",
                        patient.getName(), doctor.getName(), getAppointmentLink(appointment));
                case CANCELLED -> message = String.format(
                        "Hello %s,%n%nYour appointment with Dr. %s has been CANCELLED.%n%nDetails:%nTime: %s",
                        patient.getName(), doctor.getName(), appointment.getAppointmentTime());
                default -> message = String.format(
                        "Hello %s,%n%nThe status of your appointment with Dr. %s has been updated to: %s.%n%nLink: %s",
                        patient.getName(), doctor.getName(), status, getAppointmentLink(appointment));
            }

            sendSafely(patient.getEmail(), subject, message + "\n\nThank you,\n" + appointment.getBranch().getName());
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            sendSafely(
                    doctor.getEmail(),
                    "Appointment Status Updated",
                    String.format(
                            "Hello Dr. %s,%n%nThe status of appointment %s (Patient: %s) has been changed to %s.%nLink: %s",
                            doctor.getName(),
                            appointment.getAppointmentId(),
                            patient.getName(),
                            status,
                            getAppointmentLink(appointment)));
        }
    }

    private void sendAppointmentUpdatedEmails(Appointment appointment, String changeSummary) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        if (StringUtils.hasText(patient.getEmail())) {
            sendSafely(
                    patient.getEmail(),
                    "Appointment Updated",
                    String.format(
                            "Hello %s,%n%nYour appointment has been updated.%nChange: %s%nAppointment ID: %s%nDoctor: Dr. %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nThank you.",
                            patient.getName(),
                            changeSummary,
                            appointment.getAppointmentId(),
                            doctor.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            sendSafely(
                    doctor.getEmail(),
                    "Appointment Updated",
                    String.format(
                            "Hello Dr. %s,%n%nAn appointment has been updated.%nChange: %s%nAppointment ID: %s%nPatient: %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nPlease review in HMS.",
                            doctor.getName(),
                            changeSummary,
                            appointment.getAppointmentId(),
                            patient.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }
    }

    private void sendPatientCancelledEmails(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        if (StringUtils.hasText(patient.getEmail())) {
            sendSafely(
                    patient.getEmail(),
                    "Appointment Cancelled",
                    String.format(
                            "Hello %s,%n%nYour appointment has been cancelled.%nAppointment ID: %s%nDoctor: Dr. %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nThank you.",
                            patient.getName(),
                            appointment.getAppointmentId(),
                            doctor.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }

        if (StringUtils.hasText(doctor.getEmail())) {
            sendSafely(
                    doctor.getEmail(),
                    "Patient Cancelled Appointment",
                    String.format(
                            "Hello Dr. %s,%n%nA patient has cancelled an appointment.%nAppointment ID: %s%nPatient: %s%nTime: %s%nReason: %s%nStatus: %s%nAppointment Link: %s%n%nPlease review in HMS.",
                            doctor.getName(),
                            appointment.getAppointmentId(),
                            patient.getName(),
                            appointment.getAppointmentTime(),
                            appointment.getReason(),
                            appointment.getStatus(),
                            getAppointmentLink(appointment)));
        }
    }

    private void sendSafely(String to, String subject, String body) {
        try {
            emailService.sendMail(to, subject, body);
        } catch (Exception e) {
            log.error("Failed to send appointment email to: {}", to, e);
        }
    }

    private String getAppointmentLink(Appointment appointment) {
        String baseUrl = appointmentDetailsBaseUrl.endsWith("/") ? appointmentDetailsBaseUrl : appointmentDetailsBaseUrl + "/";
        return baseUrl + appointment.getAppointmentId();
    }
}
