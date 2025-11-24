package com.otakushop.service;

import com.otakushop.dto.LoginRequest;
import com.otakushop.dto.RegisterRequest;
import com.otakushop.dto.AuthResponse;
import com.otakushop.entity.AuthProvider;
import com.otakushop.entity.RefreshToken;
import com.otakushop.entity.User;
import com.otakushop.entity.Role;
import com.otakushop.repository.UserRepository;
import com.otakushop.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(Role.fromValue(request.getRole()))
                .provider(AuthProvider.LOCAL)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        // Enviar email de bienvenida
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse createSuperAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(Role.SUPERADMIN)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
