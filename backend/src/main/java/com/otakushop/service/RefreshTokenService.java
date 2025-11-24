package com.otakushop.service;

import com.otakushop.entity.RefreshToken;
import com.otakushop.entity.User;
import com.otakushop.exception.InvalidTokenException;
import com.otakushop.repository.RefreshTokenRepository;
import com.otakushop.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        String token = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken(token, user);
        
        return refreshTokenRepository.save(refreshToken);
    }
    
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new InvalidTokenException("El refresh token ha expirado. Por favor, inicia sesión nuevamente.");
        }
        
        if (token.isRevoked()) {
            throw new InvalidTokenException("El refresh token ha sido revocado");
        }
        
        return token;
    }
    
    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByTokenAndRevokedFalse(token)
                .orElseThrow(() -> new InvalidTokenException("Refresh token no encontrado o revocado"));
    }
    
    @Transactional
    public void revokeToken(String token) {
        RefreshToken refreshToken = findByToken(token);
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }
    
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        refreshTokenRepository.deleteByUser(user);
    }
    
    // Limpiar tokens expirados cada día
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanExpiredTokens() {
        refreshTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
