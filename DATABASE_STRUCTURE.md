# 📊 BASE DE DATOS - OTAKU SHOP

## ¿CÓMO SE CREAN LAS TABLAS?

Las tablas se crean **AUTOMÁTICAMENTE** desde el **BACKEND** usando:
- **Spring Data JPA** + **Hibernate ORM**
- Anotación `@Entity` en las clases Java
- Configuración `spring.jpa.hibernate.ddl-auto=update` en `application.properties`

---

## 📁 UBICACIÓN DE DEFINICIONES

```
backend/src/main/java/com/otakushop/entity/
├── User.java                 → tabla: users
├── Product.java              → tabla: products  
├── CartItem.java             → tabla: cart_items
├── Favorite.java             → tabla: favorites
├── Order.java                → tabla: orders
├── OrderItem.java            → tabla: order_items
├── Review.java               → tabla: reviews
├── Notification.java         → tabla: notifications
├── RefreshToken.java         → tabla: refresh_tokens
├── PasswordResetToken.java   → tabla: password_reset_tokens
└── (AuthProvider.java, ProductStatus.java, Role.java → SOLO ENUMS, no crean tablas)
```

---

## 📋 LAS 10 TABLAS CREADAS

### 1️⃣ **users** (Usuarios del Sistema)
```java
// Archivo: User.java
@Entity
@Table(name = "users")
public class User {
    - id (Long, PK, AUTO_INCREMENT)
    - email (String, NOT NULL, UNIQUE)
    - password (String)
    - name (String, NOT NULL)
    - phone (String)
    - provider (Enum: LOCAL, GOOGLE, FACEBOOK)
    - provider_id (String)
    - role (Enum: CLIENTE, VENDEDOR, ADMIN, SUPERADMIN)
    - enabled (Boolean, NOT NULL)
    - created_at (LocalDateTime, NOT NULL)
    - updated_at (LocalDateTime)
}
```

---

### 2️⃣ **products** (Catálogo de Productos)
```java
// Archivo: Product.java
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category", columnList = "category"),
    @Index(name = "idx_product_status", columnList = "status"),
    @Index(name = "idx_product_vendor", columnList = "vendor_id"),
    @Index(name = "idx_product_active_status", columnList = "active, status")
})
public class Product {
    - id (Long, PK)
    - name (String, NOT NULL)
    - description (TEXT)
    - price (BigDecimal, precision=10, scale=2)
    - originalPrice (BigDecimal)
    - category (String, NOT NULL)
    - stock (Integer, default=0)
    - image_url (TEXT)
    - active (Boolean, default=true)
    - status (Enum: PENDING, APPROVED, REJECTED)
    - rejection_reason (TEXT)
    - vendor_id (FK → users.id)
    - approved_by_id (FK → users.id)
    - approved_at (LocalDateTime)
    - rating (Double)
    - reviews (Integer)
    - created_at (LocalDateTime, NOT NULL)
    - updated_at (LocalDateTime)
}
```

**ÍNDICES:**
- `idx_product_category` - Búsquedas por categoría
- `idx_product_status` - Filtrar por estado
- `idx_product_vendor` - Productos de un vendedor
- `idx_product_active_status` - Productos activos y aprobados

---

### 3️⃣ **cart_items** (Carrito de Compras) ✅ **ARREGLADO HOY**
```java
// Archivo: CartItem.java
@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class CartItem {
    - id (Long, PK)
    - user_id (FK → users.id, NOT NULL)
    - product_id (FK → products.id, NOT NULL)
    - quantity (Integer, NOT NULL)
    - added_at (LocalDateTime, NOT NULL) ← ANTES: "created_at" (INCORRECTO)
    - updated_at (LocalDateTime, NOT NULL)
    
    CONSTRAINT: Un usuario NO puede tener 2 items del mismo producto
}
```

**PROBLEMA ARREGLADO:**
- ❌ ANTES: Columna mapeada a `created_at` pero BD esperaba `added_at` → NULL constraint violation
- ✅ AHORA: Columna correctamente mapeada a `added_at`

---

### 4️⃣ **favorites** (Productos Favoritos)
```java
// Archivo: Favorite.java
@Entity
@Table(name = "favorites", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class Favorite {
    - id (Long, PK)
    - user_id (FK → users.id, NOT NULL)
    - product_id (FK → products.id, NOT NULL)
    - created_at (LocalDateTime, NOT NULL)
    
    CONSTRAINT: Un usuario NO puede marcar 2 veces el mismo producto
}
```

---

### 5️⃣ **orders** (Órdenes de Compra)
```java
// Archivo: Order.java
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user", columnList = "user_id"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_user_status", columnList = "user_id, status"),
    @Index(name = "idx_order_created_at", columnList = "created_at")
})
public class Order {
    - id (Long, PK)
    - user_id (FK → users.id, NOT NULL)
    - status (Enum: PENDING, CONFIRMED, SHIPPED, DELIVERED)
    - subtotal (BigDecimal, precision=10, scale=2)
    - shipping (BigDecimal)
    - discount (BigDecimal)
    - total_amount (BigDecimal, precision=10, scale=2)
    - payment_method (String)
    - tracking_number (String)
    - shipping_address (TEXT)
    - notes (TEXT)
    - created_at (LocalDateTime, NOT NULL)
    - updated_at (LocalDateTime)
}
```

**ÍNDICES:**
- Búsquedas por usuario
- Filtros por estado
- Órdenes recientes

---

### 6️⃣ **order_items** (Items en las Órdenes)
```java
// Archivo: OrderItem.java
@Entity
@Table(name = "order_items")
public class OrderItem {
    - id (Long, PK)
    - order_id (FK → orders.id, NOT NULL)
    - product_id (FK → products.id, NOT NULL)
    - quantity (Integer, NOT NULL)
    - unit_price (BigDecimal, precision=10, scale=2, NOT NULL)
    - subtotal (BigDecimal, precision=10, scale=2, NOT NULL)
    - product_name (String) ← Snapshot del nombre al momento de la orden
    - product_image_url (TEXT) ← Snapshot de la imagen
    - created_at (LocalDateTime, NOT NULL)
}
```

---

### 7️⃣ **reviews** (Reseñas y Comentarios)
```java
// Archivo: Review.java
@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_product_id", columnList = "product_id"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
public class Review {
    - id (Long, PK)
    - product_id (FK → products.id, NOT NULL)
    - user_id (FK → users.id, NOT NULL)
    - rating (Integer, NOT NULL) ← 1-5 estrellas
    - comment (TEXT)
    - verified (Boolean, default=false) ← Solo si compró el producto
    - vendor_response (TEXT) ← Respuesta del vendedor
    - vendor_response_date (LocalDateTime)
    - created_at (LocalDateTime, NOT NULL)
    - updated_at (LocalDateTime)
}
```

**ÍNDICES:**
- Búsquedas por producto
- Búsquedas por usuario

---

### 8️⃣ **notifications** (Notificaciones del Sistema)
```java
// Archivo: Notification.java
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_read_status", columnList = "is_read")
})
public class Notification {
    - id (Long, PK)
    - user_id (FK → users.id, NOT NULL)
    - title (String, NOT NULL)
    - message (TEXT)
    - type (Enum: ORDER_CREATED, ORDER_SHIPPED, ORDER_DELIVERED, 
                 ORDER_CANCELLED, PRODUCT_LOW_STOCK, NEW_REVIEW, 
                 PRICE_DROP, PAYMENT_SUCCESS, PAYMENT_FAILED, SYSTEM)
    - is_read (Boolean, default=false)
    - metadata (TEXT) ← Info JSON adicional
    - created_at (LocalDateTime, NOT NULL, auto)
    - read_at (LocalDateTime)
}
```

**TIPOS DE NOTIFICACIONES:**
- Actualizaciones de órdenes
- Cambios en productos
- Reseñas nuevas
- Cambios de precio
- Pagos

---

### 9️⃣ **refresh_tokens** (Tokens JWT para Renovar Sesión)
```java
// Archivo: RefreshToken.java
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    - id (Long, PK)
    - token (String, NOT NULL, UNIQUE, length=500)
    - user_id (FK → users.id, NOT NULL)
    - expiry_date (LocalDateTime, NOT NULL)
    - revoked (Boolean, default=false)
    - created_at (LocalDateTime, NOT NULL)
}
```

**DURACIÓN:** 7 días
**USO:** Renovar access_token sin hacer login nuevamente

---

### 🔟 **password_reset_tokens** (Tokens para Resetear Contraseña)
```java
// Archivo: PasswordResetToken.java
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    - id (Long, PK)
    - token (String, NOT NULL, UNIQUE)
    - user_id (FK → users.id, NOT NULL)
    - expiry_date (LocalDateTime, NOT NULL)
    - used (Boolean, default=false)
    - created_at (LocalDateTime, NOT NULL)
}
```

**DURACIÓN:** 24 horas
**USO:** Permitir al usuario resetear contraseña olvidada

---

## ⚙️ CONFIGURACIÓN EN application.properties

```properties
# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
```

**`ddl-auto=update` SIGNIFICA:**
- ✅ Crea tablas nuevas automáticamente
- ✅ Actualiza estructura si cambias `@Entity`
- ❌ NO borra tablas existentes
- ❌ NO reinicia la base de datos

---

## 🔗 RELACIONES ENTRE TABLAS (Entity Relationships)

```
users (1) ──→ (N) cart_items           [Un usuario, muchos items en carrito]
users (1) ──→ (N) favorites            [Un usuario, muchos favoritos]
users (1) ──→ (N) orders               [Un usuario, muchas órdenes]
users (1) ──→ (N) reviews              [Un usuario, muchas reseñas]
users (1) ──→ (N) notifications        [Un usuario, muchas notificaciones]
users (1) ──→ (N) refresh_tokens       [Un usuario, múltiples sesiones activas]
users (1) ──→ (N) password_reset_tokens [Para resets de contraseña]

products (1) ──→ (N) cart_items        [Un producto, muchos en carritos]
products (1) ──→ (N) favorites         [Un producto, marcado por muchos usuarios]
products (1) ──→ (N) reviews           [Un producto, muchas reseñas]
products (1) ──→ (N) order_items       [Un producto, vendido en muchas órdenes]

orders (1) ──→ (N) order_items         [Una orden, múltiples items]
```

---

## 📊 DIAGRAMA ENTIDAD-RELACIÓN (E-R)

```
                    ┌─────────────┐
                    │    users    │
                    └─────────────┘
                       ↓  ↓  ↓  ↓
           ┌──────────┼──┼──┼──┼──────────┐
           ↓          ↓  ↓  ↓  ↓          ↓
      cart_items  favorites orders  reviews  notifications
           ↓                  ↓
           └──→ products ←────┴────→ order_items ←─┐
                    ↓                           ↓
              (indexes)                   (relaciones)
```

---

## ✅ ESTADO ACTUAL DE TABLAS (25/11/2025)

| Tabla | Registros | Estado | Notas |
|-------|-----------|--------|-------|
| users | ? | ✅ Operacional | Usuarios registrados |
| products | ? | ✅ Operacional | Catálogo activo |
| cart_items | 2 | ✅ **ARREGLADO HOY** | Carrito funcionando |
| favorites | 2 | ✅ Operacional | Productos favoritos |
| orders | ? | ✅ Operacional | Historial de órdenes |
| order_items | ? | ✅ Operacional | Items en órdenes |
| reviews | ? | ✅ Operacional | Reseñas de productos |
| notifications | 0 | ✅ Operacional | Vacía (puede usarse) |
| refresh_tokens | ? | ✅ Operacional | Sesiones activas |
| password_reset_tokens | ? | ✅ Operacional | Resets de contraseña |

---

## 🔧 ¿CÓMO AGREGAR UNA NUEVA TABLA?

**PASO 1:** Crear archivo en `backend/src/main/java/com/otakushop/entity/MiTabla.java`

```java
package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mi_tabla")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MiTabla {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    // ... más columnas
}
```

**PASO 2:** Reiniciar el backend
- Hibernate detectará automáticamente la anotación `@Entity`
- Creará la tabla en PostgreSQL
- ✅ ¡Listo!

---

## 🚀 PROCESO DE CREACIÓN AUTOMÁTICA

```
1. Backend inicia (mvn spring-boot:run)
    ↓
2. Spring Boot carga las clases @Entity
    ↓
3. Hibernate examina todas las anotaciones (@Entity, @Table, @Column, etc.)
    ↓
4. Conecta a PostgreSQL
    ↓
5. Para cada entidad:
   - Si tabla NO existe → CREA la tabla
   - Si tabla SÍ existe → COMPARA estructura
   - Si columnas falta → AGREGA columnas
   - Si indices no existen → CREA indices
    ↓
6. Registra cambios en flyway_schema_history
    ↓
7. Backend listo para usar ✅
```

---

## 📝 RESUMEN

✅ **Total de tablas:** 10 (todas funcionales)
✅ **Forma de crear:** Automáticamente desde `@Entity` en Java
✅ **Ubicación:** `backend/src/main/java/com/otakushop/entity/`
✅ **Sin tablas innecesarias** (todas sirven para el negocio)
✅ **Problema del carrito arreglado** (columna `added_at` correcta)

