package com.hms.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hms.entity.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByName(String name);

    List<Patient> findByNameAndBirthDate(String name, LocalDate birthDate);


}
