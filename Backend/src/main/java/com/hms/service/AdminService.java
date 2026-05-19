package com.hms.service;

import java.util.List;

import com.hms.dto.AdminDto;
import com.hms.dto.Request.OnBoardAdminRequestDto;
import com.hms.dto.Request.OnBoardReceptionistRequestDto;
import com.hms.dto.Response.AdminResponseDto;
import com.hms.dto.Response.AdminOverviewDto;
import com.hms.dto.Response.ReceptionistResponseDto;

public interface AdminService {

    List<AdminDto> getAllAdmins();

    AdminDto getAdminById(Long id);

    List<AdminDto> getAdminByName(String name);

    String deleteAdminById(Long id);

    AdminResponseDto onBoardNewAdmin(OnBoardAdminRequestDto onBoardAdminRequestDto);

    ReceptionistResponseDto onBoardNewReceptionist(OnBoardReceptionistRequestDto onBoardReceptionistRequestDto);

    AdminOverviewDto getAdminOverview();

    AdminDto getAdminProfile();
}
