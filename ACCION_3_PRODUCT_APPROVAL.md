# 🎯 ACCIÓN 3: Product Approval Endpoints

**Fase:** Crítica 3/4  
**Tiempo Estimado:** 6 horas  
**Impacto:** Admin puede controlar qué productos se venden  
**Status:** POR HACER  

---

## 📋 DESCRIPCIÓN

Los vendedores crean productos, pero el Admin debe aprobarlos antes de que aparezcan en la tienda. Esta acción implementa el workflow de aprobación de productos.

---

## 🎯 OBJECTIVOS

1. ✅ Agregar campo `status` a Product (PENDING, APPROVED, REJECTED)
2. ✅ Crear endpoints de aprobación/rechazo
3. ✅ Proteger endpoints solo para Admin/Superadmin
4. ✅ Crear lista de productos pendientes
5. ✅ Agregar logs de auditoría

---

## 📁 ARCHIVOS A MODIFICAR

### 1. Product.java Entity (Modificar)

**Ubicación:** `backend/src/main/java/com/otakushop/entity/Product.java`

**Cambios:**
- Agregar enum `ProductStatus` (PENDING, APPROVED, REJECTED)
- Agregar campo `status` con valor por defecto `PENDING`
- Agregar campo `rejectionReason` (nullable)
- Agregar campo `approvedAt` (timestamp)
- Agregar campo `approvedBy` (usuario admin)

```java
package com.otakushop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private BigDecimal originalPrice;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private Integer stock = 0;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    private Double rating = 0.0;
    
    private Integer reviews = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private User vendor;
    
    private Boolean active = true;
    
    // NUEVOS CAMPOS PARA APROBACIÓN
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
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
}

// ENUM para estados
public enum ProductStatus {
    PENDING("Pendiente de aprobación"),
    APPROVED("Aprobado"),
    REJECTED("Rechazado");
    
    private final String description;
    
    ProductStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

---

### 2. ProductRepository.java (Agregar Métodos)

**Ubicación:** `backend/src/main/java/com/otakushop/repository/ProductRepository.java`

**Agregar métodos:**

```java
// Métodos a agregar
List<Product> findByStatus(ProductStatus status);
List<Product> findByStatusAndActiveTrue(ProductStatus status);
List<Product> findByStatusAndVendorId(ProductStatus status, Long vendorId);

// Ejemplo completo:
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByStatus(ProductStatus status);
    
    List<Product> findByStatusAndActiveTrue(ProductStatus status);
    
    List<Product> findByStatusAndVendorId(ProductStatus status, Long vendorId);
    
    List<Product> findByVendorId(Long vendorId);
    
    // ... otros métodos existentes
}
```

---

### 3. ProductController.java (Agregar Endpoints)

**Ubicación:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

**Agregar estos 3 endpoints:**

```java
package com.otakushop.controller;

import com.otakushop.dto.ProductDTO;
import com.otakushop.entity.ProductStatus;
import com.otakushop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    // ... endpoints existentes ...
    
    /**
     * GET /api/products/pending - Obtiene productos pendientes de aprobación
     * Solo para ADMIN y SUPERADMIN
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getPendingProducts() {
        List<ProductDTO> pendingProducts = productService.getPendingProducts();
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", pendingProducts);
        response.put("count", pendingProducts.size());
        response.put("message", "Productos pendientes obtenidos exitosamente");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * POST /api/products/{id}/approve - Aprueba un producto
     * Solo para ADMIN y SUPERADMIN
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> approveProduct(@PathVariable Long id) {
        ProductDTO approvedProduct = productService.approveProduct(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("product", approvedProduct);
        response.put("message", "Producto aprobado exitosamente");
        response.put("status", "APPROVED");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * POST /api/products/{id}/reject - Rechaza un producto
     * Solo para ADMIN y SUPERADMIN
     * Request body: { "reason": "Razón del rechazo" }
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> rejectProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRejectionRequest request) {
        
        ProductDTO rejectedProduct = productService.rejectProduct(id, request.getReason());
        
        Map<String, Object> response = new HashMap<>();
        response.put("product", rejectedProduct);
        response.put("message", "Producto rechazado exitosamente");
        response.put("status", "REJECTED");
        response.put("reason", request.getReason());
        
        return ResponseEntity.ok(response);
    }
}

// DTO para el rechazo
class ProductRejectionRequest {
    @NotBlank(message = "La razón del rechazo es requerida")
    private String reason;
    
    // Getters y setters
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
```

---

### 4. ProductService.java (Agregar Métodos)

**Ubicación:** `backend/src/main/java/com/otakushop/service/ProductService.java`

**Agregar métodos:**

```java
package com.otakushop.service;

import com.otakushop.dto.ProductDTO;
import com.otakushop.entity.Product;
import com.otakushop.entity.ProductStatus;
import com.otakushop.exception.ResourceNotFoundException;
import com.otakushop.repository.ProductRepository;
import com.otakushop.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final SecurityUtil securityUtil;
    private final UserRepository userRepository;
    
    // ... métodos existentes ...
    
    /**
     * Obtiene todos los productos pendientes de aprobación
     */
    public List<ProductDTO> getPendingProducts() {
        return productRepository.findByStatus(ProductStatus.PENDING)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Aprueba un producto
     */
    public ProductDTO approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        
        // Validar que esté en estado PENDING
        if (product.getStatus() != ProductStatus.PENDING) {
            throw new IllegalArgumentException(
                "Solo se pueden aprobar productos en estado PENDING. Estado actual: " + product.getStatus()
            );
        }
        
        // Obtener admin actual
        Long adminId = securityUtil.getCurrentUserId();
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        // Aprobar producto
        product.setStatus(ProductStatus.APPROVED);
        product.setApprovedAt(LocalDateTime.now());
        product.setApprovedBy(admin);
        product.setRejectionReason(null); // Limpiar razón de rechazo si existía
        
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }
    
    /**
     * Rechaza un producto
     */
    public ProductDTO rejectProduct(Long productId, String reason) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        
        // Validar que esté en estado PENDING
        if (product.getStatus() != ProductStatus.PENDING) {
            throw new IllegalArgumentException(
                "Solo se pueden rechazar productos en estado PENDING. Estado actual: " + product.getStatus()
            );
        }
        
        // Validar razón
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Debe proporcionar una razón para rechazar el producto");
        }
        
        // Obtener admin actual
        Long adminId = securityUtil.getCurrentUserId();
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        // Rechazar producto
        product.setStatus(ProductStatus.REJECTED);
        product.setApprovedAt(LocalDateTime.now());
        product.setApprovedBy(admin);
        product.setRejectionReason(reason);
        product.setActive(false); // Desactivar producto rechazado
        
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }
    
    /**
     * Convierte Product a ProductDTO
     */
    private ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
            .id(product.getId())
            .name(product.getName())
            .description(product.getDescription())
            .price(product.getPrice())
            .originalPrice(product.getOriginalPrice())
            .category(product.getCategory())
            .stock(product.getStock())
            .imageUrl(product.getImageUrl())
            .rating(product.getRating())
            .reviews(product.getReviews())
            .vendorId(product.getVendor().getId())
            .vendorName(product.getVendor().getName())
            .active(product.getActive())
            .status(product.getStatus().name())
            .rejectionReason(product.getRejectionReason())
            .approvedAt(product.getApprovedAt())
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }
}
```

---

## 🗄️ CAMBIOS EN BASE DE DATOS

**Script SQL (Flyway):** `V6__Add_Product_Status.sql`

```sql
-- Agregar nuevas columnas a tabla products
ALTER TABLE products ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE products ADD COLUMN rejection_reason TEXT;
ALTER TABLE products ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE products ADD COLUMN approved_by_id BIGINT;

-- Agregar foreign key
ALTER TABLE products ADD CONSTRAINT fk_product_approved_by 
    FOREIGN KEY (approved_by_id) REFERENCES users(id);

-- Crear índice para búsquedas frecuentes
CREATE INDEX idx_product_status ON products(status);
CREATE INDEX idx_product_status_active ON products(status, active);
```

---

## 🧪 TEST CASES

### TEST 1: Obtener productos pendientes
```bash
# Solo Admin/Superadmin
GET /api/products/pending

Esperado: 200 OK
{
  "products": [...],
  "count": 5,
  "message": "Productos pendientes obtenidos exitosamente"
}
```

### TEST 2: Aprobar un producto
```bash
POST /api/products/{id}/approve

Esperado: 200 OK
{
  "product": {..., "status": "APPROVED", "approvedAt": "2025-11-22T16:30:00"},
  "message": "Producto aprobado exitosamente",
  "status": "APPROVED"
}
```

### TEST 3: Rechazar un producto
```bash
POST /api/products/{id}/reject
Body: {
  "reason": "Imágenes de baja calidad"
}

Esperado: 200 OK
{
  "product": {..., "status": "REJECTED", "rejectionReason": "Imágenes de baja calidad"},
  "message": "Producto rechazado exitosamente",
  "status": "REJECTED"
}
```

### TEST 4: Cliente intenta aprobar (sin permiso)
```bash
POST /api/products/{id}/approve
Authorization: Bearer [token-cliente]

Esperado: 403 Forbidden
{
  "message": "Access denied"
}
```

### TEST 5: Aprobar producto ya aprobado (error)
```bash
POST /api/products/{id}/approve
(cuando status ya es APPROVED)

Esperado: 400 Bad Request
{
  "message": "Solo se pueden aprobar productos en estado PENDING..."
}
```

---

## 🔐 SEGURIDAD

✅ Endpoints protegidos con `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")`  
✅ Validación de estado del producto  
✅ Log de quién aprobó/rechazó  
✅ Solo admin puede ver razón de rechazo  

---

## 📊 MÉTRICAS

| Métrica | Valor |
|---------|-------|
| Archivos a modificar | 4 |
| Líneas de código | ~250 |
| Nuevos endpoints | 3 |
| Test cases | 5+ |
| Tiempo estimado | 6 horas |

---

## ✅ CHECKLIST

```
[ ] Crear/modificar Product.java (agregar status, rejectionReason, etc.)
[ ] Crear ProductStatus enum
[ ] Modificar ProductRepository (agregar métodos de búsqueda)
[ ] Modificar ProductController (agregar 3 endpoints)
[ ] Modificar ProductService (agregar lógica de aprobación)
[ ] Crear ProductRejectionRequest DTO
[ ] Crear script SQL Flyway (V6)
[ ] Compilar: mvn clean package -DskipTests
[ ] Iniciar backend
[ ] Probar 5+ test cases
[ ] Documentar en progress tracker
```

---

**Documento Generado:** 22 Nov, 16:35  
**Próxima Acción:** ACCIÓN 3  
**Tiempo Estimado:** 6 horas (Martes 09:00-15:00)
