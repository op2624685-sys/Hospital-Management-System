package com.hms.service;

import org.springframework.web.multipart.MultipartFile;

import com.hms.dto.Response.ProfilePhotoResponseDto;

public interface UserService {
    ProfilePhotoResponseDto updateProfilePhoto(Long userId, MultipartFile profilePhoto);
}
