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

    @OneToMany(mappedBy = "doctor")
    private List<Appointment> Appointments = new ArrayList<>();

    @ManyToMany(mappedBy = "doctors")
    private Set<Department> departments = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
