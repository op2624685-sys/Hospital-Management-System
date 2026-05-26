package com.hms.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hms.dto.DoctorDto;
import com.hms.dto.Response.PublicDoctorDepartmentRow;
import com.hms.dto.Response.PublicDoctorListDto;
import com.hms.dto.Response.PublicDoctorListRow;
import com.hms.entity.Doctor;
import com.hms.entity.DoctorRatingSummary;
import com.hms.repository.AdminRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.repository.DoctorRatingSummaryRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;
import com.hms.service.HMSAuditLogService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplRatingSummaryTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private DoctorRatingSummaryRepository doctorRatingSummaryRepository;

    @Mock
    private HMSAuditLogService auditLogService;

    @Mock
    private NotificationServiceImpl notificationService;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    @Test
    void getAllDoctorsSearch_IncludesBulkRatingSummaries() {
        Doctor doctor = doctor(10L, "Asha Mehta", "Cardiology");
        DoctorRatingSummary summary = DoctorRatingSummary.builder()
                .doctorId(10L)
                .averageRating(4.5)
                .totalReviews(8L)
                .build();

        when(doctorRepository.findAllSearch(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(doctor)));
        when(doctorRatingSummaryRepository.findByDoctorIdIn(anyCollection()))
                .thenReturn(List.of(summary));
        List<DoctorDto> doctors = doctorService.getAllDoctorsSearch("cardio", 0, 10);

        assertThat(doctors).hasSize(1);
        assertThat(doctors.get(0).getRatingSummary().doctorId()).isEqualTo(10L);
        assertThat(doctors.get(0).getRatingSummary().averageRating()).isEqualTo(4.5);
        assertThat(doctors.get(0).getRatingSummary().totalReviews()).isEqualTo(8L);
        verify(doctorRatingSummaryRepository).findByDoctorIdIn(List.of(10L));
    }

    @Test
    void getAllDoctorsSearch_DefaultsMissingRatingSummaryToZeroValues() {
        Doctor doctor = doctor(11L, "Ravi Shah", "Neurology");

        when(doctorRepository.findAllSearch(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(doctor)));
        when(doctorRatingSummaryRepository.findByDoctorIdIn(anyCollection()))
                .thenReturn(List.of());
        List<DoctorDto> doctors = doctorService.getAllDoctorsSearch(null, 0, 10);

        assertThat(doctors).hasSize(1);
        assertThat(doctors.get(0).getRatingSummary().doctorId()).isEqualTo(11L);
        assertThat(doctors.get(0).getRatingSummary().averageRating()).isZero();
        assertThat(doctors.get(0).getRatingSummary().totalReviews()).isZero();
    }

    @Test
    void getPublicDoctors_ReturnsLightweightDtoWithDepartmentsAndBoundedSize() {
        DoctorRatingSummary summary = DoctorRatingSummary.builder()
                .doctorId(15L)
                .averageRating(4.8)
                .totalReviews(12L)
                .build();

        when(doctorRepository.searchPublicDoctorListRows(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(new PublicDoctorListRow(
                        15L,
                        "Nisha Verma",
                        "Cardiology",
                        800L,
                        "https://cdn.example.com/doc.png",
                        2L,
                        "Main Branch",
                        "Sector 10",
                        "9999999999",
                        "branch@example.com"
                ))));
        when(doctorRepository.findPublicDoctorDepartmentsByDoctorIds(List.of(15L)))
                .thenReturn(List.of(
                        new PublicDoctorDepartmentRow(15L, 4L, "Cardiology"),
                        new PublicDoctorDepartmentRow(15L, 5L, "Emergency")
                ));
        when(doctorRatingSummaryRepository.findByDoctorIdIn(anyCollection()))
                .thenReturn(List.of(summary));

        List<PublicDoctorListDto> doctors = doctorService.getPublicDoctors("cardio", -1, 999);

        assertThat(doctors).hasSize(1);
        assertThat(doctors.get(0).departments()).extracting(department -> department.name()).containsExactly("Cardiology", "Emergency");
        assertThat(doctors.get(0).branch().getName()).isEqualTo("Main Branch");
        assertThat(doctors.get(0).ratingSummary().averageRating()).isEqualTo(4.8);
        verify(doctorRepository).searchPublicDoctorListRows(any(), any(Pageable.class));
        verify(doctorRepository).findPublicDoctorDepartmentsByDoctorIds(List.of(15L));
    }

    @Test
    void getPublicDoctors_UsesCheapestQueryWhenSearchIsBlank() {
        when(doctorRepository.findPublicDoctorListRows(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        List<PublicDoctorListDto> doctors = doctorService.getPublicDoctors("   ", 0, 10);

        assertThat(doctors).isEmpty();
        verify(doctorRepository).findPublicDoctorListRows(any(Pageable.class));
    }

    private Doctor doctor(Long id, String name, String specialization) {
        return Doctor.builder()
                .id(id)
                .name(name)
                .specialization(specialization)
                .email(name.toLowerCase().replace(" ", ".") + "@example.com")
                .consultationFee(500L)
                .build();
    }
}
