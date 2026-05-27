package com.hms.entity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(indexes = {
    @Index(name = "idx_doctor_branch_id", columnList = "branch_id"),
    @Index(name = "idx_doctor_name", columnList = "name"),
    @Index(name = "idx_doctor_specialization", columnList = "specialization")
})
public class Doctor {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private Long consultationFee;

    @Column(name = "doctor_stamp_url", length = 500)
    private String doctorStampUrl;

    @OneToMany(mappedBy = "doctor")
    @Builder.Default
    private List<Appointment> Appointments = new ArrayList<>();

    @org.hibernate.annotations.BatchSize(size = 10)
    @OneToMany(mappedBy = "headDoctor")
    @Builder.Default
    private Set<Department> headedDepartments = new HashSet<>();

    @org.hibernate.annotations.BatchSize(size = 10)
    @ManyToMany(mappedBy = "doctors")
    @Builder.Default
    private Set<Department> departments = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
