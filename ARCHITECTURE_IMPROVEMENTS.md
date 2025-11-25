# 🏗️ MEJORAS DE ARQUITECTURA - OTAKU SHOP

**Documento de análisis y recomendaciones para pasar de prototipo a producción**

---

## 🔴 PUNTOS CRÍTICOS (Prioridad Alta)

### 1️⃣ DDL-AUTO + FLYWAY = CONFLICTO EN PRODUCCIÓN

**Estado Actual:**
```properties
spring.jpa.hibernate.ddl-auto=update  # en application.properties
```

**Problema:**
- ❌ `update` es peligroso en producción (cambios no controlados)
- ❌ Flyway y Hibernate DDL-Auto compiten por control de schema
- ❌ Sin versionamiento claro de cambios de BD
- ❌ Imposible rollback si falla migración

**Recomendación:**

#### Opción A: Flyway (Recomendado para producción)

**Estructura:**
```
backend/src/main/resources/db/migration/
├── V1__Initial_schema.sql
├── V2__Add_stock_reservations.sql
├── V3__Add_session_id_to_cart.sql
└── V4__Add_audit_columns.sql
```

**Cambios necesarios:**

1. **Agregar dependencia Flyway en `pom.xml`:**
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
    <version>9.22.3</version>
</dependency>

<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
    <version>9.22.3</version>
</dependency>
```

2. **Crear perfiles de Spring (`application-dev.properties` y `application-prod.properties`):**

**application-dev.properties:**
```properties
spring.jpa.hibernate.ddl-auto=update
# Flyway deshabilitado en dev
spring.flyway.enabled=false
```

**application-prod.properties:**
```properties
spring.jpa.hibernate.ddl-auto=validate
# Flyway habilitado en prod
spring.flyway.enabled=true
spring.flyway.baselineOnMigrate=true
```

3. **Crear `V1__Initial_schema.sql`** con el esquema actual (exportar desde BD):
```sql
-- V1__Initial_schema.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    provider VARCHAR(50),
    provider_id VARCHAR(255),
    role VARCHAR(50),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ... resto de tablas ...
```

4. **Cambiar `ddl-auto` a `validate`:**
```properties
# application.properties (por defecto para ambos perfiles)
spring.jpa.hibernate.ddl-auto=validate
```

**Ventajas:**
- ✅ Control total de cambios
- ✅ Versionamiento claro
- ✅ Rollback seguro
- ✅ Auditoría de cambios
- ✅ Compatible con CI/CD

---

### 2️⃣ CARRITO ANÓNIMO (Session ID)

**Estado Actual:**
```java
// CartItem.java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)  // ❌ NO permite anónimo
private User user;
```

**Problema:**
- ❌ No soporta carrito anónimo (compra sin login)
- ❌ No hay lógica de merge al login
- ❌ Session ID nunca se implementó

**Recomendación:**

**Cambio en `CartItem.java`:**
```java
@Entity
@Table(name = "cart_items", 
    uniqueConstraints = {
        // Permite solo UN item por user/producto
        @UniqueConstraint(columnNames = {"user_id", "product_id"}, 
                         name = "uk_cart_user_product"),
        // Permite solo UN item por session/producto
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
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ✅ NULLABLE: permite carrito anónimo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
    
    // ✅ NUEVO: Session ID para carritos anónimos
    @Column(name = "session_id", length = 100, nullable = true)
    private String sessionId;  // UUID generado en frontend
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // ✅ Validación: al menos user_id O session_id debe estar presente
    @PrePersist
    @PreUpdate
    public void validateOwnership() {
        if (user == null && sessionId == null) {
            throw new IllegalArgumentException("CartItem debe tener user_id o session_id");
        }
    }
}
```

**Lógica de merge al login (en `CartService.java`):**
```java
@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    /**
     * Merge carrito anónimo al carrito del usuario al hacer login
     */
    public void mergeAnonCartToUser(String sessionId, User user) {
        // Buscar items en carrito anónimo
        List<CartItem> anonItems = cartItemRepository
            .findBySessionIdAndUserIsNull(sessionId);
        
        for (CartItem anonItem : anonItems) {
            // Buscar si el usuario ya tiene este producto
            CartItem existingItem = cartItemRepository
                .findByUserAndProduct(user, anonItem.getProduct())
                .orElse(null);
            
            if (existingItem != null) {
                // ✅ Sumar cantidades
                existingItem.setQuantity(
                    existingItem.getQuantity() + anonItem.getQuantity()
                );
                cartItemRepository.save(existingItem);
                
                // Eliminar item anónimo
                cartItemRepository.delete(anonItem);
            } else {
                // ✅ Asignar item anónimo al usuario
                anonItem.setUser(user);
                anonItem.setSessionId(null);
                cartItemRepository.save(anonItem);
            }
        }
    }
}
```

**Frontend: Generar y mantener Session ID**
```javascript
// utils/sessionManager.js
export const getOrCreateSessionId = () => {
    let sessionId = sessionStorage.getItem('cartSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
};

// En CartContext.jsx
const [sessionId] = useState(() => getOrCreateSessionId());

// Al agregar al carrito (anónimo o logeado)
const addToCart = async (productId, quantity) => {
    const payload = {
        productId,
        quantity,
        sessionId: !user ? sessionId : undefined,  // Solo si no está logeado
    };
    // ... API call
};
```

**Endpoints actualizados:**
```java
// CartController.java

// Agregar al carrito (anónimo O logeado)
@PostMapping("/add")
public ResponseEntity<?> addToCart(
    @RequestBody CartItemRequest request,
    @RequestHeader(value = "X-Session-Id", required = false) String sessionId
) {
    String effectiveSessionId = sessionId;
    User user = null;
    
    if (isUserLoggedIn()) {
        user = getCurrentUser();
    } else {
        effectiveSessionId = request.getSessionId();
        if (effectiveSessionId == null || effectiveSessionId.isEmpty()) {
            return ResponseEntity.badRequest()
                .body("sessionId requerido para carrito anónimo");
        }
    }
    
    return cartService.addToCart(request, user, effectiveSessionId);
}

// Obtener carrito (anónimo O logeado)
@GetMapping
public ResponseEntity<?> getCart(
    @RequestHeader(value = "X-Session-Id", required = false) String sessionId
) {
    if (isUserLoggedIn()) {
        return ResponseEntity.ok(cartService.getCartByUser(getCurrentUser()));
    } else {
        return ResponseEntity.ok(cartService.getCartBySession(sessionId));
    }
}
```

**Tests para merge:**
```java
@Test
public void testMergeAnonCartToUser() {
    // 1. Agregar items con sessionId
    CartItem anonItem = createAnonCartItem(sessionId, productId, 2);
    
    // 2. Login del usuario (con item existente en carrito)
    User user = createUser();
    CartItem userItem = createUserCartItem(user, productId, 1);
    
    // 3. Merge
    cartService.mergeAnonCartToUser(sessionId, user);
    
    // 4. Verificar: cantidad se sumó (2+1=3), no hay items anónimos
    CartItem merged = cartItemRepository.findByUserAndProduct(user, product);
    assertThat(merged.getQuantity()).isEqualTo(3);
    assertThat(cartItemRepository.findBySessionIdAndUserIsNull(sessionId))
        .isEmpty();
}
```

---

### 3️⃣ RESERVA TEMPORAL DE STOCK (Anti-Oversell)

**Estado Actual:**
```java
// CartItem
- Agrega item al carrito sin reservar stock
- Products.stock puede bajar a negativo si 10 usuarios agregan el último item
```

**Problema:**
- ❌ Oversell (más ventas que stock disponible)
- ❌ Sin mecanismo de expiración de carritos
- ❌ Race conditions al decrementar stock

**Recomendación: Tabla `stock_reservations`**

**Crear entidad `StockReservation.java`:**
```java
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
public class StockReservation {
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
    
    @Column(name = "session_id", nullable = true)
    private String sessionId;
    
    @Column(nullable = false)
    private Integer quantity;
    
    // Expira después de 15 minutos (configurable)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "order_id", nullable = true)
    private Long orderId;  // NULL hasta que se confirme orden
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusMinutes(15);  // TTL: 15 min
        }
        createdAt = LocalDateTime.now();
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

**Actualizar `Product.java` para tracking de stock:**
```java
@Entity
@Table(name = "products", ...)
public class Product {
    // ... campos existentes ...
    
    @Column(name = "stock", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer stock;  // Stock disponible (sin reservas)
    
    // ✅ NUEVO: Campo calculado (no almacenado en BD)
    @Transient
    public Integer getAvailableStock() {
        // stock - reservas no expiradas
        return stock;  // Calcular en servicio con JOIN
    }
}
```

**Lógica en `CartService.java`:**
```java
@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private StockReservationRepository reservationRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    private static final int RESERVATION_TTL_MINUTES = 15;
    
    /**
     * Agregar item al carrito CON RESERVA de stock
     */
    public CartItemResponse addToCart(
        CartItemRequest request, 
        User user, 
        String sessionId
    ) throws InsufficientStockException {
        
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ProductNotFoundException());
        
        int requestedQty = request.getQuantity();
        int availableStock = getAvailableStock(product);
        
        if (availableStock < requestedQty) {
            throw new InsufficientStockException(
                "Stock insuficiente. Disponible: " + availableStock
            );
        }
        
        // ✅ 1. Crear reserva de stock
        StockReservation reservation = StockReservation.builder()
            .product(product)
            .user(user)
            .sessionId(sessionId)
            .quantity(requestedQty)
            .expiresAt(LocalDateTime.now().plusMinutes(RESERVATION_TTL_MINUTES))
            .build();
        
        reservationRepository.save(reservation);
        
        // ✅ 2. Crear/actualizar CartItem
        CartItem cartItem = cartItemRepository
            .findByUserAndProduct(user, product)
            .orElseGet(() -> CartItem.builder()
                .user(user)
                .sessionId(sessionId)
                .product(product)
                .quantity(0)
                .build()
            );
        
        // Sumar cantidad (si ya existe, incrementar)
        cartItem.setQuantity(cartItem.getQuantity() + requestedQty);
        cartItemRepository.save(cartItem);
        
        return CartItemMapper.toResponse(cartItem);
    }
    
    /**
     * Obtener stock disponible = stock - reservas activas
     */
    private int getAvailableStock(Product product) {
        int reservedQty = reservationRepository
            .sumQuantityByProductAndNotExpired(product.getId());
        
        return product.getStock() - reservedQty;
    }
    
    /**
     * Confirmar orden y convertir reservas en stock real
     */
    @Transactional
    public Order confirmOrder(User user, String sessionId) {
        // Obtener items del carrito
        List<CartItem> cartItems = cartItemRepository
            .findByUserOrSessionId(user, sessionId);
        
        // ✅ Dentro de transacción: bloquear productos y decrementar stock
        Order order = orderService.createOrder(user, cartItems);
        
        // Actualizar reservas con order_id y marcar como confirmadas
        for (CartItem item : cartItems) {
            List<StockReservation> reservations = reservationRepository
                .findByProductAndUserOrSessionId(
                    item.getProduct(), user, sessionId
                );
            
            for (StockReservation res : reservations) {
                res.setOrderId(order.getId());
                reservationRepository.save(res);
            }
        }
        
        // ✅ Decrementar stock actual (transacción con lock)
        decrementProductStock(cartItems);
        
        // ✅ Limpiar carrito
        cartItemRepository.deleteAll(cartItems);
        
        return order;
    }
    
    /**
     * Usar optimistic locking o SELECT FOR UPDATE
     */
    @Transactional
    private void decrementProductStock(List<CartItem> items) {
        for (CartItem item : items) {
            Product product = item.getProduct();
            
            // Verificar stock antes (verificación pesimista)
            if (product.getStock() < item.getQuantity()) {
                throw new InsufficientStockException(
                    "Stock faltante para producto: " + product.getName()
                );
            }
            
            // Decrementar stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);  // O usar UPDATE directo en BD
        }
    }
}
```

**Job para liberar reservas expiradas (scheduled task):**
```java
@Component
@RequiredArgsConstructor
@Slf4j
public class StockReservationCleanup {
    
    private final StockReservationRepository reservationRepository;
    
    @Scheduled(fixedRate = 300000)  // Cada 5 minutos
    public void releaseExpiredReservations() {
        try {
            List<StockReservation> expired = 
                reservationRepository.findByExpiresAtBeforeAndOrderIdIsNull(
                    LocalDateTime.now()
                );
            
            if (!expired.isEmpty()) {
                reservationRepository.deleteAll(expired);
                log.info("Liberadas {} reservas de stock expiradas", expired.size());
            }
        } catch (Exception e) {
            log.error("Error liberando reservas expiradas", e);
        }
    }
}
```

**Repositories:**
```java
public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {
    
    @Query("""
        SELECT COALESCE(SUM(sr.quantity), 0)
        FROM StockReservation sr
        WHERE sr.product.id = :productId
        AND sr.expiresAt > CURRENT_TIMESTAMP
        AND sr.orderId IS NULL
    """)
    int sumQuantityByProductAndNotExpired(@Param("productId") Long productId);
    
    List<StockReservation> findByExpiresAtBeforeAndOrderIdIsNull(LocalDateTime expiresAt);
    
    List<StockReservation> findByProductAndUserOrSessionId(
        Product product, User user, String sessionId
    );
}
```

**Tests:**
```java
@Test
public void testOversellPrevention() {
    Product product = createProduct(stock: 1);  // Solo 1 en stock
    
    // Usuario A agrega 1 al carrito
    cartService.addToCart(productId, 1, userA, null);
    
    // Usuario B intenta agregar 1 al carrito
    assertThrows(InsufficientStockException.class, () -> {
        cartService.addToCart(productId, 1, userB, null);
    });
}

@Test
public void testReservationExpiry() {
    // Crear reserva con TTL = 1 segundo
    StockReservation res = createReservation(expiresAt: now+1sec);
    
    // Esperar 2 segundos
    Thread.sleep(2000);
    
    // Ejecutar job de limpieza
    stockReservationCleanup.releaseExpiredReservations();
    
    // Verificar que se eliminó
    assertThat(reservationRepository.findById(res.getId()))
        .isEmpty();
}
```

---

### 4️⃣ VALIDACIONES: NOT NULL Y CONSTRAINTS FALTANTES

**Estado Actual:**
```java
// Products: name, category, status pueden ser NULL ❌
// Orders: subtotal, total_amount pueden ser NULL ❌
// Notifications: message puede ser NULL ❌
```

**Cambios necesarios en entidades:**

**Product.java:**
```java
@Entity
public class Product {
    // ...
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;  // ✅ NOT NULL
    
    @Column(name = "category", nullable = false, length = 100)
    private String category;  // ✅ NOT NULL
    
    @Column(name = "price", nullable = false, 
            columnDefinition = "DECIMAL(10,2)")
    private BigDecimal price;  // ✅ NOT NULL
    
    @Column(name = "stock", nullable = false, 
            columnDefinition = "INTEGER DEFAULT 0")
    private Integer stock;  // ✅ NOT NULL
    
    @Enumerated(EnumType.STRING)  // ✅ IMPORTANTE
    @Column(name = "status", nullable = false, length = 50)
    private ProductStatus status;  // ✅ NOT NULL
    
    @Enumerated(EnumType.STRING)  // ✅ IMPORTANTE
    @Column(name = "active", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean active;  // ✅ NOT NULL
}
```

**Order.java:**
```java
@Entity
public class Order {
    // ...
    
    @Column(name = "subtotal", nullable = false, 
            columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private BigDecimal subtotal;  // ✅ NOT NULL
    
    @Column(name = "shipping", nullable = false, 
            columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private BigDecimal shipping;  // ✅ NOT NULL
    
    @Column(name = "discount", nullable = false, 
            columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private BigDecimal discount;  // ✅ NOT NULL
    
    @Column(name = "total_amount", nullable = false, 
            columnDefinition = "DECIMAL(10,2)")
    private BigDecimal totalAmount;  // ✅ NOT NULL
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private OrderStatus status;  // ✅ NOT NULL
}
```

**Notification.java:**
```java
@Entity
public class Notification {
    // ...
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;  // ✅ NOT NULL
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;  // ✅ NOT NULL
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;  // ✅ NOT NULL
    
    @Column(name = "is_read", nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean isRead;  // ✅ NOT NULL
}
```

**User.java:**
```java
@Entity
public class User {
    // ...
    
    @Column(name = "email", nullable = false, length = 255, unique = true)
    private String email;  // ✅ NOT NULL + UNIQUE
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;  // ✅ NOT NULL
    
    @Enumerated(EnumType.STRING)  // ✅ STRING no ORDINAL
    @Column(name = "role", nullable = false, length = 50)
    private Role role;  // ✅ NOT NULL
    
    @Column(name = "enabled", nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean enabled;  // ✅ NOT NULL
}
```

---

### 5️⃣ ENUMS: USAR STRING EN LUGAR DE ORDINAL

**Problema:**
- Si reordenas enum → ordinal cambia → datos rotos en BD
- Ordinal es poco legible en queries SQL

**Solución: `@Enumerated(EnumType.STRING)`**

**Cambios en TODAS las entidades con enums:**

```java
// ❌ ANTES
@Enumerated(EnumType.ORDINAL)
@Column(name = "role")
private Role role;

// ✅ DESPUÉS
@Enumerated(EnumType.STRING)
@Column(name = "role", length = 50)
private Role role;
```

**Aplicar a:**
- `User.role` → EnumType.STRING
- `User.provider` → EnumType.STRING
- `Product.status` → EnumType.STRING
- `Order.status` → EnumType.STRING
- `Notification.type` → EnumType.STRING

**Enums que deben ser STRING:**
```java
public enum Role {
    CLIENTE,
    VENDEDOR,
    ADMIN,
    SUPERADMIN
}

public enum AuthProvider {
    LOCAL,
    GOOGLE,
    FACEBOOK
}

public enum ProductStatus {
    PENDING,      // Espera aprobación
    APPROVED,     // Aprobado
    REJECTED      // Rechazado
}

public enum OrderStatus {
    PENDING,      // Pagamento pendiente
    CONFIRMED,    // Confirmada y pagada
    SHIPPED,      // Enviada
    DELIVERED,    // Entregada
    CANCELLED     // Cancelada
}

public enum NotificationType {
    ORDER_CREATED,
    ORDER_SHIPPED,
    ORDER_DELIVERED,
    ORDER_CANCELLED,
    PRODUCT_LOW_STOCK,
    NEW_REVIEW,
    PRICE_DROP,
    PAYMENT_SUCCESS,
    PAYMENT_FAILED,
    SYSTEM
}
```

---

### 6️⃣ TRANSACCIONES Y LOCKING PARA STOCK

**Problema:**
```
T1: SELECT stock FROM products WHERE id=1  → 10
T2: SELECT stock FROM products WHERE id=1  → 10
T1: UPDATE products SET stock=9 WHERE id=1
T2: UPDATE products SET stock=9 WHERE id=1  ❌ Race condition
```

**Solución: Optimistic Locking con `@Version`**

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "stock", nullable = false)
    private Integer stock;
    
    // ✅ Agregar versión para optimistic locking
    @Version
    @Column(name = "version")
    private Long version;
}
```

**Uso en servicio:**
```java
@Transactional
public void decrementStock(Long productId, int quantity) {
    try {
        Product product = productRepository.findById(productId)
            .orElseThrow();
        
        if (product.getStock() < quantity) {
            throw new InsufficientStockException();
        }
        
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
        // Si version cambió → OptimisticLockingFailureException
        
    } catch (ObjectOptimisticLockingFailureException e) {
        log.warn("Stock cambió, reintentando...");
        // Reintentar lógica
        throw new RetryableException(e);
    }
}
```

**Alternativa: Pessimistic Locking (SELECT FOR UPDATE)**
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}

@Transactional
public void decrementStockSafe(Long productId, int quantity) {
    Product product = productRepository.findByIdForUpdate(productId)
        .orElseThrow();
    
    if (product.getStock() < quantity) {
        throw new InsufficientStockException();
    }
    
    product.setStock(product.getStock() - quantity);
    productRepository.save(product);  // Bloquea hasta commit
}
```

---

### 7️⃣ AUDITORÍA: CREATED_BY, UPDATED_BY

**Recomendación: Crear clase base `AuditableEntity`**

```java
@MappedSuperclass
@Data
public class AuditableEntity {
    
    @Column(name = "created_by", length = 255)
    private String createdBy;  // Email del usuario
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_by", length = 255)
    private String updatedBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        createdBy = getCurrentUser();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updatedBy = getCurrentUser();
    }
    
    private String getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null ? auth.getName() : "SYSTEM";
        } catch (Exception e) {
            return "SYSTEM";
        }
    }
}

// ✅ Heredar en entidades
@Entity
public class Product extends AuditableEntity {
    // ... campos ...
}

@Entity
public class Order extends AuditableEntity {
    // ... campos ...
}
```

---

### 8️⃣ SOFT DELETE (BORRADO LÓGICO)

**Recomendación: Agregar `deleted_at` en lugar de borrar físicamente**

```java
@Entity
@SQLDelete(sql = "UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Product extends AuditableEntity {
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Al hacer delete(), se ejecuta el SQL custom
}

// En queries: automáticamente filtra deleted_at IS NULL
```

---

### 9️⃣ ALMACENAMIENTO DE IMÁGENES

**Opción A: Local (Para desarrollo/prototipo)**
```java
// Endpoint para servir imágenes estáticas
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:./uploads/")
            .setCachePeriod(3600);  // Cache 1 hora
    }
}

// ProductService
@Service
public class ProductService {
    private static final String UPLOAD_DIR = "uploads/images/";
    
    public String saveProductImage(MultipartFile file) throws IOException {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filepath = Paths.get(UPLOAD_DIR, filename);
        
        Files.createDirectories(filepath.getParent());
        Files.copy(file.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
        
        return "/uploads/images/" + filename;  // URL para BD
    }
}
```

**Opción B: S3 (Para producción - Recomendado)**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.24.0</version>
</dependency>
```

```java
@Service
public class S3ImageService {
    
    @Value("${aws.s3.bucket}")
    private String bucketName;
    
    @Autowired
    private S3Client s3Client;
    
    public String uploadImage(MultipartFile file) throws IOException {
        String key = "products/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build(),
            RequestBody.fromBytes(file.getBytes())
        );
        
        return String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
    }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Configuración (1-2 días)
- [ ] Crear `application-dev.properties` y `application-prod.properties`
- [ ] Agregar Flyway dependency en `pom.xml`
- [ ] Crear `V1__Initial_schema.sql` con schema actual
- [ ] Cambiar `ddl-auto` a `validate` en `application.properties`
- [ ] Cambiar `ddl-auto` a `update` en `application-dev.properties`

### Fase 2: Carrito Anónimo (2-3 días)
- [ ] Actualizar `CartItem` con `session_id` nullable y validaciones
- [ ] Crear método `mergeAnonCartToUser` en `CartService`
- [ ] Actualizar endpoints `/api/cart/add` y `/api/cart` para soportar sessionId
- [ ] Generar UUID en frontend y enviar en headers
- [ ] Tests de merge

### Fase 3: Reserva de Stock (3-4 días)
- [ ] Crear entidad `StockReservation`
- [ ] Crear `StockReservationRepository` con queries
- [ ] Actualizar `CartService.addToCart` para reservar stock
- [ ] Implementar `confirmOrder` con decremento transaccional
- [ ] Crear job `StockReservationCleanup` schedulado
- [ ] Tests de oversell prevention y expiry

### Fase 4: Validaciones y Constraints (1-2 días)
- [ ] Revisar y agregar `@Column(nullable=false)` en TODAS las entidades
- [ ] Usar `@Enumerated(EnumType.STRING)` en todos los enums
- [ ] Crear migration SQL para actualizar existing constraints

### Fase 5: Auditoría y Soft Delete (1-2 días)
- [ ] Crear `AuditableEntity` base class
- [ ] Heredar en Product, Order, User, Review
- [ ] Agregar `deleted_at` en Product y User
- [ ] Usar `@SQLDelete` y `@Where`
- [ ] Migration para agregar columnas

### Fase 6: Transacciones y Locking (1 día)
- [ ] Agregar `@Version` en Product
- [ ] Implementar optimistic locking en stock decrement
- [ ] Tests de race conditions
- [ ] Considerar pessimistic locking si es necesario

### Fase 7: Almacenamiento de Imágenes (1-2 días)
- [ ] Para dev: configurar static resource handler local
- [ ] Para prod: migrar a S3 con AWS SDK
- [ ] Crear ImageService abstracto con implementaciones

**Total estimado: 10-15 días de desarrollo**

---

## 🔍 VALIDACIÓN DE BASE DE DATOS ANTES DE CAMBIOS

Exportar schema actual:
```bash
pg_dump -U postgres -d otaku_shop --schema-only > backend/src/main/resources/db/migration/V1__Initial_schema.sql
```

Verificar constraints:
```sql
SELECT * FROM information_schema.table_constraints 
WHERE table_schema = 'public';

SELECT * FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

---

## 📚 REFERENCIAS

- **Flyway Docs:** https://flywaydb.org/documentation
- **Hibernate Versioning:** https://docs.jboss.org/hibernate/orm/6.3/userguide/html_single/Hibernate_User_Guide.html#locking
- **Spring Security + Auditing:** https://www.baeldung.com/spring-data-jpa-auditing
- **AWS S3 SDK v2:** https://docs.aws.amazon.com/sdk-for-java/

