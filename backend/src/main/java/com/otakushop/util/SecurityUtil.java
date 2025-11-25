package com.otakushop.util;

import com.otakushop.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import jakarta.servlet.http.HttpServletRequest;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityUtil {
    private final JwtTokenProvider jwtTokenProvider;
    private final HttpServletRequest httpServletRequest;
    
    /**
     * Obtiene el ID del usuario autenticado desde el JWT
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("Authentication is null or not authenticated");
            throw new SecurityException("Usuario no autenticado");
        }
        
        // Obtener el JWT del header
        String jwt = getJwtFromRequest();
        if (StringUtils.hasText(jwt)) {
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwt);
            if (userId == null) {
                log.error("getUserIdFromJWT returned null for JWT");
                throw new SecurityException("No se pudo extraer el ID del usuario del JWT");
            }
            log.debug("Successfully extracted userId={} from JWT", userId);
            return userId;
        }
        
        log.error("JWT not found in Authorization header");
        throw new SecurityException("No se pudo obtener el ID del usuario");
    }
    
    /**
     * Obtiene el JWT del header Authorization
     */
    private String getJwtFromRequest() {
        String bearerToken = httpServletRequest.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    /**
     * Obtiene el username del usuario autenticado
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Usuario no autenticado");
        }
        
        return authentication.getName();
    }
    
    /**
     * Verifica si el usuario tiene un rol específico
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role));
    }
    
    /**
     * Verifica si el usuario está autenticado
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
