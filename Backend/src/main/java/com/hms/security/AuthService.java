package com.hms.security;

import java.util.Set;

// import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.hms.dto.Request.LoginRequestDto;
import com.hms.dto.Request.SignupRequestDto;
import com.hms.dto.Response.LoginResponseDto;
import com.hms.dto.Response.SignupResponseDto;
import com.hms.entity.Patient;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final AuthUtil authUtil;
    private final UserRepository userRepository;
    // private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;

    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = authUtil.generateAccessToken(user);

        return new LoginResponseDto(token, user.getId(), user.getRoles());
    }

    public SignupResponseDto signup(SignupRequestDto signupRequestDto) {
        User user = userRepository.findByUsername(signupRequestDto.getUsername()).orElse(null);
        if (user != null) throw new IllegalArgumentException("User already exists");
        

        //# This is made with using modelMapper !!!!
        // user = userRepository.save(User.builder()
        //         .username(signupRequestDto.getUsername())
        //         .password(passwordEncoder.encode(signupRequestDto.getPassword()))
        //         .roles(Set.of(RoleType.PATIENT))
        //         .build()
        // );
        // return modelMapper.map(user, SignupResponseDto.class);


        user = User.builder()
            .username(signupRequestDto.getUsername())
            .password(passwordEncoder.encode(signupRequestDto.getPassword()))
            .roles(Set.of(RoleType.PATIENT))
            .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder()
            .name(signupRequestDto.getName())
            .email(signupRequestDto.getEmail())
            .birthDate(signupRequestDto.getBirthDate())
            .bloodGroup(signupRequestDto.getBloodGroup())
            .gender(signupRequestDto.getGender())
            .user(user)
            .build();
        patientRepository.save(patient);

        return SignupResponseDto.builder()
        .id(user.getId())
        .username(user.getUsername())
        .roles(user.getRoles())
        .build();
    }

}
