package com.hms.auth;
import static org.junit.jupiter.api.Assertions.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
import com.hms.security.AuthService;
import com.hms.security.AuthUtil;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AuthUtil authUtil;

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
}
