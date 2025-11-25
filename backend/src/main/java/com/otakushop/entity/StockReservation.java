package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stock Reservation - Tabla para reservar stock temporalmente
 * Previene oversell (vender más de lo que hay en stock)
 * Las reservas expiran después de 15 minutos si no se confirman en una orden
 */
@Entity
@Table(name = "stock_reservations",
    indexes = {
        @Index(name = "idx_res_product", columnList = "product_id"),
        @Index(name = "idx_res_user", columnList = "user_id"),
        @Index(name = "idx_res_session", columnList = "session_id"),
        @Index(name = "idx_res_expires", columnList = "expires_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)  // ✅ Para heredancia
@ToString(callSuper = true)
public class StockReservation extends AuditableEntity {  // ✅ Heredar para auditoría
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    // Anónimo o logeado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
    
    @Column(name = "session_id", nullable = true, length = 100)
    private String sessionId;
    
    @Column(nullable = false)
    private Integer quantity;
    
    // Expira después de 15 minutos (configurable)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "order_id", nullable = true)
    private Long orderId;  // NULL hasta que se confirme orden
    
    @PrePersist
    protected void onCreate() {
        super.onCreate();  // ✅ Llamar a padre para auditoría
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusMinutes(15);  // TTL: 15 minutos
        }
    }

    @PreUpdate
    protected void onUpdate() {
        super.onUpdate();  // ✅ Llamar a padre para auditoría
    }
    
    /**
     * Comprueba si la reserva ha expirado
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * Comprueba si la reserva está confirmada en una orden
     */
    public boolean isConfirmed() {
        return orderId != null;
    }
}
