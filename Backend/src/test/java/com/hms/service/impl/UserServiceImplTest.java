package com.hms.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.hms.dto.Response.ProfilePhotoResponseDto;
import com.hms.entity.User;
import com.hms.error.NotFoundException;
import com.hms.error.ValidationException;
import com.hms.repository.UserRepository;
import com.hms.service.CloudinaryService;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void updateProfilePhoto_success() throws IOException {
        Long userId = 7L;
        User user = new User();
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cloudinaryService.upload(any(MockMultipartFile.class)))
                .thenReturn(Map.of("secure_url", "https://res.cloudinary.com/demo/image/upload/v1/profile.png"));

        MockMultipartFile file = createPngFile("profilePhoto", 256, 256);

        ProfilePhotoResponseDto response = userService.updateProfilePhoto(userId, file);

        assertEquals("https://res.cloudinary.com/demo/image/upload/v1/profile.png", response.getProfilePhoto());
        assertEquals("https://res.cloudinary.com/demo/image/upload/v1/profile.png", user.getProfilePhoto());
        verify(userRepository).save(user);
    }

    @Test
    void updateProfilePhoto_rejectsInvalidMimeType() {
        MockMultipartFile file = new MockMultipartFile(
                "profilePhoto",
                "profile.gif",
                "image/gif",
                new byte[] { 1, 2, 3 });

        ValidationException ex = assertThrows(ValidationException.class, () -> userService.updateProfilePhoto(1L, file));
        assertEquals("Only JPG, PNG, or WEBP images are allowed", ex.getMessage());
    }

    @Test
    void updateProfilePhoto_rejectsTooSmallDimensions() throws IOException {
        MockMultipartFile file = createPngFile("profilePhoto", 64, 64);

        ValidationException ex = assertThrows(ValidationException.class, () -> userService.updateProfilePhoto(1L, file));
        assertEquals("Profile image must be at least 128x128 pixels", ex.getMessage());
    }

    @Test
    void updateProfilePhoto_rejectsFileLargerThan5Mb() {
        byte[] oversized = new byte[5 * 1024 * 1024 + 1];
        MockMultipartFile file = new MockMultipartFile(
                "profilePhoto",
                "profile.png",
                "image/png",
                oversized);

        ValidationException ex = assertThrows(ValidationException.class, () -> userService.updateProfilePhoto(1L, file));
        assertEquals("Profile image must be 5 MB or less", ex.getMessage());
    }

    @Test
    void updateProfilePhoto_throwsWhenUserMissing() throws IOException {
        MockMultipartFile file = createPngFile("profilePhoto", 256, 256);
        when(userRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> userService.updateProfilePhoto(10L, file));
    }

    private MockMultipartFile createPngFile(String name, int width, int height) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "png", outputStream);
        return new MockMultipartFile(name, "profile.png", "image/png", outputStream.toByteArray());
    }
}
