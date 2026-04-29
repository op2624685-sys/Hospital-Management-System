package com.hms.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(indexes = {
    @Index(name = "idx_department_branch_id", columnList = "branch_id"),
    @Index(name = "idx_department_head_doctor_user_id", columnList = "head_doctor_user_id"),
    @Index(name = "idx_department_name_branch", columnList = "name, branch_id")
})
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 20)
    private String accentColor;

    @Column(length = 20)
    private String bgColor;

    @Column(length = 20)
    private String icon;

    @Column(columnDefinition = "TEXT")
    private String sectionsJson;

    @OneToOne
    @JoinColumn(name = "head_doctor_user_id")
    private Doctor headDoctor;

    @ManyToMany
    @JoinTable(
        name = "department_doctor",
        joinColumns = @JoinColumn(name = "department_id"),
        inverseJoinColumns = @JoinColumn(name = "doctor_id"),
        indexes = {
            @Index(name = "idx_department_doctor_department_doctor", columnList = "department_id, doctor_id"),
            @Index(name = "idx_department_doctor_doctor_department", columnList = "doctor_id, department_id")
        }
    )
    private Set<Doctor> doctors = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "department_patient",
        joinColumns = @JoinColumn(name = "department_id"),
        inverseJoinColumns = @JoinColumn(name = "patient_id")
    )
    private Set<Patient> patients = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
