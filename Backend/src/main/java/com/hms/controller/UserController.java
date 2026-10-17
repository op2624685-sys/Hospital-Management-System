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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "User Account", description = "General account management endpoints applicable to all user roles")
public class UserController {

    private final UserService userService;

    @PostMapping("/profile/photo")
    @Operation(summary = "Update Profile Photo", description = "Uploads a new profile image for the currently authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Photo updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid image file format or size"),
        @ApiResponse(responseCode = "401", description = "Authentication is required"),
        @ApiResponse(responseCode = "413", description = "Profile image exceeds the permitted size")
    })
    public ResponseEntity<ProfilePhotoResponseDto> updateProfilePhoto(
            @Parameter(description = "Profile image file (JPG/PNG)") @RequestParam("profilePhoto") MultipartFile profilePhoto) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(userService.updateProfilePhoto(user.getId(), profilePhoto));
    }
}
