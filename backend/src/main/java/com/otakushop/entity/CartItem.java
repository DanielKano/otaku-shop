package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "product_id"}, 
                         name = "uk_cart_user_product"),
        @UniqueConstraint(columnNames = {"session_id", "product_id"}, 
                         name = "uk_cart_session_product")
    },
    indexes = {
        @Index(name = "idx_cart_user", columnList = "user_id"),
        @Index(name = "idx_cart_session", columnList = "session_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)  // ✅ Para heredancia
@ToString(callSuper = true)
public class CartItem extends AuditableEntity {  // ✅ Heredar para auditoría
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ✅ NULLABLE: permite carrito anónimo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
    
    // ✅ NUEVO: Session ID para carritos anónimos
    @Column(name = "session_id", length = 100, nullable = true)
    private String sessionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @PrePersist
    protected void onCreate() {
        super.onCreate();  // ✅ Llamar a padre para auditoría
        validateOwnership();
    }
    
    @PreUpdate
    protected void onUpdate() {
        super.onUpdate();  // ✅ Llamar a padre para auditoría
        validateOwnership();
    }
    
    // ✅ Validación: al menos user_id O session_id debe estar presente
    private void validateOwnership() {
        if (user == null && (sessionId == null || sessionId.isEmpty())) {
            throw new IllegalArgumentException(
                "CartItem debe tener user_id o session_id"
            );
        }
    }
    
    public void addQuantity(Integer amount) {
        this.quantity += amount;
    }
    
    public void removeQuantity(Integer amount) {
        this.quantity = Math.max(0, this.quantity - amount);
    }
}
