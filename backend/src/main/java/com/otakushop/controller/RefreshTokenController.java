package com.otakushop.controller;

import com.otakushop.dto.RefreshTokenRequest;
import com.otakushop.dto.RefreshTokenResponse;
import com.otakushop.entity.RefreshToken;
import com.otakushop.security.JwtTokenProvider;
import com.otakushop.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints de autenticación")
public class RefreshTokenController {
    
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider tokenProvider;
    
    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token usando refresh token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verifyExpiration(refreshToken);
        
        // Generar nuevo access token
        String newAccessToken = tokenProvider.generateToken(
            refreshToken.getUser().getId(),
            refreshToken.getUser().getEmail(),
            refreshToken.getUser().getRole().name()
        );
        
        // Opcionalmente, generar nuevo refresh token (rotación de tokens)
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(refreshToken.getUser().getId());
        
        // Revocar el refresh token anterior
        refreshTokenService.revokeToken(request.getRefreshToken());
        
        return ResponseEntity.ok(new RefreshTokenResponse(newAccessToken, newRefreshToken.getToken()));
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión y revocar refresh tokens")
    public ResponseEntity<?> logout(@AuthenticationPrincipal UserDetails userDetails) {
        // Aquí deberías obtener el userId del UserDetails
        // refreshTokenService.revokeAllUserTokens(userId);
        return ResponseEntity.ok().build();
    }
}
