package com.hms.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.hms.entity.type.PrescriptionDocumentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(indexes = {
        @Index(name = "idx_prescription_appointment_id", columnList = "appointment_id"),
        @Index(name = "idx_prescription_document_status", columnList = "document_status")
})
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Column(length = 1000)
    private String diagnosis;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(columnDefinition = "TEXT")
    private String vitals;

    @Column(name = "medicines_json", columnDefinition = "TEXT")
    private String medicinesJson;

    @Column(name = "recommended_tests", columnDefinition = "TEXT")
    private String recommendedTests;

    @Column(columnDefinition = "TEXT")
    private String advice;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_notes", columnDefinition = "TEXT")
    private String followUpNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_status", nullable = false, length = 32)
    private PrescriptionDocumentStatus documentStatus;

    @Column(name = "document_url", length = 1000)
    private String documentUrl;

    @Column(name = "document_generated_at")
    private LocalDateTime documentGeneratedAt;

    @Column(name = "document_request_version")
    private LocalDateTime documentRequestVersion;

    @Column(name = "generation_error", columnDefinition = "TEXT")
    private String generationError;

    @Column(name = "generation_attempt_count", nullable = false)
    @Builder.Default
    private Integer generationAttemptCount = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
