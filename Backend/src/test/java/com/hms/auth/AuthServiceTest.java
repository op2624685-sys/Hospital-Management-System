package com.hms.auth;
import static org.junit.jupiter.api.Assertions.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import org.mockito.InOrder;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.error.ValidationException;
import com.hms.repository.UserRepository;
import com.hms.security.AuthService;
import com.hms.security.AuthUtil;
import com.hms.security.RefreshTokenService;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AuthUtil authUtil;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    @Test
    void testLogin_success() {

        LoginRequestDto requestDto = new LoginRequestDto("Om", "password");

        User user = new User();
        user.setId(1L);
        user.setUsername("Om");
        user.setPassword("password");
        user.setEmail("om@example.com");
        user.setProfilePhoto("https://cdn.example.com/om.jpg");
        user.setRoles(Set.of(RoleType.PATIENT));

        Authentication authentication = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);

        when(authentication.getPrincipal()).thenReturn(user);

        when(authUtil.generateAccessToken(user))
                .thenReturn("mocked-jwt-token");

        //Act
        LoginResponseDto responseDto = authService.login(requestDto);

        //Assert
        assertNotNull(responseDto);
        assertEquals("mocked-jwt-token", responseDto.getToken());
        assertEquals(1L, responseDto.getUserId());
        assertEquals("Om", responseDto.getUsername());
        assertEquals("om@example.com", responseDto.getEmail());
        assertEquals("https://cdn.example.com/om.jpg", responseDto.getProfilePhoto());
        assertEquals(Set.of(RoleType.PATIENT), responseDto.getRoles());

        verify(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(authUtil)
                .generateAccessToken(user);
    }

    @Test
    void login_shouldThrowException_whenCredentialsAreInvalid() {

        // Arrange
        LoginRequestDto requestDto = new LoginRequestDto("Om", "wrong-password");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act + Assert
        assertThrows(BadCredentialsException.class, () -> {
            authService.login(requestDto);
        });

        verify(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        verify(authUtil, never())
                .generateAccessToken(any());
    }

    @Test
    void refreshToken_shouldSuccessfullyRefreshAndRevokeOldToken() {
        // Arrange
        Long userId = 1L;
        String oldRefreshToken = "old-refresh-token";
        String newAccessToken = "new-access-token";
        String newRefreshToken = "new-refresh-token";

        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setProfilePhoto("https://example.com/photo.jpg");
        user.setRoles(Set.of(RoleType.PATIENT));

        when(refreshTokenService.validateRefreshToken(oldRefreshToken)).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(authUtil.generateAccessToken(user)).thenReturn(newAccessToken);
        when(refreshTokenService.createRefreshToken(userId)).thenReturn(newRefreshToken);

        // Act
        LoginResponseDto response = authService.refreshToken(oldRefreshToken);

        // Assert
        assertNotNull(response);
        assertEquals(newAccessToken, response.getToken());
        assertEquals(newRefreshToken, response.getRefreshToken());
        assertEquals(userId, response.getUserId());
        assertEquals("testuser", response.getUsername());

        // Verify old token was revoked BEFORE creating new token
        verify(refreshTokenService).validateRefreshToken(oldRefreshToken);
        verify(refreshTokenService).deleteToken(oldRefreshToken);
        verify(refreshTokenService).createRefreshToken(userId);
        verify(userRepository).findById(userId);
        verify(authUtil).generateAccessToken(user);
    }

    @Test
    void refreshToken_shouldDeleteOldTokenBeforeCreatingNewToken() {
        // Arrange
        Long userId = 2L;
        String oldRefreshToken = "old-token";
        String newAccessToken = "new-access-token";
        String newRefreshToken = "new-refresh-token";

        User user = new User();
        user.setId(userId);
        user.setUsername("user2");
        user.setEmail("user2@example.com");
        user.setProfilePhoto(null);
        user.setRoles(Set.of(RoleType.DOCTOR));

        when(refreshTokenService.validateRefreshToken(oldRefreshToken)).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(authUtil.generateAccessToken(user)).thenReturn(newAccessToken);
        when(refreshTokenService.createRefreshToken(userId)).thenReturn(newRefreshToken);

        // Act
        authService.refreshToken(oldRefreshToken);

        // Assert - Verify delete is called before create
        InOrder inOrder = inOrder(refreshTokenService);
        inOrder.verify(refreshTokenService).validateRefreshToken(oldRefreshToken);
        inOrder.verify(refreshTokenService).deleteToken(oldRefreshToken);
        inOrder.verify(refreshTokenService).createRefreshToken(userId);
    }

    @Test
    void refreshToken_shouldThrowExceptionWhenUserNoLongerExists() {
        // Arrange
        Long userId = 999L;
        String refreshToken = "valid-token";

        when(refreshTokenService.validateRefreshToken(refreshToken)).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            authService.refreshToken(refreshToken);
        });

        assertEquals("User no longer exists. Please log in again", exception.getMessage());

        // Verify that we didn't try to delete the token or create a new one
        verify(refreshTokenService, never()).deleteToken(any());
        verify(refreshTokenService, never()).createRefreshToken(any());
    }

    @Test
    void refreshToken_shouldThrowExceptionWhenTokenInvalid() {
        // Arrange
        String invalidToken = "invalid-token";

        when(refreshTokenService.validateRefreshToken(invalidToken))
                .thenThrow(new RuntimeException("Invalid or expired refresh token"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authService.refreshToken(invalidToken);
        });

        // Verify no token deletion or creation was attempted
        verify(refreshTokenService, never()).deleteToken(any());
        verify(refreshTokenService, never()).createRefreshToken(any());
        verify(userRepository, never()).findById(any());
    }

    @Test
    void logout_shouldDeleteRefreshToken() {
        // Arrange
        String refreshToken = "token-to-logout";

        // Act
        authService.logout(refreshToken);

        // Assert
        verify(refreshTokenService).deleteToken(refreshToken);
    }

    @Test
    void logout_shouldCallDeleteTokenWithCorrectToken() {
        // Arrange
        String testToken = "test-logout-token-123";

        // Act
        authService.logout(testToken);

        // Assert
        verify(refreshTokenService, times(1)).deleteToken(testToken);
    }
}
