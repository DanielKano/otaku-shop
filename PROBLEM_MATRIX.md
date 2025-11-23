# 📊 MATRIZ DE PROBLEMAS - VISTA GENERAL

---

## 🎯 MATRIZ DE SEVERIDAD vs IMPACTO

```
IMPACTO ALTO     │  🔴 #1 VENDOR      🔴 #2 SUPERADMIN   🔴 #4 CLIENTE
                 │  🔴 #3 ADMIN       🔴 #7 ENDPOINTS
                 │
IMPACTO MEDIO    │  🟠 #5 STOCK       🟠 #6 ESTADOS
                 │
IMPACTO BAJO     │
                 ├──────────────────────────────────────────────────
                   SEVERIDAD CRÍTICA    MAYORIDAD    MINOR
```

---

## 📋 TABLA DE PROBLEMAS COMPLETA

| # | Módulo | Problema | Severidad | Impacto | Ubicación | Línea | Fix Time |
|---|--------|----------|-----------|---------|-----------|-------|----------|
| 1 | VENDEDOR | Crear Producto NO funciona (sin handler) | 🔴 CRÍTICO | Bloqueado | Frontend: VendorDashboard.jsx | 93 | 30 min |
| 1 | VENDEDOR | Crear Producto NO tiene @PreAuthorize | 🔴 CRÍTICO | Inseguro | Backend: ProductController.java | 120 | 5 min |
| 1 | VENDEDOR | CreateProductModal NO existe | 🔴 CRÍTICO | Bloqueado | Frontend: modals/ | - | 45 min |
| 2 | SUPERADMIN | Cambiar rol: @RequestParam vs @RequestBody | 🔴 CRÍTICO | Bloqueado | Backend: UserController.java | 31 | 10 min |
| 2 | SUPERADMIN | Cambiar rol: Sin validaciones | 🔴 CRÍTICO | Inseguro | Backend: UserService.java | 27 | 20 min |
| 3 | ADMIN | Puede eliminar otros admins | 🔴 CRÍTICO | Seguridad | Backend: UserService.java | 37 | 15 min |
| 3 | ADMIN | Borra usuario en BD (no suspende) | 🔴 CRÍTICO | Seguridad | Backend: UserService.java | 42 | 5 min |
| 4 | CLIENTE | Productos no se muestran (sin filtro APPROVED) | 🔴 CRÍTICO | Tienda Vacía | Backend: ProductService.java | 26 | 15 min |
| 5 | CLIENTE | Stock inteligente NO implementado | 🟠 MAYOR | Acaparamiento | Backend: CartService.java | 56 | 2 hrs |
| 5 | CLIENTE | Sin límite máximo por usuario | 🟠 MAYOR | Acaparamiento | Backend: CartItem.java | - | 1 hr |
| 5 | CLIENTE | Sin expiración de carrito | 🟠 MAYOR | Stock bloqueado | Backend: CartCleanupService.java | NEW | 1 hr |
| 6 | PRODUCTOS | Estados en inglés (no español) | 🟡 MENOR | UX | Backend: ProductStatus.java | 3 | 5 min |
| 6 | PRODUCTOS | Vendedor puede editar APROBADOS | 🟠 MAYOR | Lógica incorrecta | Backend: ProductService.java | 82 | 10 min |
| 6 | PRODUCTOS | Delete borra (no cambia a CANCELADO) | 🟠 MAYOR | Lógica incorrecta | Backend: ProductService.java | 104 | 10 min |
| 7 | GENERAL | POST /products sin @PreAuthorize | 🔴 CRÍTICO | Inseguro | Backend: ProductController.java | 120 | 1 min |
| 7 | GENERAL | PUT /products/{id} sin @PreAuthorize | 🔴 CRÍTICO | Inseguro | Backend: ProductController.java | 115 | 1 min |
| 7 | GENERAL | DELETE /products/{id} sin @PreAuthorize | 🔴 CRÍTICO | Inseguro | Backend: ProductController.java | 135 | 1 min |

---

## 🔴 CRÍTICOS - IMPLEMENTAR YA

### Bug #1: Crear Producto (Vendedor)
- **Problema:** Botón existe pero sin handler + modal no existe
- **Ubicaciones:** 
  - `VendorDashboard.jsx:93` - Sin onClick
  - `ProductController.java:120` - Sin @PreAuthorize
  - `modals/CreateProductModal.jsx` - No existe
- **Solución:** 30-45 minutos
- **Prioridad:** 🔴 MÁXIMA

### Bug #2: Cambiar Rol (SuperAdmin)
- **Problema:** Mismatch entre @RequestParam backend y @RequestBody frontend
- **Ubicaciones:**
  - `UserController.java:31` - @RequestParam
  - `ChangeRolesModal.jsx:43` - Envía body
  - `UserService.java:27` - Sin validaciones
- **Solución:** 15-25 minutos
- **Prioridad:** 🔴 MÁXIMA

### Bug #3: Admin Validaciones
- **Problema:** Puede eliminar superadmin, borra en BD en lugar de suspender
- **Ubicaciones:**
  - `UserService.java:37-42` - Sin validaciones
- **Solución:** 15-20 minutos
- **Prioridad:** 🔴 MÁXIMA

### Bug #4: Productos No Se Muestran (Cliente)
- **Problema:** getAllProducts() retorna todos (PENDING, APPROVED, REJECTED)
- **Ubicaciones:**
  - `ProductService.java:26` - Sin filtro
  - `ProductController.java:26` - Sin filtro
- **Solución:** 15 minutos
- **Prioridad:** 🔴 MÁXIMA

### Bug #7: Endpoints Sin Protección
- **Problema:** POST, PUT, DELETE en /products sin @PreAuthorize
- **Ubicaciones:**
  - `ProductController.java:120, 115, 135` - Sin @PreAuthorize
- **Solución:** 5 minutos
- **Prioridad:** 🔴 MÁXIMA

---

## 🟠 MAYORES - IMPLEMENTAR HOY

### Bug #5: Stock Inteligente
- **Problema:** Sin límite máximo, sin reserva, sin expiración
- **Ubicaciones:**
  - `CartItem.java` - Falta expiresAt
  - `Product.java` - Falta maxQuantityPerUser, reservedStock
  - `CartService.java` - Sin validaciones
  - `CartCleanupService.java` - No existe
- **Solución:** 2-3 horas
- **Prioridad:** 🟠 ALTA

### Bug #6: Estados Producto
- **Problema:** Nombres en inglés, edición sin validación, delete en lugar de cancelar
- **Ubicaciones:**
  - `ProductStatus.java` - Estados en inglés
  - `ProductService.java:82` - Sin validación en updateProduct
  - `ProductService.java:104` - deleteProduct borra en lugar de cancelar
- **Solución:** 25-30 minutos
- **Prioridad:** 🟠 ALTA

---

## 🟡 MENORES - PRÓXIMAS SEMANAS

### Mejoras Pendientes
- [ ] Validación de email en registro
- [ ] Verificación de email
- [ ] Reset de contraseña
- [ ] Notificaciones por email
- [ ] Auditoria de cambios
- [ ] Búsqueda full-text
- [ ] Ratings y reviews
- [ ] Historial de órdenes
- [ ] Descuentos y promociones

---

## 📊 ANÁLISIS POR ROL

### 👤 CLIENTE
| Estado | Feature | Problema |
|--------|---------|----------|
| ❌ | Ver productos | No filtrado por APPROVED |
| ⚠️ | Carrito | Sin stock inteligente |
| ❌ | Límite por usuario | No implementado |
| ❌ | Abandonocarrito | Sin liberación automática |
| ✅ | Checkout | OK (después de arreglos) |

**Productividad:** 20% → 80% (con arreglos)

---

### 💼 VENDEDOR
| Estado | Feature | Problema |
|--------|---------|----------|
| ❌ | Crear producto | Sin handler, sin modal |
| ⚠️ | Editar producto | Sin validación de estado |
| ❌ | Cancelar producto | No implementado |
| ✅ | Ver productos | OK |
| ❌ | Aprobar productos | No debería poder (OK) |

**Productividad:** 0% → 70% (con arreglos)

---

### 🔑 ADMIN
| Estado | Feature | Problema |
|--------|---------|----------|
| ✅ | Aprobar productos | OK |
| ✅ | Rechazar productos | OK |
| ⚠️ | Gestión usuarios | Sin validaciones |
| ❌ | Eliminar usuarios | Borra en BD + sin validación |
| ⚠️ | Ver usuarios | Ve admins/superadmins (debería filtrar) |

**Productividad:** 50% → 85% (con arreglos)

---

### 👑 SUPERADMIN
| Estado | Feature | Problema |
|--------|---------|----------|
| ❌ | Cambiar rol | @RequestParam vs @RequestBody |
| ⚠️ | Crear usuario | Sin validación de rol creado |
| ❌ | Crear superadmin | Debería bloquearse |
| ❌ | Cambiar a superadmin | Debería bloquearse |
| ✅ | Eliminar usuario | OK (después de arreglos) |

**Productividad:** 40% → 90% (con arreglos)

---

## ⏱️ CRONOGRAMA DE IMPLEMENTACIÓN

### Día 1 (Hoy - 4-5 horas)
```
[ ] 08:00 - 08:30: Bug #7 (@PreAuthorize) = 5 min
[ ] 08:30 - 09:00: Bug #2 (Cambiar rol) = 20-30 min
[ ] 09:00 - 09:30: Bug #3 (Admin validaciones) = 15-20 min
[ ] 09:30 - 10:15: Bug #4 (Productos aprobados) = 15 min
[ ] 10:15 - 11:00: Break + Testing = 30 min
[ ] 11:00 - 12:00: Bug #1 (Crear producto) = 45-60 min
[ ] 12:00 - 12:30: Bug #6 (Estados producto) = 25-30 min
[ ] 12:30 - 13:00: Testing rápido = 30 min
```

### Día 2-3 (Esta semana - 2-3 horas)
```
[ ] Bug #5 (Stock inteligente) = 2-3 horas
[ ] Testing exhaustivo
```

### Después
```
[ ] Mejoras menores
[ ] Documentación
[ ] Deployment
```

---

## 📈 PROYECCIÓN DE MEJORA

```
ANTES:
├─ Funcionalidad: 40%
├─ Seguridad: 60%
├─ Testing: 0%
└─ Documentación: 30%

DESPUÉS (Hoy):
├─ Funcionalidad: 85%
├─ Seguridad: 85%
├─ Testing: 10%
└─ Documentación: 70%

DESPUÉS (Semana):
├─ Funcionalidad: 95%
├─ Seguridad: 90%
├─ Testing: 50%
└─ Documentación: 85%
```

---

## 🔍 VERIFICACIÓN RÁPIDA

### Pre-Implementación
```
✅ Backend compila
✅ Frontend compila
❌ Vendedor puede crear productos
❌ SuperAdmin puede cambiar roles
❌ Admin protegido contra eliminar superadmin
❌ Cliente ve solo productos aprobados
❌ Stock es inteligente
```

### Post-Implementación
```
✅ Backend compila
✅ Frontend compila
✅ Vendedor PUEDE crear productos
✅ SuperAdmin PUEDE cambiar roles
✅ Admin PROTEGIDO contra eliminar superadmin
✅ Cliente VE solo productos aprobados
✅ Stock es inteligente (reservado + límite)
✅ Sistema 85-95% funcional
```

---

## 📞 RECURSOS

- **Diagnóstico Completo:** `DIAGNOSTIC_COMPLETE_FINAL.md`
- **Resumen Ejecutivo:** `QUICK_BUGS_SUMMARY.md`
- **Código Listo:** `CODE_FIXES_READY.md`
- **Esta Matriz:** `PROBLEM_MATRIX.md`

---

**Generado:** 23/11/2025  
**Estado:** 🔴 CRÍTICO - 7 bugs identificados  
**Acción:** Implementar hoy  
**ETA:** 4-5 horas

