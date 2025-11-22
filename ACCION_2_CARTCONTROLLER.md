# 🚀 ACCIÓN 2: Implementar CartController

**Prioridad**: 🔴 CRÍTICA  
**Tiempo Estimado**: 8 horas  
**Impacto**: Clientes pueden agregar/modificar carrito  
**Status**: ❌ POR HACER

---

## 📋 PASO A PASO

### PASO 1: Crear CartController (2 horas)

**Ubicación**: `backend/src/main/java/com/otakushop/controller/CartController.java`

**Código**:
```java
package com.otakushop.controller;

import com.otakushop.dto.CartItemDTO;
import com.otakushop.dto.CartItemRequest;
import com.otakushop.dto.CartItemUpdateRequest;
import com.otakushop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CartItemDTO>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            cartService.getCartItems(userDetails.getUsername())
        );
    }

    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartItemDTO> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartItemRequest request) {
        return ResponseEntity.status(201).body(
            cartService.addItem(userDetails.getUsername(), request)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody CartItemUpdateRequest request) {
        return ResponseEntity.ok(
            cartService.updateItem(userDetails.getUsername(), id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        cartService.removeItem(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
```

---

### PASO 2: Crear CartService (2 horas)

**Ubicación**: `backend/src/main/java/com/otakushop/service/CartService.java`

**Código**:
```java
package com.otakushop.service;

import com.otakushop.dto.CartItemDTO;
import com.otakushop.dto.CartItemRequest;
import com.otakushop.dto.CartItemUpdateRequest;
import com.otakushop.entity.CartItem;
import com.otakushop.entity.Product;
import com.otakushop.entity.User;
import com.otakushop.repository.CartItemRepository;
import com.otakushop.repository.ProductRepository;
import com.otakushop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<CartItemDTO> getCartItems(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return cartItemRepository.findByUserId(user.getId())
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public CartItemDTO addItem(String email, CartItemRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Buscar si el producto ya está en el carrito
        CartItem existingItem = cartItemRepository.findByUserIdAndProductId(
            user.getId(), 
            request.getProductId()
        ).orElse(null);

        if (existingItem != null) {
            // Si existe, aumentar cantidad
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
            return convertToDTO(existingItem);
        }

        // Si no existe, crear nuevo item
        CartItem cartItem = CartItem.builder()
            .user(user)
            .product(product)
            .quantity(request.getQuantity())
            .build();

        return convertToDTO(cartItemRepository.save(cartItem));
    }

    public CartItemDTO updateItem(String email, Long itemId, CartItemUpdateRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        CartItem cartItem = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item del carrito no encontrado"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No autorizado");
        }

        cartItem.setQuantity(request.getQuantity());
        return convertToDTO(cartItemRepository.save(cartItem));
    }

    public void removeItem(String email, Long itemId) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        CartItem cartItem = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No autorizado");
        }

        cartItemRepository.delete(cartItem);
    }

    public void clearCart(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        cartItemRepository.deleteByUserId(user.getId());
    }

    private CartItemDTO convertToDTO(CartItem cartItem) {
        return CartItemDTO.builder()
            .id(cartItem.getId())
            .productId(cartItem.getProduct().getId())
            .productName(cartItem.getProduct().getTitle())
            .productPrice(cartItem.getProduct().getPrice())
            .quantity(cartItem.getQuantity())
            .subtotal(cartItem.getProduct().getPrice().multiply(java.math.BigDecimal.valueOf(cartItem.getQuantity())))
            .build();
    }
}
```

---

### PASO 3: Crear CartItem Entity (1 hora)

**Ubicación**: `backend/src/main/java/com/otakushop/entity/CartItem.java`

**Código**:
```java
package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 1;
}
```

---

### PASO 4: Crear CartItemRepository (30 min)

**Ubicación**: `backend/src/main/java/com/otakushop/repository/CartItemRepository.java`

**Código**:
```java
package com.otakushop.repository;

import com.otakushop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserId(Long userId);
}
```

---

### PASO 5: Crear DTOs (1 hora)

**CartItemDTO.java**:
```java
package com.otakushop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
```

**CartItemRequest.java**:
```java
package com.otakushop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    private Long productId;
    private Integer quantity = 1;
}
```

**CartItemUpdateRequest.java**:
```java
package com.otakushop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemUpdateRequest {
    private Integer quantity;
}
```

---

### PASO 6: Crear tabla en BD (30 min)

Ejecutar en PostgreSQL:
```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);
```

---

### PASO 7: Compilar y Probar (1.5 horas)

```powershell
# 1. Compilar
cd backend
mvn clean package -DskipTests

# 2. Si hay errores:
# - Asegúrate de que CartItemRepository está importado
# - Verifica que las anotaciones de Entity sean correctas
# - Revisa que User y Product existan

# 3. Reiniciar backend
# Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
# java -jar target/otaku-shop-backend-0.1.0.jar
```

---

## 🧪 PRUEBAS

### Test 1: Obtener carrito vacío
```bash
curl -X GET "http://localhost:8080/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Esperado: HTTP 200 con []
```

### Test 2: Agregar al carrito
```bash
curl -X POST "http://localhost:8080/api/cart/add" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
# Esperado: HTTP 201 con CartItemDTO
```

### Test 3: Obtener carrito con items
```bash
curl -X GET "http://localhost:8080/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Esperado: HTTP 200 con lista de items
```

### Test 4: Actualizar cantidad
```bash
curl -X PUT "http://localhost:8080/api/cart/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
# Esperado: HTTP 200 actualizado
```

### Test 5: Eliminar del carrito
```bash
curl -X DELETE "http://localhost:8080/api/cart/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Esperado: HTTP 204
```

### Test 6: Limpiar todo
```bash
curl -X DELETE "http://localhost:8080/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Esperado: HTTP 204
```

---

## ✅ CHECKLIST

```
[ ] 1. Crear CartController.java
[ ] 2. Crear CartService.java
[ ] 3. Crear CartItem Entity
[ ] 4. Crear CartItemRepository
[ ] 5. Crear DTOs (CartItemDTO, CartItemRequest, CartItemUpdateRequest)
[ ] 6. Crear tabla cart_items en BD
[ ] 7. Compilar: mvn clean package -DskipTests
[ ] 8. Reiniciar backend
[ ] 9. Ejecutar Test 1 (GET - vacío)
[ ] 10. Ejecutar Test 2 (POST add)
[ ] 11. Ejecutar Test 3 (GET - con items)
[ ] 12. Ejecutar Test 4 (PUT update)
[ ] 13. Ejecutar Test 5 (DELETE single)
[ ] 14. Ejecutar Test 6 (DELETE all)
[ ] 15. Documentar resultados
```

---

## 🎯 RESULTADO ESPERADO

Después de completar ACCIÓN 2:
- ✅ Clientes pueden agregar productos al carrito
- ✅ Clientes pueden ver su carrito
- ✅ Clientes pueden modificar cantidades
- ✅ Clientes pueden limpiar carrito
- ✅ Carrito persiste en servidor (BD)
- 📊 Sistema: 45% → 55% funcional

---

## 📞 AYUDA

Si hay errores de compilación:
1. Verifica que las clases existan (CartItem, DTOs)
2. Revisa imports
3. Asegúrate que anotaciones sean correctas
4. Si faltan dependencias, agrégalas a pom.xml

