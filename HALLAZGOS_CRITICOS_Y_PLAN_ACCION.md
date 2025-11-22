# 🚨 HALLAZGOS CRÍTICOS Y PLAN DE ACCIÓN INMEDIATA

**Estado del Sistema**: ⚠️ **45% INCOMPLETO - NO LISTO PARA PRODUCCIÓN**

---

## 📌 HALLAZGOS CRÍTICOS (DEBE FIJAR AHORA)

### 🔴 CRÍTICO-001: create-superadmin ENDPOINT ES PÚBLICO

**Ubicación**: `AuthController.java`, método `createSuperAdmin()`

**Código Actual** (INSEGURO):
```java
@PostMapping("/create-superadmin")
public ResponseEntity<AuthResponse> createSuperAdmin(
    @RequestBody RegisterRequest request) {
    // Cualquiera puede crear SUPERADMIN
}
```

**Riesgo**: Cualquiera puede crear cuentas con privilegios máximos

**FIX EN 30 SEGUNDOS**:
```java
@PreAuthorize("hasRole('SUPERADMIN')")  // ← Agregar esto
@PostMapping("/create-superadmin")
public ResponseEntity<AuthResponse> createSuperAdmin(
    @RequestBody RegisterRequest request) {
}
```

**Acciones**:
1. Abrir `backend/src/main/java/com/otakushop/controller/AuthController.java`
2. Agregar `@PreAuthorize("hasRole('SUPERADMIN')")` antes de `createSuperAdmin()`
3. Compilar: `mvn clean package -DskipTests`
4. Reiniciar backend
5. Verificar: Intentar crear superadmin sin autenticación → debe dar 403

**Tiempo**: ~5 minutos

---

### 🔴 CRÍTICO-002: NO EXISTE SISTEMA DE CARRITO

**Impacto**: Clientes NO pueden hacer compras

**Qué falta**:
- [ ] CartController.java (no existe)
- [ ] CartService.java (no existe)
- [ ] CartRepository.java (no existe)
- [ ] Tabla `cart_items` en BD (probablemente no existe)

**Endpoints que deben existir**:
```java
@GetMapping         // GET /api/cart
@PostMapping        // POST /api/cart/add
@PutMapping("/{id}")// PUT /api/cart/{id}
@DeleteMapping("/{id}") // DELETE /api/cart/{id}
@DeleteMapping      // DELETE /api/cart (limpiar todo)
```

**Tiempo Estimado**: 8-12 horas

**Prioridad**: 🔴 MÁXIMA

---

### 🔴 CRÍTICO-003: NO EXISTE APROBACIÓN DE PRODUCTOS

**Impacto**: Admin NO puede aprobar productos de vendedores

**Qué falta**:
- [ ] Endpoint `POST /api/products/{id}/approve`
- [ ] Endpoint `POST /api/products/{id}/reject`
- [ ] Endpoint `GET /api/products/pending`
- [ ] Lógica para cambiar estado del producto
- [ ] Validación: NO ver productos POSTULADOS en catálogo público

**Código a agregar en ProductController**:
```java
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
@PostMapping("/{id}/approve")
public ResponseEntity<ProductDTO> approveProduct(@PathVariable Long id) {
    Product product = productService.getProductById(id);
    product.setStatus(ProductStatus.APROBADO);
    productService.updateProduct(id, product, product.getVendorId());
    return ResponseEntity.ok(new ProductDTO(product));
}

@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
@PostMapping("/{id}/reject")
public ResponseEntity<?> rejectProduct(
    @PathVariable Long id,
    @RequestParam String reason) {
    Product product = productService.getProductById(id);
    product.setStatus(ProductStatus.CANCELADO);
    productService.updateProduct(id, product, product.getVendorId());
    // TODO: Enviar email al vendedor
    return ResponseEntity.ok("Producto rechazado");
}

@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
@GetMapping("/pending")
public ResponseEntity<List<ProductDTO>> getPendingProducts() {
    return ResponseEntity.ok(
        productService.getProductsByStatus(ProductStatus.POSTULADO)
            .stream()
            .map(ProductDTO::new)
            .collect(Collectors.toList())
    );
}
```

**Tiempo Estimado**: 6-8 horas

**Prioridad**: 🔴 MÁXIMA

---

### 🔴 CRÍTICO-004: NO EXISTE MÓDULO DE ÓRDENES

**Impacto**: Clientes NO pueden comprar

**Qué falta**:
- [ ] OrderController.java (puede existir parcial)
- [ ] OrderService.java (puede existir parcial)
- [ ] Endpoints: POST, GET, GET/{id}, DELETE
- [ ] Validación de stock
- [ ] Cálculo de totales
- [ ] Estados de orden

**Endpoints Necesarios**:
```java
@PostMapping                // POST /api/orders (crear)
@GetMapping                 // GET /api/orders (listar del usuario)
@GetMapping("/{id}")        // GET /api/orders/{id} (detalle)
@PostMapping("/{id}/cancel")// POST /api/orders/{id}/cancel (cancelar)
@GetMapping("/{id}/invoice")// GET /api/orders/{id}/invoice (PDF)
```

**Flujo de Creación de Orden**:
```
Cliente hace POST /orders con:
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
  ↓
Validar: usuario existe ✓
  ↓
Validar: productos existen ✓
  ↓
Validar: stock suficiente ✓
  ↓
Calcular total (sum(price * quantity))
  ↓
Crear registro en orders tabla
  ↓
Crear registros en order_items tabla
  ↓
Actualizar stock de productos
  ↓
Retornar orden creada
```

**Tiempo Estimado**: 16-24 horas

**Prioridad**: 🔴 MÁXIMA

---

## 🟠 HALLAZGOS MAYORES

### MAYOR-001: NO hay verificación de EMAIL

**Qué funciona**:
- ✅ Registro acepta email
- ✅ Usuario se crea en BD

**Qué NO funciona**:
- ❌ No se envía email de confirmación
- ❌ Usuario puede loguear sin verificar email
- ❌ No hay endpoint para reenviar email

**Implementación Necesaria**:
1. Agregar tabla `email_verifications`:
```sql
CREATE TABLE email_verifications (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP
);
```

2. Crear EmailService:
```java
@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendVerificationEmail(User user, String token) {
        String verificationUrl = 
            "http://localhost:5173/verify?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Verifica tu cuenta en Otaku Shop");
        message.setText("Click aquí: " + verificationUrl);
        
        mailSender.send(message);
    }
}
```

3. Modificar AuthController:
```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    User user = authService.register(request);
    String verificationToken = generateToken();
    emailService.sendVerificationEmail(user, verificationToken);
    return ResponseEntity.ok("Revisa tu email para verificar cuenta");
}

@PostMapping("/verify")
public ResponseEntity<?> verifyEmail(@RequestParam String token) {
    boolean verified = authService.verifyEmail(token);
    if (verified) {
        return ResponseEntity.ok("Email verificado. Ya puedes loguear");
    }
    return ResponseEntity.badRequest().body("Token inválido");
}
```

4. Modificar CustomUserDetailsService:
```java
public UserDetails loadUserByUsername(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(...);
    
    if (!user.isEmailVerified()) {
        throw new DisabledException("Email no verificado");
    }
    
    return new org.springframework.security.core.userdetails.User(
        user.getEmail(),
        user.getPassword(),
        user.getEnabled(),  // isEnabled
        true, true, true,   // accountNonExpired, credentialsNonExpired, accountNonLocked
        authorities
    );
}
```

**Tiempo**: 12-16 horas

**Prioridad**: 🟠 ALTA (antes de producción)

---

### MAYOR-002: NO hay endpoints GET /users/profile

**Qué falta**:
```java
@GetMapping("/profile")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UserResponse> getCurrentProfile(
    @AuthenticationPrincipal UserDetails userDetails) {
    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    return ResponseEntity.ok(new UserResponse(user));
}

@PutMapping("/profile")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UserResponse> updateProfile(
    @AuthenticationPrincipal UserDetails userDetails,
    @RequestBody UserProfileUpdateRequest request) {
    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    
    user.setName(request.getName());
    user.setPhone(request.getPhone());
    userRepository.save(user);
    
    return ResponseEntity.ok(new UserResponse(user));
}
```

**Frontend correspondiente**:
- Página `/perfil` con formulario editable
- Mostrar datos del usuario
- Editar nombre y teléfono

**Tiempo**: 4-6 horas

**Prioridad**: 🟠 MEDIA

---

### MAYOR-003: NO hay notificaciones por EMAIL

**Emails necesarios**:
1. ✅ Verificación de email (MAYOR-001)
2. ❌ Bienvenida
3. ❌ Aprobación de producto
4. ❌ Rechazo de producto
5. ❌ Confirmación de orden
6. ❌ Factura en PDF
7. ❌ Cambio de rol
8. ❌ Suspensión de cuenta

**Implementación**:
- Crear `EmailTemplates` con Thymeleaf o Velocity
- Crear `EmailEventListener` que escuche eventos de Spring
- Agregar `dependency`: `spring-boot-starter-mail`
- Configurar propiedades de SMTP (Gmail, SendGrid, etc)

**Tiempo**: 20-24 horas

**Prioridad**: 🟠 MEDIA (después de crítico)

---

### MAYOR-004: NO hay generación de FACTURAS PDF

**Qué necesita**:
- Endpoint `GET /orders/{id}/invoice`
- Generar PDF con iText o PDFBox
- Incluir: cliente, items, precios, total, fecha
- Descargar automáticamente

**Código base**:
```java
@GetMapping("/{id}/invoice")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
    Order order = orderService.getOrder(id);
    
    // Generar PDF
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PdfWriter writer = new PdfWriter(baos);
    PdfDocument pdf = new PdfDocument(writer);
    Document document = new Document(pdf);
    
    // Agregar contenido
    document.add(new Paragraph("FACTURA #" + order.getId()));
    document.add(new Paragraph("Total: $" + order.getTotal()));
    // ... más contenido ...
    
    document.close();
    
    return ResponseEntity.ok()
        .header("Content-Disposition", 
                "attachment; filename=\"factura-" + order.getId() + ".pdf\"")
        .body(baos.toByteArray());
}
```

**Dependency**:
```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
</dependency>
```

**Tiempo**: 8-12 horas

**Prioridad**: 🟠 MEDIA

---

### MAYOR-005: ProductController extrae token manualmente (RIESGO)

**Problema**:
```java
@PostMapping
public ResponseEntity<ProductDTO> createProduct(
    @RequestBody ProductRequest request,
    @RequestHeader("Authorization") String token) {  // ← MALO
    
    Long vendorId = extractUserIdFromToken(token);   // ← INSEGURO
}
```

**Por qué es malo**:
- Duplica validación de token (Spring Security ya lo hace)
- Propenso a errores de seguridad
- Código frágil y mantenible

**Solución**:
```java
@PreAuthorize("hasRole('VENDEDOR')")  // ← Spring valida
@PostMapping
public ResponseEntity<ProductDTO> createProduct(
    @AuthenticationPrincipal UserDetails userDetails,  // ← Spring inyecta
    @RequestBody ProductRequest request) {
    
    String email = userDetails.getUsername();
    Long vendorId = userRepository.findByEmail(email)
        .map(User::getId)
        .orElseThrow();
}
```

**Beneficios**:
- ✅ Spring Security valida token
- ✅ Automático y consistente
- ✅ Más seguro

**Cambios**:
```java
// ProductController.createProduct()
// ProductController.updateProduct()
// ProductController.deleteProduct()
// VendorController (si existe)
```

**Tiempo**: 4-6 horas

**Prioridad**: 🟠 ALTA (antes de producción)

---

## 🔧 PLAN DE IMPLEMENTACIÓN (FASE 1: CRÍTICOS)

### Semana 1: FIX SEGURIDAD + CARRITO + APROBACIÓN

```
DÍA 1 (Monday 8 horas):
├─ 09:00-09:30 → FIX [CRÍTICO-001]: Proteger create-superadmin (30 min)
├─ 09:30-13:00 → Implementar CartController + CartService (3.5 horas)
└─ 14:00-17:00 → Implementar endpoints /approve, /reject, /pending (3 horas)

DÍA 2 (Tuesday 8 horas):
├─ 09:00-11:00 → Testing de Cart
├─ 11:00-13:00 → Testing de Product Approval
└─ 14:00-17:00 → Refactorizar ProductController (MAYOR-005)

DÍA 3 (Wednesday 8 horas):
├─ 09:00-13:00 → Implementar Order endpoints básicos (4 horas)
├─ 14:00-15:00 → Validación de stock
└─ 15:00-17:00 → Testing de órdenes

DÍA 4 (Thursday 8 horas):
├─ 09:00-13:00 → Completar OrderService + validaciones
├─ 14:00-15:30 → Testing end-to-end
└─ 15:30-17:00 → Documentar cambios

DÍA 5 (Friday 8 horas):
├─ 09:00-10:00 → Bug fixes
├─ 10:00-12:00 → Performance testing
├─ 13:00-14:00 → Frontend updates (cart UI, checkout)
└─ 14:00-17:00 → Integration testing completo

TOTAL SEMANA 1: 40 horas
```

---

## 📋 CHECKLIST DE ACCIONES INMEDIATAS

### ¿Cómo empezar AHORA?

**ACCIÓN 1**: Fijar CRÍTICO-001 (5 minutos)
```powershell
# 1. Abrir archivo
code backend/src/main/java/com/otakushop/controller/AuthController.java

# 2. Buscar createSuperAdmin method
# 3. Agregar antes:
# @PreAuthorize("hasRole('SUPERADMIN')")

# 4. Compilar
cd backend
mvn clean package -DskipTests

# 5. Restart backend (kill old process, start new)
```

**ACCIÓN 2**: Crear CartController (30 minutos)
```powershell
# 1. Crear archivo
New-Item -Path "backend/src/main/java/com/otakushop/controller/CartController.java"

# 2. Crear servicio
New-Item -Path "backend/src/main/java/com/otakushop/service/CartService.java"

# 3. Ver plantilla en sección siguiente
```

**ACCIÓN 3**: Crear ProductApprovalEndpoints (45 minutos)
```powershell
# Modificar ProductController para agregar:
# - @PostMapping("/{id}/approve")
# - @PostMapping("/{id}/reject")
# - @GetMapping("/pending")
```

---

## 📄 PLANTILLAS DE CÓDIGO LISTO PARA COPIAR

### CartController.java
```java
package com.otakushop.controller;

import com.otakushop.dto.CartItemDTO;
import com.otakushop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

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

### ProductApprovalEndpoints (agregar a ProductController)
```java
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
@PostMapping("/{id}/approve")
public ResponseEntity<ProductDTO> approveProduct(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails) {
    Product product = productService.getProductById(id);
    product.setStatus("APROBADO");
    productService.updateProductStatus(product);
    // TODO: emailService.sendApprovalEmail(product.getVendorId());
    return ResponseEntity.ok(new ProductDTO(product));
}

@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
@PostMapping("/{id}/reject")
public ResponseEntity<?> rejectProduct(
        @PathVariable Long id,
        @RequestParam String reason,
        @AuthenticationPrincipal UserDetails userDetails) {
    Product product = productService.getProductById(id);
    product.setStatus("CANCELADO");
    productService.updateProductStatus(product);
    // TODO: emailService.sendRejectionEmail(product.getVendorId(), reason);
    return ResponseEntity.ok(Map.of("message", "Producto rechazado", "reason", reason));
}

@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
@GetMapping("/pending")
public ResponseEntity<List<ProductDTO>> getPendingProducts() {
    return ResponseEntity.ok(
        productService.getProductsByStatus("POSTULADO")
            .stream()
            .map(ProductDTO::new)
            .toList()
    );
}
```

---

## 🎯 RÁPIDO RESUMEN EJECUTIVO

| Hallazgo | Severidad | Tiempo | Acción |
|----------|-----------|--------|--------|
| create-superadmin público | 🔴 CRÍTICO | 5 min | Agregar @PreAuthorize |
| No carrito | 🔴 CRÍTICO | 8 h | Crear CartController |
| No aprobación | 🔴 CRÍTICO | 6 h | Agregar endpoints |
| No órdenes | 🔴 CRÍTICO | 16 h | Crear OrderController |
| No verificación email | 🟠 MAYOR | 12 h | EmailService |
| No profile endpoint | 🟠 MAYOR | 4 h | Agregar GET/PUT |
| No notificaciones | 🟠 MAYOR | 20 h | Email templates |
| No facturas PDF | 🟠 MAYOR | 8 h | iText + endpoint |
| ProductController inseguro | 🟠 MAYOR | 4 h | Refactorizar |

**TOTAL TIEMPO PARA LISTO**: ~80-100 horas (~2-3 semanas con 1 desarrollador)

**¿LISTO PARA EMPEZAR?** 

Confirma y te ayudo a implementar item por item 🚀

