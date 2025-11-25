package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import java.time.LocalDateTime;

/**
 * Clase base para auditoría automática
 * Proporciona columnas: created_by, created_at, updated_by, updated_at
 * Heredar en entidades que requieran auditoría (Product, Order, User, Review, etc)
 */
@MappedSuperclass
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditableEntity {
    
    @Column(name = "created_by", length = 255)
    private String createdBy;  // Email o username del usuario
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_by", length = 255)
    private String updatedBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;  // NULL = activo, NOT NULL = borrado lógico
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        createdBy = getCurrentUser();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updatedBy = getCurrentUser();
    }
    
    /**
     * Obtiene el usuario actual del contexto de seguridad
     */
    protected String getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                return auth.getName();
            }
        } catch (Exception e) {
            // Ignorar excepciones si no hay contexto de seguridad
        }
        return "SYSTEM";
    }
    
    /**
     * Marca la entidad como borrada (soft delete)
     */
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        this.updatedBy = getCurrentUser();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Restaura la entidad (reverse soft delete)
     */
    public void restore() {
        this.deletedAt = null;
        this.updatedBy = getCurrentUser();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Comprueba si la entidad está borrada
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }
}
