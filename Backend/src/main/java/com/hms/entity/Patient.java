package com.hms.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.hms.entity.type.BloodGroupType;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(
    name = "patient",
    indexes = {
        @Index(name = "idx_patient_birth_date", columnList = "birth_date")
    }
)
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private String gender;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroupType bloodGroup;
    
    @Column(unique = true, nullable = false)
    private String email;

    @OneToOne
    @MapsId      // this annotation is used to map the primary key of the user table to the patient table
    private User user;

    @CreationTimestamp
    @Column(nullable = false,updatable = false)
    private LocalDate createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDate updatedAt;

    @OneToOne(cascade = {CascadeType.ALL}, orphanRemoval = true)
    @JoinColumn(name = "patient_insurance_id")
    private Insurance insurance;

    @OneToMany(mappedBy = "patient", cascade = {CascadeType.REMOVE}, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Appointment> Appointments = new ArrayList<>();
}
