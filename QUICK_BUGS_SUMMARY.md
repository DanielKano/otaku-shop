# 🎯 RESUMEN EJECUTIVO - BUGS CRÍTICOS

## 📊 ESTADO: 🔴 CRÍTICO - 7 Problemas Graves Detectados

---

## 🚨 BUG #1: VENDEDOR - Crear Producto NO Funciona
**Severidad:** 🔴 CRÍTICO | **Impacto:** Funcionalidad bloqueada completamente

### El Problema
- Botón "+ Nuevo Producto" existe pero **NO tiene onClick handler**
- Modal para crear productos **NO existe** (solo existe para editar)
- Backend **NO tiene @PreAuthorize** en endpoint POST

### Ubicación
- **Frontend:** `frontend/src/pages/vendor/VendorDashboard.jsx` línea 93
- **Backend:** `backend/src/main/java/com/otakushop/controller/ProductController.java` línea ~120

### Solución Rápida (30 minutos)
1. Agregar `onClick={() => setIsCreateModalOpen(true)}` al botón
2. Crear componente `CreateProductModal.jsx`
3. Agregar `@PreAuthorize("hasRole('VENDEDOR')")` al endpoint POST

---

## 🚨 BUG #2: SUPERADMIN - Cambiar Rol NO Funciona
**Severidad:** 🔴 CRÍTICO | **Impacto:** Gestión de usuarios bloqueada

### El Problema
- Frontend envía en **@RequestBody**: `{ "role": "admin" }`
- Backend espera **@RequestParam**: `?role=admin`
- **Mismatch** = Error 400

### Ubicación
- **Frontend:** `frontend/src/components/modals/ChangeRolesModal.jsx` línea 43
- **Backend:** `backend/src/main/java/com/otakushop/controller/UserController.java` línea 31

### Solución Rápida (15 minutos)
1. Cambiar `@RequestParam` a `@RequestBody Map<String, String>`
2. Extraer role: `String role = request.get("role")`

---

## 🚨 BUG #3: ADMIN - Sin Validaciones de Rol (SEGURIDAD)
**Severidad:** 🔴 CRÍTICO | **Impacto:** Vulnerabilidad de seguridad

### El Problema
- Admin **PUEDE eliminar** otros admins y superadmins (debería estar bloqueado)
- `deleteUser()` **borra de BD** en lugar de suspender (soft delete)
- **SIN validaciones de rol** en UserService

### Ubicación
- **Backend:** `backend/src/main/java/com/otakushop/service/UserService.java` línea 37-42

### Solución Rápida (30 minutos)
1. Agregar validación: "si rol destino es SUPERADMIN → rechazar"
2. Cambiar `deleteById()` a `user.setEnabled(false)`
3. Validar "current user role" antes de permitir cambios

---

## 🚨 BUG #4: CLIENTE - Productos No Se Muestran
**Severidad:** 🔴 CRÍTICO | **Impacto:** Tienda vacía para clientes

### El Problema
- `getAllProducts()` retorna **TODOS** los productos (PENDING, APPROVED, REJECTED)
- **NO filtra** por estado APPROVED
- Si no hay productos aprobados = tienda vacía

### Ubicación
- **Backend:** `backend/src/main/java/com/otakushop/service/ProductService.java` línea 26-30

### Solución Rápida (15 minutos)
1. Renombrar `getAllProducts()` a `getAllApprovedProducts()`
2. Agregar filtro: `.filter(p -> p.getStatus() == APPROVED)`
3. Endpoint publico ahora retorna solo APPROVED

---

## 🚨 BUG #5: CLIENTE - Stock Inteligente NO Implementado
**Severidad:** 🟠 MAYOR | **Impacto:** Clientes pueden acaparar stock

### El Problema
- **Sin límite máximo** de unidades por usuario (puede ser 100+)
- **Sin reserva de stock** en carrito (Cliente A compra todo, B puede agregar igual)
- **Sin expiración de carrito** (stock nunca se libera si abandona compra)

### Ubicación
- **Backend:** `backend/src/main/java/com/otakushop/entity/CartItem.java`
- **Backend:** `backend/src/main/java/com/otakushop/service/CartService.java` línea 56-77

### Solución (2-3 horas)
1. Agregar campos a Product: `maxQuantityPerUser`, `reservedStock`
2. Agregar campos a CartItem: `expiresAt` (24 horas)
3. En CartService.addItem(): validar cantidad máxima
4. Crear CartCleanupService con @Scheduled

---

## 🚨 BUG #6: PRODUCTOS - Estados NO Correctamente Implementados
**Severidad:** 🟠 MAYOR | **Impacto:** Lógica de negocio incompleta

### El Problema
- ProductStatus usa: **PENDING, APPROVED, REJECTED** (inglés)
- Requiere: **POSTULADO, APROBADO, CANCELADO** (español)
- Vendedor puede editar productos APROBADOS (debería solo POSTULADO)
- deleteProduct() **borra** en lugar de cambiar estado a CANCELADO

### Ubicación
- **Backend:** `backend/src/main/java/com/otakushop/entity/ProductStatus.java`
- **Backend:** `backend/src/main/java/com/otakushop/service/ProductService.java` línea 82, 95, 145

### Solución (45 minutos)
1. Renombrar estados en enum
2. Agregar validación en updateProduct(): solo si POSTULADO
3. Cambiar deleteProduct(): de delete a cambiar status a CANCELADO

---

## 🚨 BUG #7: GENERAL - Endpoints SIN @PreAuthorize
**Severidad:** 🔴 CRÍTICO | **Impacto:** Falta de protección

### El Problema
```
POST /api/products - SIN @PreAuthorize (cualquiera puede crear)
PUT /api/products/{id} - SIN @PreAuthorize (cualquiera puede editar)
DELETE /api/products/{id} - SIN @PreAuthorize (cualquiera puede eliminar)
```

### Solución (5 minutos)
Agregar a cada endpoint:
```java
@PreAuthorize("hasRole('VENDEDOR')")
```

---

## ⚡ ORDEN DE CORRECCIÓN (Prioridad)

| # | Bug | Tiempo | Prioridad |
|---|-----|--------|-----------|
| 1 | #1 Crear Producto | 30 min | 🔴 NOW |
| 2 | #2 Cambiar Rol | 15 min | 🔴 NOW |
| 3 | #3 Admin Validaciones | 30 min | 🔴 NOW |
| 4 | #7 @PreAuthorize | 5 min | 🔴 NOW |
| 5 | #4 Productos Approved | 15 min | 🔴 TODAY |
| 6 | #6 Estados Producto | 45 min | 🟠 TODAY |
| 7 | #5 Stock Inteligente | 2-3 hrs | 🟠 THIS WEEK |

**Total de Correcciones:** ~4-5 horas
**Después:** Sistema 85% funcional

---

## 📋 VERIFICACIÓN RÁPIDA

### Antes de Correcciones
```
✅ Autenticación funciona
✅ Login/Registro funciona
❌ Vendedor NO puede crear productos
❌ SuperAdmin NO puede cambiar roles
❌ Admin puede eliminar superadmin (BUG SEGURIDAD)
❌ Cliente no ve productos
❌ Stock no es inteligente
❌ Edición de productos sin validación
❌ Estados de producto en inglés
```

### Después de Correcciones
```
✅ Vendedor PUEDE crear productos
✅ SuperAdmin PUEDE cambiar roles
✅ Admin PROTEGIDO contra cambios ilegales
✅ Cliente VE solo productos aprobados
✅ Stock es inteligente (reservado + límite)
✅ Edición solo en POSTULADO
✅ Estados en español correcto
✅ Sistema 85% funcional
```

---

## 🔍 CÓMO REPRODUCIR CADA BUG

### Bug #1: Crear Producto
```
1. Login como Vendedor
2. Click "Panel de Vendedor"
3. Click "+ Nuevo Producto"
4. ❌ NADA sucede
```

### Bug #2: Cambiar Rol
```
1. Login como SuperAdmin
2. Click "Cambiar Roles"
3. Selecciona usuario + rol
4. Click "Cambiar"
5. ❌ Error 400 Bad Request
```

### Bug #3: Admin Seguridad
```
1. Login como Admin
2. Ir a "Gestión de Usuarios"
3. Intentar eliminar SuperAdmin
4. ✅ Se elimina (DEBERÍA bloquearse)
```

### Bug #4: Productos No Se Muestran
```
1. Crear producto como Vendedor (cuando se arregle Bug #1)
2. Sin aprobar (estado = PENDING)
3. Login como Cliente
4. Click "Productos"
5. ❌ Producto no aparece (CORRECTO)
6. (pero debería aparecer al aprobar)
```

### Bug #5: Stock Inteligente
```
1. Producto con 10 unidades
2. Cliente A agrega 10 al carrito
3. Cliente B intenta agregar 1
4. ✅ Puede agregar (DEBERÍA bloquearse)
```

### Bug #6: Estados Producto
```
1. Crear producto (estado = PENDING)
2. Editar después de aprobar (estado = APPROVED)
3. ✅ Puede editar (DEBERÍA bloquearse)
```

### Bug #7: Sin @PreAuthorize
```
1. Sin autenticación
2. POST /api/products (sin token)
3. ✅ Crea producto (DEBERÍA rechazar 401)
```

---

## 📊 RESUMEN DE CAMBIOS

| Componente | Tipo | Líneas | Cambio |
|-----------|------|--------|--------|
| VendorDashboard.jsx | Frontend | ~5 | Agregar onClick + Modal |
| CreateProductModal.jsx | Frontend | ~200 | NUEVO archivo |
| ProductController.java | Backend | ~10 | @PreAuthorize + cambio body |
| UserController.java | Backend | ~5 | Cambiar @RequestParam |
| UserService.java | Backend | ~30 | Validaciones de rol |
| ProductService.java | Backend | ~20 | Filtros y validaciones |
| ProductStatus.java | Backend | ~5 | Renombrar estados |
| CartService.java | Backend | ~25 | Stock inteligente |
| CartItem.java | Backend | ~10 | Nuevos campos |
| Product.java | Backend | ~5 | Nuevos campos |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```
CRÍTICAS (HOY):
☐ Bug #1: Crear Producto - Vendedor
☐ Bug #2: Cambiar Rol - SuperAdmin
☐ Bug #3: Validaciones Admin
☐ Bug #7: @PreAuthorize endpoints

MAYORES (HOY):
☐ Bug #4: Productos Approved - Cliente
☐ Bug #6: Estados Producto

SEMANA:
☐ Bug #5: Stock Inteligente
☐ Testing de todos los bugs
☐ Deploy a staging
```

---

**Documentación:** 23/11/2025  
**Tiempo de lectura:** 5-10 minutos  
**Tiempo de implementación:** 4-5 horas  
**Impacto:** Sistema funcional 85%+
