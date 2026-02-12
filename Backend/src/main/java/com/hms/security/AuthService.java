package com.hms.security;

import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Request.SignupRequestDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.dto.Response.SignupResponseDto;
import com.hms.entity.User;
import com.hms.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = authUtil.generateAccessToken(user);
        return new LoginResponseDto(token, user.getId());
    }

    public SignupResponseDto login(SignupRequestDto signupRequestDto) {
        User user = userRepository.findByUsername(signupRequestDto.getUsername()).orElse(null);
        if (user != null) throw new IllegalArgumentException("User already exists");
        
        user = userRepository.save(User.builder()
                .username(signupRequestDto.getUsername())
                .password(signupRequestDto.getPassword())
                .build()
        );

        return modelMapper.map(user, SignupResponseDto.class);
    }

}
