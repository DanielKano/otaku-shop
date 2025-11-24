package com.otakushop.repository;

import com.otakushop.entity.RefreshToken;
import com.otakushop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);
    
    void deleteByUser(User user);
    
    void deleteByExpiryDateBefore(LocalDateTime date);
}
