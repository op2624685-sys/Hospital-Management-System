package com.hms.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.hms.dto.PatientDto;
import com.hms.dto.Request.PatientRequest;
import com.hms.dto.Request.PatientUpdateRequest;
import com.hms.dto.Response.PatientResponseDto;
import com.hms.dto.Response.ProfileCompletionStatusDto;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
import com.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    @Cacheable(value = "patientListAll", key = "'all'")
    public List<PatientDto> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        return patients
                .stream()
                .map(patient -> modelMapper.map(patient, PatientDto.class))
                .toList();
    }

    @Override
    @Cacheable(value = "patientById", key = "'id:' + #id")
    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Patient not found with id: " + id));
        return modelMapper.map(patient, PatientDto.class);
    }

    @Override
    @Cacheable(value = "patientListByName", key = "'name:' + #name")
    public List<PatientDto> getPatientByName(String name) {
        List<Patient> patients = patientRepository.findByName(name);
        return patients
                .stream()
                .map(patient -> modelMapper.map(patient, PatientDto.class))
                .toList();
    }
    
    @Override
    public PatientDto getPatientByNameAndBirthDate(String name, LocalDate birthDate) {
        List<Patient> patients = patientRepository.findByNameAndBirthDate(name, birthDate);
        if (patients.isEmpty()) {
            throw new NotFoundException("Patient not found with name: " + name + " and birth date: " + birthDate);
        }
        return modelMapper.map(patients.get(0), PatientDto.class);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "patientListAll", allEntries = true),
        @CacheEvict(value = "patientById", allEntries = true),
        @CacheEvict(value = "patientListByName", allEntries = true),
        @CacheEvict(value = "patientListPaged", allEntries = true)
    })
    public PatientDto createNewPatient(PatientRequest patientRequest) {
        Patient patient = modelMapper.map(patientRequest, Patient.class);
        Patient savedPatient = patientRepository.save(patient);
        return modelMapper.map(savedPatient, PatientDto.class);
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "patientListAll", allEntries = true),
        @CacheEvict(value = "patientById", allEntries = true),
        @CacheEvict(value = "patientListByName", allEntries = true),
        @CacheEvict(value = "patientListPaged", allEntries = true)
    })
    public String deletePatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Patient not found with id: " + id));
        patientRepository.delete(patient);
        return "Patient deleted successfully with id: " + id;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "patientListAll", allEntries = true),
        @CacheEvict(value = "patientById", allEntries = true),
        @CacheEvict(value = "patientListByName", allEntries = true),
        @CacheEvict(value = "patientListPaged", allEntries = true)
    })
    public PatientDto updatePatientById(PatientRequest patientRequest) {
        Patient patient = modelMapper.map(patientRequest, Patient.class);
        Patient updatedPatient = patientRepository.save(patient);
        return modelMapper.map(updatedPatient, PatientDto.class);
    }

    @Override
    @Cacheable(value = "patientListPaged", key = "'all:' + #pageNumber + ':' + #pageSize")
    public List<PatientResponseDto> getAllPatients(Integer pageNumber, Integer pageSize) {
        return patientRepository.findAllPatients(PageRequest.of(pageNumber, pageSize))
                .stream()
                .map(patient -> modelMapper.map(patient, PatientResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "patientById", allEntries = true),
        @CacheEvict(value = "patientListAll", allEntries = true),
        @CacheEvict(value = "patientListByName", allEntries = true),
        @CacheEvict(value = "patientListPaged", allEntries = true)
    })
    public PatientDto updatePatientProfileWithEditLimit(Long patientId, PatientUpdateRequest patientUpdateRequest) {
        // Try to find existing patient, or create new one if doesn't exist (for OAuth users)
        Patient patient = patientRepository.findById(patientId)
                .orElseGet(() -> {
                    // Patient doesn't exist yet (typically for OAuth users)
                    // Create new patient record from user
                    User user = userRepository.findById(patientId)
                            .orElseThrow(() -> new NotFoundException("User not found with id: " + patientId));
                    
                    Patient newPatient = Patient.builder()
                            .id(patientId)
                            .user(user)
                            .name(user.getUsername())
                            .email(user.getEmail())
                            .birthDate(null)  // Will be set below
                            .gender(null)     // Will be set below
                            .bloodGroup(null) // Will be set below
                            .profileUpdateCount(0)
                            .build();
                    return newPatient;
                });

        // Validate edit limit: max 3 edits per 7-day rolling window (skip for new patients)
        if (patientRepository.findById(patientId).isPresent()) {
            validateProfileEditLimit(patient);
        }

        // Update patient profile
        patient.setBirthDate(patientUpdateRequest.getBirthDate());
        patient.setGender(patientUpdateRequest.getGender());
        patient.setBloodGroup(patientUpdateRequest.getBloodGroup());
        patient.setLastProfileUpdateTime(LocalDateTime.now());
        patient.setProfileUpdateCount(patient.getProfileUpdateCount() + 1);

        Patient updatedPatient = patientRepository.save(patient);
        return modelMapper.map(updatedPatient, PatientDto.class);
    }

    @Override
    public ProfileCompletionStatusDto getProfileCompletionStatus(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Patient not found with id: " + patientId));

        List<String> missingFields = new ArrayList<>();

        if (patient.getBirthDate() == null) {
            missingFields.add("birthDate");
        }
        if (patient.getGender() == null) {
            missingFields.add("gender");
        }
        if (patient.getBloodGroup() == null) {
            missingFields.add("bloodGroup");
        }
        if (patient.getName() == null || patient.getName().isBlank()) {
            missingFields.add("name");
        }
        if (patient.getEmail() == null || patient.getEmail().isBlank()) {
            missingFields.add("email");
        }

        return ProfileCompletionStatusDto.builder()
                .isComplete(missingFields.isEmpty())
                .missingFields(missingFields)
                .build();
    }

    /**
     * Validates if the patient has exceeded the edit limit (3 edits per 7 days)
     *
     * @param patient the patient to validate
     * @throws ValidationException if edit limit is exceeded
     */
    private void validateProfileEditLimit(Patient patient) {
        // If last update was more than 7 days ago, reset the count
        if (patient.getLastProfileUpdateTime() != null) {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            if (patient.getLastProfileUpdateTime().isBefore(sevenDaysAgo)) {
                patient.setProfileUpdateCount(0);
            }
        }

        // Check if edit limit exceeded (3 edits per 7 days)
        if (patient.getProfileUpdateCount() != null && patient.getProfileUpdateCount() >= 3) {
            throw new ValidationException("You can only edit your profile 3 times per week. Please try again later.");
        }
    }

}
