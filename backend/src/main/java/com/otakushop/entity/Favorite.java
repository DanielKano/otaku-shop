package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorites", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)  // ✅ Para heredancia
@ToString(callSuper = true)
public class Favorite extends AuditableEntity {  // ✅ Heredar para auditoría

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @PrePersist
    protected void onCreate() {
        super.onCreate();  // ✅ Llamar a padre para auditoría
    }

    @PreUpdate
    protected void onUpdate() {
        super.onUpdate();  // ✅ Llamar a padre para auditoría
    }
}
