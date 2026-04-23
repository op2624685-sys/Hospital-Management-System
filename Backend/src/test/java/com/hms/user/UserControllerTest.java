package com.hms.user;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.hms.controller.UserController;
import com.hms.dto.Response.ProfilePhotoResponseDto;
import com.hms.entity.User;
import com.hms.error.GlobalExceptionHandler;
import com.hms.error.ValidationException;
import com.hms.service.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateProfilePhoto_ShouldReturnOk() throws Exception {
        User user = new User();
        user.setId(11L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList()));

        MockMultipartFile file = new MockMultipartFile(
                "profilePhoto",
                "avatar.png",
                "image/png",
                "dummy-image-bytes".getBytes());

        when(userService.updateProfilePhoto(eq(11L), any()))
                .thenReturn(new ProfilePhotoResponseDto("https://res.cloudinary.com/demo/image/upload/v1/avatar.png"));

        mockMvc.perform(multipart("/user/profile/photo").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profilePhoto").value("https://res.cloudinary.com/demo/image/upload/v1/avatar.png"));
    }

    @Test
    void updateProfilePhoto_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        User user = new User();
        user.setId(11L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList()));

        MockMultipartFile file = new MockMultipartFile(
                "profilePhoto",
                "avatar.gif",
                "image/gif",
                "gif".getBytes());

        when(userService.updateProfilePhoto(eq(11L), any()))
                .thenThrow(new ValidationException("Only JPG, PNG, or WEBP images are allowed"));

        mockMvc.perform(multipart("/user/profile/photo").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only JPG, PNG, or WEBP images are allowed"))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }
}
