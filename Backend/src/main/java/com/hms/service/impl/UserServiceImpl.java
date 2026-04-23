package com.hms.service.impl;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.hms.dto.Response.ProfilePhotoResponseDto;
import com.hms.entity.User;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.UserRepository;
import com.hms.service.CloudinaryService;
import com.hms.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final int MIN_DIMENSION_PX = 128;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp");

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ProfilePhotoResponseDto updateProfilePhoto(Long userId, MultipartFile profilePhoto) {
        validateProfilePhoto(profilePhoto);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        Map<?, ?> cloudinaryResponse = cloudinaryService.upload(profilePhoto);
        Object secureUrl = cloudinaryResponse.get("secure_url");
        if (secureUrl == null || secureUrl.toString().isBlank()) {
            throw new ValidationException("Profile image upload failed. Please try again.");
        }

        user.setProfilePhoto(secureUrl.toString());
        userRepository.save(user);
        return new ProfilePhotoResponseDto(user.getProfilePhoto());
    }

    private void validateProfilePhoto(MultipartFile profilePhoto) {
        if (profilePhoto == null || profilePhoto.isEmpty()) {
            throw new ValidationException("Profile image is required");
        }
        if (profilePhoto.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ValidationException("Profile image must be 5 MB or less");
        }

        String contentType = profilePhoto.getContentType();
        String normalizedContentType = contentType == null
                ? ""
                : contentType.toLowerCase(Locale.ROOT).trim();
        if (!ALLOWED_CONTENT_TYPES.contains(normalizedContentType)) {
            throw new ValidationException("Only JPG, PNG, or WEBP images are allowed");
        }

        BufferedImage image;
        try {
            image = ImageIO.read(profilePhoto.getInputStream());
        } catch (IOException e) {
            throw new ValidationException("Failed to read image file");
        }
        if (image == null) {
            throw new ValidationException("Invalid image content");
        }
        if (image.getWidth() < MIN_DIMENSION_PX || image.getHeight() < MIN_DIMENSION_PX) {
            throw new ValidationException("Profile image must be at least 128x128 pixels");
        }
    }
}
