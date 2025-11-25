package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user", columnList = "user_id"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_user_status", columnList = "user_id, status"),
    @Index(name = "idx_order_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)  // ✅ Para heredancia
@ToString(callSuper = true)
public class Order extends AuditableEntity {  // ✅ Heredar para auditoría
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // ✅ NOT NULL

    @Enumerated(EnumType.STRING)  // ✅ STRING no ORDINAL
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;  // ✅ NOT NULL

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2,
            columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;  // ✅ NOT NULL

    @Column(name = "shipping", nullable = false, precision = 10, scale = 2,
            columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    @Builder.Default
    private BigDecimal shipping = BigDecimal.ZERO;  // ✅ NOT NULL

    @Column(name = "discount", nullable = false, precision = 10, scale = 2,
            columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;  // ✅ NOT NULL

    @Column(name = "tax", nullable = false, precision = 10, scale = 2,
            columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;  // ✅ NOT NULL

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;  // ✅ NOT NULL

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;  // ✅ NOT NULL

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "shipping_city", length = 100)
    private String shippingCity;

    @Column(name = "shipping_postal_code", length = 20)
    private String shippingPostalCode;

    @Column(name = "shipping_country", length = 100)
    private String shippingCountry;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {
        super.onCreate();  // ✅ Llamar a padre para auditoría
        if (status == null) {
            status = OrderStatus.PENDING;
        }
        if (subtotal == null) subtotal = BigDecimal.ZERO;
        if (shipping == null) shipping = BigDecimal.ZERO;
        if (discount == null) discount = BigDecimal.ZERO;
        if (tax == null) tax = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        super.onUpdate();  // ✅ Llamar a padre para auditoría
    }
}

