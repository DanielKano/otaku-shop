package com.otakushop.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {
    
    /**
     * Obtiene el ID del usuario autenticado
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Usuario no autenticado");
        }
        
        Object principal = authentication.getPrincipal();
        
        // Si es un UserDetails, obtener el ID (custom)
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            // Aquí podrías obtener el usuario de la DB, pero asumiremos que lo obtiene el AuthService
            // Por ahora, retornamos el username como Long (esto requiere ajustes)
        }
        
        // Si es un número (JWT parsing), retornar como Long
        if (principal instanceof Number) {
            return ((Number) principal).longValue();
        }
        
        // Si es un string que contiene el ID
        if (principal instanceof String) {
            try {
                return Long.parseLong((String) principal);
            } catch (NumberFormatException e) {
                throw new SecurityException("No se pudo extraer el ID del usuario");
            }
        }
        
        throw new SecurityException("No se pudo obtener el ID del usuario");
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
