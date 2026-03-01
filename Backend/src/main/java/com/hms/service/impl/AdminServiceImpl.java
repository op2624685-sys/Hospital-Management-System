package com.hms.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.hms.dto.AdminDto;
import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.entity.Admin;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.repository.AdminRepository;
import com.hms.repository.UserRepository;
import com.hms.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    @Override
    public List<AdminDto> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return admins
                .stream()
                .map(admin -> modelMapper.map(admin, AdminDto.class))
                .toList();
    }

    @Override
    public AdminDto getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
        return modelMapper.map(admin, AdminDto.class);
    }

    @Override
    public List<AdminDto> getAdminByName(String name) {
        List<Admin> admins = adminRepository.findByName(name);
        return admins
                .stream()
                .map(admin -> modelMapper.map(admin, AdminDto.class))
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
        User user = userRepository.findById(onBoardAdminRequestDto.getUserId()).orElseThrow();
        Admin admin = Admin.builder()
                .name(onBoardAdminRequestDto.getName())
                .email(onBoardAdminRequestDto.getEmail())
                .branch(onBoardAdminRequestDto.getBranch())
                .user(user)
                .build();
        user.getRoles().add(RoleType.ADMIN);
        return modelMapper.map(adminRepository.save(admin), AdminResponseDto.class);
    }
    
    

}
