package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_read_status", columnList = "is_read")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    @Column(nullable = false)
    private boolean isRead = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime readAt;
    
    // Metadata adicional (JSON string)
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
    public enum NotificationType {
        ORDER_CREATED,
        ORDER_SHIPPED,
        ORDER_DELIVERED,
        ORDER_CANCELLED,
        PRODUCT_LOW_STOCK,
        PRODUCT_BACK_IN_STOCK,
        NEW_REVIEW,
        PRICE_DROP,
        PAYMENT_SUCCESS,
        PAYMENT_FAILED,
        SYSTEM
    }
}
