# 💻 CÓDIGO - CORRECCIONES LISTAS PARA IMPLEMENTAR

**Estado:** ✅ Código 100% listo para copiar/pegar  
**Fecha:** 23/11/2025

---

## 📋 TABLA DE CONTENIDOS
1. [Corrección 1: Crear Producto](#corrección-1-crear-producto)
2. [Corrección 2: Cambiar Rol](#corrección-2-cambiar-rol)
3. [Corrección 3: Validaciones Admin](#corrección-3-validaciones-admin)
4. [Corrección 4: Solo Productos Aprobados](#corrección-4-solo-productos-aprobados)
5. [Corrección 5: Estados de Producto](#corrección-5-estados-de-producto)
6. [Corrección 6: Stock Inteligente](#corrección-6-stock-inteligente)
7. [Corrección 7: @PreAuthorize](#corrección-7-preauthorize)

---

## ✅ CORRECCIÓN 1: Crear Producto

### PASO 1.1: ProductController.java - Cambiar endpoint POST

**Archivo:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

**Buscar (línea ~120):**
```java
@PostMapping
public ResponseEntity<ProductDTO> createProduct(
        @Valid @RequestBody ProductRequest request,
        @RequestHeader("Authorization") String token) {
    Long vendorId = extractUserIdFromToken(token);
    ProductDTO product = productService.createProduct(request, vendorId);
    return ResponseEntity.status(HttpStatus.CREATED).body(product);
}
```

**Reemplazar por:**
```java
@PostMapping
@PreAuthorize("hasRole('VENDEDOR')")
public ResponseEntity<Map<String, Object>> createProduct(
        @Valid @RequestBody ProductRequest request) {
    Long vendorId = securityUtil.getCurrentUserId();
    ProductDTO product = productService.createProduct(request, vendorId);
    
    Map<String, Object> response = new HashMap<>();
    response.put("product", product);
    response.put("message", "Producto creado exitosamente. Pendiente de aprobación.");
    response.put("status", "PENDING");
    
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

**Cambios:**
- ✅ Agregar `@PreAuthorize("hasRole('VENDEDOR'")`
- ✅ Cambiar `@RequestHeader` a `securityUtil.getCurrentUserId()`
- ✅ Retornar `Map<String, Object>` en lugar de `ProductDTO`
- ✅ Agregar mensaje descriptivo

---

### PASO 1.2: ProductService.java - Validar estado en updateProduct

**Archivo:** `backend/src/main/java/com/otakushop/service/ProductService.java`

**Buscar (línea ~82):**
```java
@Transactional
public ProductDTO updateProduct(Long id, ProductRequest request, Long vendorId) {
    Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

    if (!product.getVendor().getId().equals(vendorId)) {
        throw new RuntimeException("No tienes permiso para actualizar este producto");
    }

    product.setName(request.getName());
    // ... rest of fields ...
}
```

**Reemplazar por:**
```java
@Transactional
public ProductDTO updateProduct(Long id, ProductRequest request, Long vendorId) {
    Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

    if (!product.getVendor().getId().equals(vendorId)) {
        throw new RuntimeException("No tienes permiso para actualizar este producto");
    }
    
    // ✅ NUEVO: Validar que solo se puede editar en estado PENDING
    if (product.getStatus() != ProductStatus.PENDING) {
        throw new IllegalArgumentException(
            "Solo se pueden editar productos en estado PENDIENTE. " +
            "Estado actual: " + product.getStatus().getDescription()
        );
    }

    product.setName(request.getName());
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    product.setOriginalPrice(request.getOriginalPrice());
    product.setCategory(request.getCategory());
    product.setStock(request.getStock());
    product.setImageUrl(request.getImageUrl());
    product.setActive(request.getActive());

    product = productRepository.save(product);
    return convertToDTO(product);
}
```

---

### PASO 1.3: ProductService.java - Cambiar deleteProduct a cancelar

**Archivo:** `backend/src/main/java/com/otakushop/service/ProductService.java`

**Buscar (línea ~104):**
```java
@Transactional
public void deleteProduct(Long id, Long vendorId) {
    Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

    if (!product.getVendor().getId().equals(vendorId)) {
        throw new RuntimeException("No tienes permiso para eliminar este producto");
    }

    productRepository.deleteById(id);
}
```

**Reemplazar por:**
```java
@Transactional
public ProductDTO deleteProduct(Long id, Long vendorId) {
    Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

    if (!product.getVendor().getId().equals(vendorId)) {
        throw new RuntimeException("No tienes permiso para cancelar este producto");
    }
    
    // ✅ NUEVO: Validar que solo se puede cancelar en estado PENDING
    if (product.getStatus() != ProductStatus.PENDING) {
        throw new IllegalArgumentException(
            "Solo se pueden cancelar productos en estado PENDIENTE. " +
            "Estado actual: " + product.getStatus().getDescription()
        );
    }
    
    // ✅ NUEVO: Cambiar estado en lugar de borrar
    product.setStatus(ProductStatus.CANCELED);
    product.setActive(false);
    product = productRepository.save(product);
    
    return convertToDTO(product);
}
```

---

### PASO 1.4: ProductController.java - Actualizar DELETE endpoint

**Archivo:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

**Buscar (línea ~135):**
```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteProduct(
        @PathVariable Long id,
        @RequestHeader("Authorization") String token) {
    Long vendorId = extractUserIdFromToken(token);
    productService.deleteProduct(id, vendorId);
    return ResponseEntity.noContent().build();
}
```

**Reemplazar por:**
```java
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('VENDEDOR')")
public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
    Long vendorId = securityUtil.getCurrentUserId();
    ProductDTO product = productService.deleteProduct(id, vendorId);
    
    Map<String, Object> response = new HashMap<>();
    response.put("product", product);
    response.put("message", "Producto cancelado exitosamente");
    response.put("status", "CANCELED");
    
    return ResponseEntity.ok(response);
}
```

---

### PASO 1.5: Crear CreateProductModal.jsx

**Archivo:** `frontend/src/components/modals/CreateProductModal.jsx` (NUEVO)

```javascript
import { useState } from 'react'
import services from '../../services'
import Button from '../ui/Button'

const CreateProductModal = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      setError('Completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await services.productService.create(formData)
      onProductCreated(response.data.product)
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: '',
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el producto')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Producto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="manga">Manga</option>
              <option value="anime">Anime</option>
              <option value="figures">Figuras</option>
              <option value="accessories">Accesorios</option>
              <option value="clothing">Ropa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL de Imagen
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProductModal
```

---

### PASO 1.6: VendorDashboard.jsx - Agregar Modal y Handler

**Archivo:** `frontend/src/pages/vendor/VendorDashboard.jsx`

**Buscar (línea ~1):**
```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import services from '../../services'
import Button from '../../components/ui/Button'
import EditProductModal from '../../components/modals/EditProductModal'
```

**Reemplazar por:**
```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import services from '../../services'
import Button from '../../components/ui/Button'
import CreateProductModal from '../../components/modals/CreateProductModal'  // ✅ AGREGAR
import EditProductModal from '../../components/modals/EditProductModal'
```

**Buscar (línea ~20):**
```javascript
const [selectedProduct, setSelectedProduct] = useState(null)
const [isEditModalOpen, setIsEditModalOpen] = useState(false)
```

**Reemplazar por:**
```javascript
const [selectedProduct, setSelectedProduct] = useState(null)
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)  // ✅ AGREGAR
const [isEditModalOpen, setIsEditModalOpen] = useState(false)
```

**Buscar (línea ~93, botón "+ Nuevo Producto"):**
```javascript
<Button variant="primary">
  + Nuevo Producto
</Button>
```

**Reemplazar por:**
```javascript
<Button 
  variant="primary"
  onClick={() => setIsCreateModalOpen(true)}  // ✅ AGREGAR
>
  + Nuevo Producto
</Button>
```

**Buscar (línea ~190, antes del último `</div>`):**
```javascript
<EditProductModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  product={selectedProduct}
  onProductUpdated={() => {
    setIsEditModalOpen(false)
    addNotification({
      type: 'success',
      message: 'Producto actualizado',
    })
  }}
/>
```

**Reemplazar por:**
```javascript
<CreateProductModal  {/* ✅ AGREGAR */}
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onProductCreated={(newProduct) => {
    setProducts([...products, newProduct])
    setIsCreateModalOpen(false)
    addNotification({
      type: 'success',
      message: 'Producto creado! Espera aprobación del administrador.',
    })
  }}
/>

<EditProductModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  product={selectedProduct}
  onProductUpdated={() => {
    setIsEditModalOpen(false)
    addNotification({
      type: 'success',
      message: 'Producto actualizado',
    })
  }}
/>
```

---

## ✅ CORRECCIÓN 2: Cambiar Rol

### PASO 2.1: UserController.java - Cambiar a @RequestBody

**Archivo:** `backend/src/main/java/com/otakushop/controller/UserController.java`

**Buscar (línea ~31):**
```java
@PutMapping("/{id}/role")
@PreAuthorize("hasRole('SUPERADMIN')")
public ResponseEntity<UserResponse> updateUserRole(
        @PathVariable Long id,
        @RequestParam String role) {
    return ResponseEntity.ok(userService.updateUserRole(id, role));
}
```

**Reemplazar por:**
```java
@PutMapping("/{id}/role")
@PreAuthorize("hasRole('SUPERADMIN')")
public ResponseEntity<Map<String, Object>> updateUserRole(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {
    String newRole = request.get("role");
    UserResponse updated = userService.updateUserRole(id, newRole);
    
    Map<String, Object> response = new HashMap<>();
    response.put("user", updated);
    response.put("message", "Rol actualizado exitosamente");
    
    return ResponseEntity.ok(response);
}
```

**Cambios:**
- ✅ Cambiar `@RequestParam String role` a `@RequestBody Map<String, String> request`
- ✅ Extraer role: `String newRole = request.get("role")`
- ✅ Retornar Map en lugar de solo UserResponse

---

### PASO 2.2: UserService.java - Agregar Validaciones

**Archivo:** `backend/src/main/java/com/otakushop/service/UserService.java`

**Buscar (línea ~27):**
```java
@Transactional
public UserResponse updateUserRole(Long id, String roleValue) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    
    user.setRole(Role.fromValue(roleValue));
    user = userRepository.save(user);
    return convertToResponse(user);
}
```

**Reemplazar por:**
```java
@Transactional
public UserResponse updateUserRole(Long id, String roleValue) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    
    // ✅ NUEVO: Obtener usuario actual (SuperAdmin)
    Long currentUserId = securityUtil.getCurrentUserId();
    User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Usuario actual no encontrado"));
    
    // ✅ NUEVO: Validar que solo SuperAdmin puede cambiar roles
    if (currentUser.getRole() != Role.SUPERADMIN) {
        throw new IllegalArgumentException(
            "Solo SUPERADMIN puede cambiar roles"
        );
    }
    
    // ✅ NUEVO: Validar rol destino
    Role newRole = Role.fromValue(roleValue);
    
    // No permitir crear nuevos SUPERADMIN
    if (newRole == Role.SUPERADMIN) {
        throw new IllegalArgumentException(
            "No se permite crear nuevos SUPERADMIN. Solo el root puede hacerlo."
        );
    }
    
    // No permitir cambiar a otro SUPERADMIN
    if (user.getRole() == Role.SUPERADMIN && !user.getId().equals(currentUserId)) {
        throw new IllegalArgumentException(
            "No se permite cambiar el rol de otro SUPERADMIN"
        );
    }
    
    user.setRole(newRole);
    user = userRepository.save(user);
    return convertToResponse(user);
}
```

---

## ✅ CORRECCIÓN 3: Validaciones Admin

### PASO 3.1: UserService.java - Proteger deleteUser

**Archivo:** `backend/src/main/java/com/otakushop/service/UserService.java`

**Buscar (línea ~37):**
```java
@Transactional
public void deleteUser(Long id) {
    if (!userRepository.existsById(id)) {
        throw new RuntimeException("Usuario no encontrado");
    }
    userRepository.deleteById(id);
}
```

**Reemplazar por:**
```java
@Transactional
public void deleteUser(Long id) {
    User userToDelete = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    
    // ✅ NUEVO: Obtener usuario actual (Admin)
    Long currentUserId = securityUtil.getCurrentUserId();
    User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Usuario actual no encontrado"));
    
    // ✅ NUEVO: No permitir eliminar SUPERADMIN
    if (userToDelete.getRole() == Role.SUPERADMIN) {
        throw new IllegalArgumentException(
            "No se permite eliminar SUPERADMIN"
        );
    }
    
    // ✅ NUEVO: Si es ADMIN, no puede eliminar otro ADMIN
    if (currentUser.getRole() == Role.ADMIN && 
        userToDelete.getRole() == Role.ADMIN) {
        throw new IllegalArgumentException(
            "Un ADMIN no puede eliminar otro ADMIN"
        );
    }
    
    // ✅ NUEVO: Si es ADMIN, no puede eliminar SUPERADMIN (redundante pero seguro)
    if (currentUser.getRole() == Role.ADMIN && 
        userToDelete.getRole() == Role.SUPERADMIN) {
        throw new IllegalArgumentException(
            "Un ADMIN no puede eliminar SUPERADMIN"
        );
    }
    
    // ✅ NUEVO: Suspender en lugar de borrar
    userToDelete.setEnabled(false);
    userRepository.save(userToDelete);
}
```

---

## ✅ CORRECCIÓN 4: Solo Productos Aprobados

### PASO 4.1: ProductService.java - Agregar método getAllApprovedProducts

**Archivo:** `backend/src/main/java/com/otakushop/service/ProductService.java`

**Buscar (línea ~26):**
```java
public List<ProductDTO> getAllProducts() {
    return productRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
}
```

**Reemplazar por:**
```java
// ✅ NUEVO: Solo productos aprobados para clientes
public List<ProductDTO> getAllApprovedProducts() {
    return productRepository.findByStatus(ProductStatus.APPROVED).stream()
            .filter(Product::getActive)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
}

// Mantener para admin (pero solo uso interno)
public List<ProductDTO> getAllProducts() {
    return productRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
}
```

---

### PASO 4.2: ProductController.java - Cambiar endpoint GET

**Archivo:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

**Buscar (línea ~26):**
```java
@GetMapping
public ResponseEntity<List<ProductDTO>> getAllProducts() {
    List<ProductDTO> products = productService.getAllProducts();
    return ResponseEntity.ok(products);
}
```

**Reemplazar por:**
```java
@GetMapping
public ResponseEntity<Map<String, Object>> getApprovedProducts() {
    List<ProductDTO> products = productService.getAllApprovedProducts();
    
    Map<String, Object> response = new HashMap<>();
    response.put("products", products);
    response.put("total", products.size());
    response.put("message", "Productos disponibles");
    
    return ResponseEntity.ok(response);
}

// ✅ NUEVO: Endpoint para admin ver TODOS
@GetMapping("/admin/all")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
public ResponseEntity<Map<String, Object>> getAllProductsAdmin() {
    List<ProductDTO> products = productService.getAllProducts();
    
    Map<String, Object> response = new HashMap<>();
    response.put("products", products);
    response.put("total", products.size());
    
    return ResponseEntity.ok(response);
}
```

---

## ✅ CORRECCIÓN 5: Estados de Producto

### PASO 5.1: ProductStatus.java - Renombrar estados

**Archivo:** `backend/src/main/java/com/otakushop/entity/ProductStatus.java`

**Buscar:**
```java
public enum ProductStatus {
    PENDING("Pendiente de aprobación"),
    APPROVED("Aprobado"),
    REJECTED("Rechazado");
```

**Reemplazar por:**
```java
public enum ProductStatus {
    PENDING("Postulado"),
    APPROVED("Aprobado"),
    CANCELED("Cancelado");
```

---

### PASO 5.2: ProductService.java - Actualizar métodos

**Buscar en approveProduct y rejectProduct:**
```
ProductStatus.PENDING → ProductStatus.PENDING ✓ (mismo)
ProductStatus.APPROVED → ProductStatus.APPROVED ✓ (mismo)
ProductStatus.REJECTED → ProductStatus.CANCELED ✅ (cambiar)
```

**En rejectProduct(), cambiar:**
```java
// ANTES:
product.setStatus(ProductStatus.REJECTED);

// DESPUÉS:
product.setStatus(ProductStatus.CANCELED);
```

---

## ✅ CORRECCIÓN 6: Stock Inteligente

### PASO 6.1: CartItem.java - Agregar campos

**Archivo:** `backend/src/main/java/com/otakushop/entity/CartItem.java`

**Buscar:**
```java
@Column(nullable = false)
private Integer quantity;

@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;
```

**Reemplazar por:**
```java
@Column(nullable = false)
private Integer quantity;

// ✅ NUEVO: Timestamp de reserva
@Column(name = "reserved_at", nullable = false, updatable = false)
private LocalDateTime reservedAt;

// ✅ NUEVO: Expiración de carrito (24 horas)
@Column(name = "expires_at")
private LocalDateTime expiresAt;

@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;
```

**En @PrePersist:**
```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    reservedAt = LocalDateTime.now();
    expiresAt = LocalDateTime.now().plusHours(24);
}
```

**Agregar método:**
```java
public boolean isExpired() {
    return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
}
```

---

### PASO 6.2: Product.java - Agregar campos de stock

**Archivo:** `backend/src/main/java/com/otakushop/entity/Product.java`

**Buscar:**
```java
@Column(nullable = false)
private Integer stock = 0;
```

**Reemplazar por:**
```java
@Column(nullable = false)
private Integer stock = 0;

// ✅ NUEVO: Stock reservado en carritos
@Column(name = "reserved_stock", nullable = false)
private Integer reservedStock = 0;

// ✅ NUEVO: Máximo por usuario (default 5)
@Column(name = "max_quantity_per_user", nullable = false)
private Integer maxQuantityPerUser = 5;
```

---

### PASO 6.3: CartService.java - Validaciones en addItem

**Archivo:** `backend/src/main/java/com/otakushop/service/CartService.java`

**Buscar (línea ~56):**
```java
public CartItemDTO addItem(Long userId, CartItemRequest request) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    
    Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    
    // Validaciones
    if (request.getQuantity() <= 0) {
        throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
    }
    
    if (product.getStock() < request.getQuantity()) {
        throw new IllegalArgumentException("Stock insuficiente para este producto");
    }
    
    // Si ya existe en el carrito, incrementar cantidad
    CartItem existingItem = cartItemRepository
        .findByUserIdAndProductId(userId, request.getProductId())
        .orElse(null);
    
    if (existingItem != null) {
        existingItem.addQuantity(request.getQuantity());
        CartItem updated = cartItemRepository.save(existingItem);
        return convertToDTO(updated);
    }
    
    // Crear nuevo item
    CartItem cartItem = CartItem.builder()
        .user(user)
        .product(product)
        .quantity(request.getQuantity())
        .build();
    
    CartItem saved = cartItemRepository.save(cartItem);
    return convertToDTO(saved);
}
```

**Reemplazar por:**
```java
public CartItemDTO addItem(Long userId, CartItemRequest request) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    
    Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    
    // Validaciones básicas
    if (request.getQuantity() <= 0) {
        throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
    }
    
    // ✅ NUEVO: Obtener item existente si hay
    CartItem existingItem = cartItemRepository
            .findByUserIdAndProductId(userId, request.getProductId())
            .orElse(null);
    
    // ✅ NUEVO: Calcular total que tendría este usuario
    int totalQuantity = request.getQuantity();
    if (existingItem != null) {
        totalQuantity += existingItem.getQuantity();
    }
    
    // ✅ NUEVO: Validar límite máximo por usuario
    if (totalQuantity > product.getMaxQuantityPerUser()) {
        throw new IllegalArgumentException(
            String.format(
                "No puedes tener más de %d unidades de este producto",
                product.getMaxQuantityPerUser()
            )
        );
    }
    
    // ✅ NUEVO: Calcular stock disponible (considerando lo reservado)
    int availableStock = product.getStock() - product.getReservedStock();
    if (availableStock < request.getQuantity()) {
        throw new IllegalArgumentException(
            String.format(
                "Solo hay %d unidades disponibles (muchos usuarios lo compraron)",
                availableStock
            )
        );
    }
    
    // Si ya existe en el carrito, incrementar cantidad
    if (existingItem != null) {
        existingItem.addQuantity(request.getQuantity());
        CartItem updated = cartItemRepository.save(existingItem);
        
        // ✅ NUEVO: Actualizar stock reservado
        product.setReservedStock(product.getReservedStock() + request.getQuantity());
        productRepository.save(product);
        
        return convertToDTO(updated);
    }
    
    // Crear nuevo item
    CartItem cartItem = CartItem.builder()
            .user(user)
            .product(product)
            .quantity(request.getQuantity())
            .build();
    
    CartItem saved = cartItemRepository.save(cartItem);
    
    // ✅ NUEVO: Actualizar stock reservado
    product.setReservedStock(product.getReservedStock() + request.getQuantity());
    productRepository.save(product);
    
    return convertToDTO(saved);
}
```

---

### PASO 6.4: CartService.java - Actualizar removeItem

**En removeItem(), agregar al final:**
```java
// ✅ NUEVO: Liberar stock reservado
product.setReservedStock(Math.max(0, product.getReservedStock() - cartItem.getQuantity()));
productRepository.save(product);
```

---

## ✅ CORRECCIÓN 7: @PreAuthorize

### PASO 7.1: ProductController.java - Agregar @PreAuthorize

**Archivo:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

**En método updateProduct (línea ~115):**
```java
// ANTES:
@PutMapping("/{id}")
public ResponseEntity<ProductDTO> updateProduct(

// DESPUÉS:
@PutMapping("/{id}")
@PreAuthorize("hasRole('VENDEDOR')")
public ResponseEntity<ProductDTO> updateProduct(
```

---

## ✅ IMPORTS NECESARIOS

Asegúrate de que estos imports existan en los archivos modificados:

### ProductService.java
```java
import com.otakushop.util.SecurityUtil;
import com.otakushop.security.JwtTokenProvider;
```

### UserService.java
```java
import com.otakushop.util.SecurityUtil;
```

### UserController.java y ProductController.java
```java
import java.util.Map;
import java.util.HashMap;
import org.springframework.security.access.prepost.PreAuthorize;
```

---

## ⚠️ MIGRACIONES DE BASE DE DATOS

Si usas Flyway, crear archivo:  
`backend/src/main/resources/db/migration/V4__Add_stock_intelligence.sql`

```sql
-- Agregar columnas a cart_items
ALTER TABLE cart_items ADD COLUMN reserved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE cart_items ADD COLUMN expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- Agregar columnas a products
ALTER TABLE products ADD COLUMN reserved_stock INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN max_quantity_per_user INTEGER NOT NULL DEFAULT 5;

-- Actualizar ProductStatus (si es Enum, puede necesitar migration especial para DB específica)
-- Para PostgreSQL, necesitarías recrear el tipo ENUM
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```
[ ] 1.1: ProductController - POST endpoint
[ ] 1.2: ProductService - Validación updateProduct
[ ] 1.3: ProductService - Cambiar deleteProduct
[ ] 1.4: ProductController - DELETE endpoint
[ ] 1.5: Crear CreateProductModal.jsx
[ ] 1.6: VendorDashboard.jsx - Modal y handler

[ ] 2.1: UserController - @RequestBody
[ ] 2.2: UserService - Validaciones

[ ] 3.1: UserService - deleteUser

[ ] 4.1: ProductService - getAllApprovedProducts
[ ] 4.2: ProductController - Cambiar endpoint

[ ] 5.1: ProductStatus - Renombrar
[ ] 5.2: ProductService - Actualizar métodos

[ ] 6.1: CartItem.java - Nuevos campos
[ ] 6.2: Product.java - Nuevos campos
[ ] 6.3: CartService.java - addItem
[ ] 6.4: CartService.java - removeItem

[ ] 7.1: ProductController - @PreAuthorize

[ ] Base de datos - Migraciones
[ ] Testing - Ejecutar plan de pruebas
```

---

**Total de cambios:** ~15 archivos  
**Líneas de código:** ~300  
**Tiempo estimado:** 2-3 horas  
**Riesgo:** BAJO (cambios localizados)

