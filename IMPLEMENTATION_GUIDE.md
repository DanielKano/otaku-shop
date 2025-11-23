# 🚀 GUÍA DE EJECUCIÓN - PASO A PASO

**Objetivo:** Implementar todas las correcciones críticas en 4-5 horas  
**Fecha:** 23/11/2025  
**Prioridad:** 🔴 CRÍTICA

---

## 📋 PREPARACIÓN (5 minutos)

### PASO 0: Setup
```bash
# 1. Asegúrate de estar en la rama correcta
cd C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack
git branch -a
# Si no hay rama de dev, crear:
# git checkout -b develop

# 2. Actualizar desde main (si es necesario)
git pull origin main

# 3. Crear rama de correcciones
git checkout -b fix/critical-bugs-nov23

# 4. Verificar estado
git status
```

### PASO 0.5: Revisar Documentación
```
Abrir en VS Code:
[ ] DIAGNOSTIC_COMPLETE_FINAL.md (ref técnica completa)
[ ] QUICK_BUGS_SUMMARY.md (ref rápida)
[ ] CODE_FIXES_READY.md (código exacto para copiar)
[ ] PROBLEM_MATRIX.md (esta guía)
```

---

## 🔴 BLOQUE 1: PROTECCIONES (@PreAuthorize) - 5 minutos

### Bug #7: Agregar @PreAuthorize a endpoints

**ARCHIVO:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

1. Abre el archivo
2. Busca línea ~120 (método `@PostMapping`)
3. Agregar una línea ARRIBA:
   ```java
   @PreAuthorize("hasRole('VENDEDOR')")
   ```
4. Busca línea ~115 (método `@PutMapping`)
5. Agregar:
   ```java
   @PreAuthorize("hasRole('VENDEDOR')")
   ```

**Verificar:**
```
POST /api/products - DEBE tener @PreAuthorize
PUT /api/products/{id} - DEBE tener @PreAuthorize
DELETE /api/products/{id} - DEBE tener @PreAuthorize
```

✅ **COMPLETADO:** Bug #7
⏱️ **Tiempo:** 5 minutos

---

## 🟠 BLOQUE 2: CAMBIAR ROL (SuperAdmin) - 20 minutos

### Bug #2a: UserController.java - Cambiar @RequestParam a @RequestBody

**ARCHIVO:** `backend/src/main/java/com/otakushop/controller/UserController.java`

1. Busca línea ~31 (método `updateUserRole`)
2. Cambiar:
   ```java
   // ANTES:
   @RequestParam String role

   // DESPUÉS:
   @RequestBody Map<String, String> request
   ```
3. Dentro del método, cambiar:
   ```java
   // ANTES:
   public ResponseEntity<UserResponse> updateUserRole(
        @PathVariable Long id,
        @RequestParam String role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
   }

   // DESPUÉS:
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

**Verificar:**
```
PUT /api/users/{id}/role
Content-Type: application/json
Body: { "role": "vendedor" }
→ Debería funcionar
```

✅ **COMPLETADO:** Parte 1 de Bug #2
⏱️ **Tiempo:** 10 minutos

---

### Bug #2b: UserService.java - Agregar validaciones

**ARCHIVO:** `backend/src/main/java/com/otakushop/service/UserService.java`

1. Busca línea ~27 (método `updateUserRole`)
2. Reemplazar TODO el método por:
   ```java
   @Transactional
   public UserResponse updateUserRole(Long id, String roleValue) {
       User user = userRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
       
       Long currentUserId = securityUtil.getCurrentUserId();
       User currentUser = userRepository.findById(currentUserId)
               .orElseThrow(() -> new RuntimeException("Usuario actual no encontrado"));
       
       Role newRole = Role.fromValue(roleValue);
       
       if (newRole == Role.SUPERADMIN) {
           throw new IllegalArgumentException(
               "No se permite crear nuevos SUPERADMIN"
           );
       }
       
       if (user.getRole() == Role.SUPERADMIN && !user.getId().equals(currentUserId)) {
           throw new IllegalArgumentException(
               "No se permite cambiar el rol de otro SUPERADMIN"
           );
       }
       
       if (currentUser.getRole() != Role.SUPERADMIN) {
           throw new IllegalArgumentException(
               "Solo SUPERADMIN puede cambiar roles"
           );
       }
       
       user.setRole(newRole);
       user = userRepository.save(user);
       return convertToResponse(user);
   }
   ```

**Verificar:**
```
POST /api/users/123/role body: { "role": "superadmin" }
→ Error: "No se permite crear nuevos SUPERADMIN"

POST /api/users/admin-id/role body: { "role": "cliente" }
→ Error: "Solo SUPERADMIN puede cambiar roles"

POST /api/users/cliente-id/role body: { "role": "vendedor" }
→ Success: { "user": {...}, "message": "..." }
```

✅ **COMPLETADO:** Bug #2
⏱️ **Tiempo:** 20 minutos

---

## 🟠 BLOQUE 3: ADMIN VALIDACIONES - 20 minutos

### Bug #3: UserService.java - Proteger deleteUser

**ARCHIVO:** `backend/src/main/java/com/otakushop/service/UserService.java`

1. Busca línea ~37 (método `deleteUser`)
2. Reemplazar TODO el método por:
   ```java
   @Transactional
   public void deleteUser(Long id) {
       User userToDelete = userRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
       
       Long currentUserId = securityUtil.getCurrentUserId();
       User currentUser = userRepository.findById(currentUserId)
               .orElseThrow(() -> new RuntimeException("Usuario actual no encontrado"));
       
       if (userToDelete.getRole() == Role.SUPERADMIN) {
           throw new IllegalArgumentException(
               "No se permite eliminar SUPERADMIN"
           );
       }
       
       if (currentUser.getRole() == Role.ADMIN && 
           userToDelete.getRole() == Role.ADMIN) {
           throw new IllegalArgumentException(
               "Un ADMIN no puede eliminar otro ADMIN"
           );
       }
       
       if (currentUser.getRole() == Role.ADMIN && 
           userToDelete.getRole() == Role.SUPERADMIN) {
           throw new IllegalArgumentException(
               "Un ADMIN no puede eliminar SUPERADMIN"
           );
       }
       
       userToDelete.setEnabled(false);
       userRepository.save(userToDelete);
   }
   ```

**Verificar:**
```
DELETE /api/users/superadmin-id (as ADMIN)
→ Error: "No se permite eliminar SUPERADMIN"

DELETE /api/users/other-admin-id (as ADMIN)
→ Error: "Un ADMIN no puede eliminar otro ADMIN"

DELETE /api/users/vendor-id (as ADMIN)
→ Success: Usuario suspendido (enabled=false)
```

✅ **COMPLETADO:** Bug #3
⏱️ **Tiempo:** 20 minutos

---

## 🔴 BLOQUE 4: PRODUCTOS APROBADOS (Cliente) - 15 minutos

### Bug #4a: ProductService.java - Nuevo método getAllApprovedProducts

**ARCHIVO:** `backend/src/main/java/com/otakushop/service/ProductService.java`

1. Busca línea ~26 (método `getAllProducts`)
2. Reemplazar por:
   ```java
   public List<ProductDTO> getAllApprovedProducts() {
       return productRepository.findByStatus(ProductStatus.APPROVED).stream()
               .filter(Product::getActive)
               .map(this::convertToDTO)
               .collect(Collectors.toList());
   }

   public List<ProductDTO> getAllProducts() {
       return productRepository.findAll().stream()
               .map(this::convertToDTO)
               .collect(Collectors.toList());
   }
   ```

---

### Bug #4b: ProductController.java - Cambiar endpoint GET

**ARCHIVO:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

1. Busca línea ~26 (método `@GetMapping getAllProducts`)
2. Reemplazar por:
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

**Verificar:**
```
GET /api/products (sin rol)
→ Solo productos con status=APPROVED

GET /api/products/admin/all (como ADMIN)
→ TODOS los productos (PENDING, APPROVED, REJECTED)
```

✅ **COMPLETADO:** Bug #4
⏱️ **Tiempo:** 15 minutos

---

## 🟠 BLOQUE 5: ESTADOS PRODUCTO - 30 minutos

### Bug #6a: ProductStatus.java - Renombrar estados

**ARCHIVO:** `backend/src/main/java/com/otakushop/entity/ProductStatus.java`

1. Abre el archivo
2. Busca:
   ```java
   PENDING("Pendiente de aprobación"),
   APPROVED("Aprobado"),
   REJECTED("Rechazado");
   ```
3. Reemplazar por:
   ```java
   PENDING("Postulado"),
   APPROVED("Aprobado"),
   CANCELED("Cancelado");
   ```

---

### Bug #6b: ProductService.java - Validar edición en PENDING

**ARCHIVO:** `backend/src/main/java/com/otakushop/service/ProductService.java`

1. Busca línea ~82 (método `updateProduct`)
2. DESPUÉS de la validación de permisos, AGREGAR:
   ```java
   if (product.getStatus() != ProductStatus.PENDING) {
       throw new IllegalArgumentException(
           "Solo se pueden editar productos en estado PENDIENTE. " +
           "Estado actual: " + product.getStatus().getDescription()
       );
   }
   ```

---

### Bug #6c: ProductService.java - Cambiar deleteProduct a cancelar

**ARCHIVO:** `backend/src/main/java/com/otakushop/service/ProductService.java`

1. Busca línea ~104 (método `deleteProduct`)
2. Reemplazar por:
   ```java
   @Transactional
   public ProductDTO deleteProduct(Long id, Long vendorId) {
       Product product = productRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

       if (!product.getVendor().getId().equals(vendorId)) {
           throw new RuntimeException("No tienes permiso para cancelar este producto");
       }
       
       if (product.getStatus() != ProductStatus.PENDING) {
           throw new IllegalArgumentException(
               "Solo se pueden cancelar productos en estado POSTULADO"
           );
       }
       
       product.setStatus(ProductStatus.CANCELED);
       product.setActive(false);
       product = productRepository.save(product);
       
       return convertToDTO(product);
   }
   ```

3. Busca línea ~135 (método DELETE en controller)
4. Cambiar:
   ```java
   // ANTES:
   @DeleteMapping("/{id}")
   public ResponseEntity<Void> deleteProduct(
        @PathVariable Long id,
        @RequestHeader("Authorization") String token) {
       Long vendorId = extractUserIdFromToken(token);
       productService.deleteProduct(id, vendorId);
       return ResponseEntity.noContent().build();
   }

   // DESPUÉS:
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

**Verificar:**
```
PUT /api/products/pending-id (cambiar nombre)
→ Success: Producto editado

PUT /api/products/approved-id (cambiar nombre)
→ Error: "Solo se pueden editar productos POSTULADO"

DELETE /api/products/pending-id (vendedor)
→ Success: Status → CANCELED, active=false

DELETE /api/products/approved-id (vendedor)
→ Error: "Solo se pueden cancelar POSTULADO"
```

✅ **COMPLETADO:** Bug #6
⏱️ **Tiempo:** 30 minutos

---

## 🔴 BLOQUE 6: CREAR PRODUCTO (Vendedor) - 60 minutos

### Bug #1a: Crear CreateProductModal.jsx

**ARCHIVO:** `frontend/src/components/modals/CreateProductModal.jsx` (NUEVO)

1. Crear NUEVO archivo
2. Copiar contenido de `CODE_FIXES_READY.md` sección **"PASO 1.5: Crear CreateProductModal.jsx"**
3. Guardar

---

### Bug #1b: ProductController.java - Cambiar POST endpoint

**ARCHIVO:** `backend/src/main/java/com/otakushop/controller/ProductController.java`

1. Busca línea ~120 (método `@PostMapping createProduct`)
2. Reemplazar por:
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

---

### Bug #1c: VendorDashboard.jsx - Agregar Modal y Handler

**ARCHIVO:** `frontend/src/pages/vendor/VendorDashboard.jsx`

1. En imports (línea ~1), AGREGAR:
   ```javascript
   import CreateProductModal from '../../components/modals/CreateProductModal'
   ```

2. En state (línea ~20), AGREGAR:
   ```javascript
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
   ```

3. Busca botón "+ Nuevo Producto" (línea ~93), cambiar:
   ```javascript
   // ANTES:
   <Button variant="primary">
     + Nuevo Producto
   </Button>

   // DESPUÉS:
   <Button 
     variant="primary"
     onClick={() => setIsCreateModalOpen(true)}
   >
     + Nuevo Producto
   </Button>
   ```

4. Antes del cierre `</div>` final, AGREGAR:
   ```javascript
   <CreateProductModal
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
   ```

---

### Bug #1d: ProductService.java - Validar estado en updateProduct

**ARCHIVO:** `backend/src/main/java/com/otakushop/service/ProductService.java`

1. En método `updateProduct` (línea ~82), DESPUÉS de validar permisos, AGREGAR:
   ```java
   if (product.getStatus() != ProductStatus.PENDING) {
       throw new IllegalArgumentException(
           "Solo se pueden editar productos en estado PENDIENTE"
       );
   }
   ```

**Verificar:**
```
POST /api/products (como vendedor)
Body: { "name": "One Piece", "price": 25.00, ... }
→ Success: Producto creado, status=PENDING

GET /api/productos (como cliente)
→ Producto NO aparece (status != APPROVED)

GET /api/products/pending (como admin)
→ Producto APARECE

POST /api/products/{id}/approve (como admin)
→ Status cambia a APPROVED

GET /api/productos (como cliente)
→ Ahora APARECE
```

✅ **COMPLETADO:** Bug #1
⏱️ **Tiempo:** 60 minutos

---

## ✅ TESTING RÁPIDO - 30 minutos

### Compilar Backend
```bash
cd backend
mvn clean compile
# Esperar a que compile sin errores
```

### Compilar Frontend
```bash
cd ../frontend
npm install
npm run build
```

### Test Manual
```
1. Login como Vendedor
2. Click "Panel Vendedor"
3. Click "+ Nuevo Producto"
4. ✅ Se abre modal
5. Llenar formulario
6. Click "Crear Producto"
7. ✅ Se crea producto (estado PENDING)

8. Login como Admin
9. Click "Gestión de Productos"
10. ✅ Ver producto PENDING
11. Click "Aprobar"
12. ✅ Status cambia a APROBADO

13. Login como Cliente
14. Click "Productos"
15. ✅ Ver el producto aprobado

16. Login como SuperAdmin
17. Click "Cambiar Roles"
18. Seleccionar usuario + rol
19. Click "Cambiar"
20. ✅ Rol cambia sin error 400

21. Login como Admin
22. Intentar eliminar otro Admin
23. ✅ Error: "Un ADMIN no puede eliminar otro ADMIN"

24. Intentar eliminar SuperAdmin
25. ✅ Error: "No se permite eliminar SUPERADMIN"

26. Eliminar Vendedor
27. ✅ Usuario suspendido (no borrado)
```

✅ **TESTING COMPLETADO**
⏱️ **Tiempo:** 30 minutos

---

## 📊 RESUMEN DE CAMBIOS

### Backend
- ✅ ProductController.java: 4 cambios (POST, PUT, DELETE, GET)
- ✅ ProductService.java: 3 cambios (crear, actualizar, eliminar)
- ✅ ProductStatus.java: 1 cambio (renombrar estados)
- ✅ UserController.java: 1 cambio (cambiar @RequestParam)
- ✅ UserService.java: 2 cambios (updateUserRole, deleteUser)

### Frontend
- ✅ CreateProductModal.jsx: 1 nuevo archivo (~200 líneas)
- ✅ VendorDashboard.jsx: 3 cambios (imports, state, button, modal)

### Total
- **Archivos modificados:** 6 backend + 2 frontend = 8
- **Líneas de código:** ~300 nuevas
- **Tiempo total:** 4-5 horas
- **Riesgo:** BAJO

---

## 🎯 CHECKLIST FINAL

```
BLOQUE 1 (5 min):
☐ ProductController: Agregar @PreAuthorize a POST, PUT, DELETE

BLOQUE 2 (20 min):
☐ UserController: Cambiar @RequestParam a @RequestBody
☐ UserService: Agregar validaciones en updateUserRole

BLOQUE 3 (20 min):
☐ UserService: Proteger deleteUser

BLOQUE 4 (15 min):
☐ ProductService: Agregar getAllApprovedProducts
☐ ProductController: Cambiar endpoint GET

BLOQUE 5 (30 min):
☐ ProductStatus: Renombrar estados
☐ ProductService: Validar edición en PENDING
☐ ProductService: Cambiar deleteProduct a cancelar

BLOQUE 6 (60 min):
☐ CreateProductModal.jsx: Crear archivo
☐ ProductController: Cambiar POST endpoint
☐ VendorDashboard.jsx: Agregar modal y handler

TESTING (30 min):
☐ Compilar backend
☐ Compilar frontend
☐ Testing manual de 27 pasos

GIT:
☐ git add .
☐ git commit -m "fix: Critical bugs - vendor, admin, superadmin, client"
☐ git push origin fix/critical-bugs-nov23
```

---

## 🚀 SIGUIENTE: Pull Request

```bash
# 1. Pushear cambios
git push origin fix/critical-bugs-nov23

# 2. Crear Pull Request en GitHub/GitLab
# Title: "🔴 Fix: Critical Bugs - Vendor, Admin, SuperAdmin, Client"
# Description: Copiar diagnóstico

# 3. Revisar CI/CD (tests)

# 4. Merge a main/develop

# 5. Deploy a staging
```

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Compilación error:** Verificar imports en archivos modificados
2. **Test error:** Revisar que todos los cambios estén completos
3. **Runtime error:** Chequear logs en `backend/logs`
4. **Frontend error:** Abrir DevTools (F12) ver console

**Contacto:** Revisar documentos de diagnóstico

---

**Status:** 🟢 LISTO PARA IMPLEMENTAR  
**ETA:** 4-5 horas  
**Impacto:** Sistema 85-95% funcional  
**Próximos pasos:** Stock inteligente (opcional, puede ser próxima iteración)

