package com.hms.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.hms.dto.Response.AdminOverviewDto;
import com.hms.entity.Admin;
import com.hms.entity.Branch;
import com.hms.entity.User;
import com.hms.repository.AdminRepository;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.DepartmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import com.hms.repository.PaymentRepository;
import com.hms.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class AdminServiceImplTest {

    @Mock private AdminRepository adminRepository;
    @Mock private UserRepository userRepository;
    @Mock private BranchRepository branchRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private PaymentRepository paymentRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User mockUser;
    private Admin mockAdmin;
    private Branch mockBranch;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("admin");

        mockBranch = new Branch();
        mockBranch.setId(1L);
        mockBranch.setName("Test Branch");

        mockAdmin = new Admin();
        mockAdmin.setId(1L);
        mockAdmin.setUser(mockUser);
        mockAdmin.setBranch(mockBranch);

        // Mock Security Context
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(mockUser);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getAdminOverview_Success() {
        // Arrange
        when(adminRepository.findById(1L)).thenReturn(Optional.of(mockAdmin));
        when(doctorRepository.countByBranch_Id(1L)).thenReturn(10L);
        when(patientRepository.countByBranches_Id(1L)).thenReturn(50L);
        
        when(appointmentRepository.countStatusByBranch(1L)).thenReturn(new ArrayList<>());
        when(paymentRepository.sumRevenueByBranch(1L)).thenReturn(1000.0);
        when(paymentRepository.sumRevenueByBranchAndDate(anyLong(), any(), any())).thenReturn(200.0);
        
        when(doctorRepository.findRecentDoctorsNative(1L)).thenReturn(new ArrayList<>());
        when(appointmentRepository.getDepartmentLoad(1L)).thenReturn(new ArrayList<>());
        when(appointmentRepository.getWeeklyCount(anyLong(), any())).thenReturn(new ArrayList<>());
        when(paymentRepository.getMonthlyRevenue(anyLong(), any())).thenReturn(new ArrayList<>());

        // Act
        AdminOverviewDto result = adminService.getAdminOverview();

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getStats().getTotalDoctors());
        assertEquals(50L, result.getStats().getTotalPatients());
        assertEquals(1000.0, result.getStats().getTotalRevenue());
        verify(adminRepository).findById(1L);
    }

    @Test
    void testRevenueCalculation() {
        // Arrange
        when(adminRepository.findById(1L)).thenReturn(Optional.of(mockAdmin));
        
        when(paymentRepository.sumRevenueByBranch(1L)).thenReturn(2500.0);
        when(paymentRepository.sumRevenueByBranchAndDate(anyLong(), any(), any())).thenReturn(500.0);
        
        // Mock other dependencies
        when(doctorRepository.findRecentDoctorsNative(1L)).thenReturn(new ArrayList<>());
        when(appointmentRepository.countStatusByBranch(1L)).thenReturn(new ArrayList<>());
        when(appointmentRepository.getDepartmentLoad(1L)).thenReturn(new ArrayList<>());
        when(appointmentRepository.getWeeklyCount(anyLong(), any())).thenReturn(new ArrayList<>());
        when(paymentRepository.getMonthlyRevenue(anyLong(), any())).thenReturn(new ArrayList<>());

        // Act
        AdminOverviewDto result = adminService.getAdminOverview();

        // Assert
        assertEquals(2500.0, result.getStats().getTotalRevenue());
        assertEquals(500.0, result.getStats().getTodayRevenue());
    }

    @Test
    void getAdminOverview_AdminNotFound() {
        // Arrange
        when(adminRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> adminService.getAdminOverview());
    }
}
