package com.hms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hms.dto.Response.ProfilePhotoResponseDto;
import com.hms.entity.User;
import com.hms.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/profile/photo")
    public ResponseEntity<ProfilePhotoResponseDto> updateProfilePhoto(
            @RequestParam("profilePhoto") MultipartFile profilePhoto) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(userService.updateProfilePhoto(user.getId(), profilePhoto));
    }
}
