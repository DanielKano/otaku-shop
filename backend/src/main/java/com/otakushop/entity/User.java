package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)  // ✅ Para heredancia de AuditableEntity
@ToString(callSuper = true)
public class User extends AuditableEntity {  // ✅ Heredar para auditoría
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, length = 255, unique = true)
    private String email;  // ✅ NOT NULL + UNIQUE

    @Column(nullable = false)
    private String password;

    @Column(name = "name", nullable = false, length = 255)
    private String name;  // ✅ NOT NULL

    @Column(nullable = false, length = 20)
    private String phone;  // ✅ NOT NULL

    @Enumerated(EnumType.STRING)  // ✅ STRING no ORDINAL
    @Column(name = "provider", nullable = false, length = 50)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Enumerated(EnumType.STRING)  // ✅ STRING no ORDINAL
    @Column(name = "role", nullable = false, length = 50)
    private Role role;  // ✅ NOT NULL

    @Column(name = "enabled", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    @Builder.Default
    private Boolean enabled = true;  // ✅ NOT NULL
}

