package com.hms.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hms.dto.AdminDto;
import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.entity.Admin;
import com.hms.entity.Branch;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.repository.AdminRepository;
import com.hms.repository.BranchRepository;
import com.hms.repository.UserRepository;
import com.hms.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    
    @Override
    public List<AdminDto> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return admins
                .stream()
                .map(this::mapToAdminDto)
                .toList();
    }

    @Override
    public AdminDto getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        return mapToAdminDto(admin);
    }

    @Override
    public List<AdminDto> getAdminByName(String name) {
        List<Admin> admins = adminRepository.findByName(name);
        return admins
                .stream()
                .map(this::mapToAdminDto)
                .toList();
    }

    @Override
    public String deleteAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        adminRepository.delete(admin);
        return "Admin deleted successfully with id: " + id;
    }

    @Override
    public AdminResponseDto onBoardNewAdmin(OnBoardAdminRequestDto onBoardAdminRequestDto) {
        User user = userRepository.findById(onBoardAdminRequestDto.getUserId()).orElseThrow(() -> new RuntimeException("User not found with id: " + onBoardAdminRequestDto.getUserId()));
        Branch branch = branchRepository.findById(onBoardAdminRequestDto.getBranchId()).orElseThrow(() -> new RuntimeException("Branch not found with id: " + onBoardAdminRequestDto.getBranchId()));
        if (adminRepository.existsByEmail(onBoardAdminRequestDto.getEmail())) {
            throw new RuntimeException("Admin already exists with email: " + onBoardAdminRequestDto.getEmail());
        }
        if (adminRepository.existsByBranch_Id(onBoardAdminRequestDto.getBranchId())) {
            throw new RuntimeException("This branch already has an admin assigned");
        }
        Admin admin = Admin.builder()
                .name(onBoardAdminRequestDto.getName())
                .email(onBoardAdminRequestDto.getEmail())
                .branch(branch)
                .user(user)
                .build();
        user.getRoles().add(RoleType.ADMIN);
        Admin savedAdmin = adminRepository.save(admin);
        return mapToAdminResponseDto(savedAdmin);
    }

    private AdminDto mapToAdminDto(Admin admin) {
        return new AdminDto(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getBranch() != null ? admin.getBranch().getId() : null);
    }

    private AdminResponseDto mapToAdminResponseDto(Admin admin) {
        return new AdminResponseDto(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getBranch() != null ? admin.getBranch().getId() : null);
    }

}
