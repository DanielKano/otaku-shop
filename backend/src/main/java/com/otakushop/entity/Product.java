package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category", columnList = "category"),
    @Index(name = "idx_product_status", columnList = "status"),
    @Index(name = "idx_product_vendor", columnList = "vendor_id"),
    @Index(name = "idx_product_active_status", columnList = "active, status"),
    @Index(name = "idx_product_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)  // ✅ Para heredancia
@ToString(callSuper = true)
public class Product extends AuditableEntity {  // ✅ Heredar para auditoría
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Agregar @Version para optimistic locking
    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "name", nullable = false, length = 255)
    private String name;  // ✅ NOT NULL

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;  // ✅ NOT NULL

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "category", nullable = false, length = 255)
    private String category;  // ✅ NOT NULL

    @Column(name = "stock", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer stock = 0;  // ✅ NOT NULL

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "rating", nullable = false, columnDefinition = "DOUBLE PRECISION DEFAULT 0.0")
    @Builder.Default
    private Double rating = 0.0;  // ✅ NOT NULL

    @Column(name = "reviews", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer reviews = 0;  // ✅ NOT NULL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;  // ✅ NOT NULL

    @Column(name = "active", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    @Builder.Default
    private Boolean active = true;  // ✅ NOT NULL

    @Enumerated(EnumType.STRING)  // ✅ STRING no ORDINAL
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ProductStatus status = ProductStatus.PENDING;  // ✅ NOT NULL

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "approved_at")
    private java.time.LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    @PrePersist
    protected void onCreate() {
        super.onCreate();  // ✅ Llamar a padre para auditoría
        if (rating == null) rating = 0.0;
        if (reviews == null) reviews = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        super.onUpdate();  // ✅ Llamar a padre para auditoría
    }
}
