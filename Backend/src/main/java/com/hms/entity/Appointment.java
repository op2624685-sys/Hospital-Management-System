package com.hms.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

import com.hms.entity.type.AppointmentStatusType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@Table(
    indexes = {
        @Index(name = "idx_appointment_branch_time", columnList = "branch_id, appointment_time"),
        @Index(name = "idx_appointment_status_time", columnList = "status, appointment_time")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_appointment_doctor_time", columnNames = { "doctor_id", "appointment_time" })
    }
)
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id", nullable = false, unique = true, updatable = false)
    private String appointmentId;

    @PrePersist
    public void generateAppointmentId() {
        if (appointmentId == null) {
            appointmentId = UUID.randomUUID().toString();
        }
    }

    @Column(name = "appointment_time", nullable = false)
    private LocalDateTime appointmentTime;

    @Column(length = 500)
    private String reason;

    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AppointmentStatusType status;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "visited_at")
    private LocalDateTime visitedAt;

    @Column(name = "queued_at")
    private LocalDateTime queuedAt;

    @Column(name = "in_progress_at")
    private LocalDateTime inProgressAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "no_show_at")
    private LocalDateTime noShowAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "queue_number")
    private Integer queueNumber;

    @Column(name = "queue_date")
    private LocalDate queueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(nullable = false)
    private Doctor doctor;

    @ManyToOne
    @ToString.Exclude
    @JoinColumn(nullable = false)
    private Patient patient;

    @ManyToOne
    @ToString.Exclude
    @JoinColumn(nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments;

}
