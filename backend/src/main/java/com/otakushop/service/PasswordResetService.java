package com.otakushop.service;

import com.otakushop.entity.PasswordResetToken;
import com.otakushop.entity.User;
import com.otakushop.exception.InvalidTokenException;
import com.otakushop.exception.ResourceNotFoundException;
import com.otakushop.repository.PasswordResetTokenRepository;
import com.otakushop.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public void createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        
        // Eliminar tokens anteriores del usuario
        tokenRepository.deleteByUser(user);
        
        // Crear nuevo token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);
        
        // Enviar email
        emailService.sendPasswordResetEmail(email, token);
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new InvalidTokenException("Token inválido o ya utilizado"));
        
        if (resetToken.isExpired()) {
            throw new InvalidTokenException("El token ha expirado");
        }
        
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
    
    public boolean validateToken(String token) {
        return tokenRepository.findByTokenAndUsedFalse(token)
                .map(resetToken -> !resetToken.isExpired())
                .orElse(false);
    }
    
    // Limpiar tokens expirados cada día
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
