package com.hms.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hospital_branch")
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String contactNumber;

    @Column(nullable = false)
    private String email;

    @OneToOne(mappedBy = "branch")
    private Admin admin;

    @OneToMany(mappedBy = "branch")
    private List<Department> departments = new ArrayList<>();

    @OneToMany(mappedBy = "branch")
    private List<Doctor> doctors = new ArrayList<>();

    @OneToMany(mappedBy = "branch")
    private List<Patient> patients = new ArrayList<>();

    @OneToMany(mappedBy = "branch")
    private List<Appointment> appointments = new ArrayList<>();
}
