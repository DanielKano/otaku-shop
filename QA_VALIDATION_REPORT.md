# 🔍 REPORTE COMPLETO DE VALIDACIÓN QA - OTAKU SHOP
**Fecha**: 22 de Noviembre, 2025  
**Ejecutor**: QA Senior + Arquitecto Full Stack  
**Estado**: ANÁLISIS EN PROGRESO

---

## 📋 TABLA DE CONTENIDOS
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Módulo 1: Autenticación](#módulo-1-autenticación)
4. [Módulo 2: Gestión de Usuarios](#módulo-2-gestión-de-usuarios)
5. [Módulo 3: Productos](#módulo-3-productos)
6. [Módulo 4: Carrito](#módulo-4-carrito)
7. [Módulo 5: Órdenes y Pagos](#módulo-5-órdenes-y-pagos)
8. [Módulo 6: Roles y Permisos](#módulo-6-roles-y-permisos)
9. [Seguridad](#seguridad)
10. [Hallazgos Críticos](#hallazgos-críticos)
11. [Hallazgos Mayores](#hallazgos-mayores)
12. [Hallazgos Menores](#hallazgos-menores)
13. [Plan de Pruebas](#plan-de-pruebas)
14. [Checklist Completo](#checklist-completo)

---

## 📊 RESUMEN EJECUTIVO

### Estado General del Sistema
```
✅ BACKEND:        Spring Boot 3.2 + PostgreSQL 14
✅ FRONTEND:       React 18 + Vite 5.4
✅ AUTENTICACIÓN:  JWT + Spring Security
✅ CORS:           Configurado para localhost:5173
✅ BASE DE DATOS:  PostgreSQL en localhost:5432

⚠️  ESTADO ACTUAL: EN DESARROLLO - REQUIERE VALIDACIÓN COMPLETA
```

### Métricas Iniciales
- **Controllers**: 4 (Auth, Product, User, Home)
- **Services**: 4 (Auth, Product, User, + CustomUserDetailsService)
- **Repositories**: 4 (User, Product, Order, OrderItem)
- **Rutas Frontend**: 15+ rutas configuradas
- **Endpoints Backend**: ~20+ endpoints identificados

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Stack Tecnológico
```
┌─ FRONTEND ─────────────────────────────────┐
│ React 18.3.1 + Vite 5.4.21                │
│ Axios + React Router + React Hook Form    │
│ Tailwind CSS + Context API                 │
│ PUERTO: 5173                               │
└────────────────────────────────────────────┘
         ↕ API REST (JWT)
┌─ BACKEND ──────────────────────────────────┐
│ Java 21 + Spring Boot 3.2.0                │
│ Spring Security 6.2.0                      │
│ JPA + Hibernate 6.3.1                      │
│ JJWT (JWT Library)                         │
│ PostgreSQL Driver                          │
│ PUERTO: 8080, CONTEXTO: /api               │
└────────────────────────────────────────────┘
         ↕ JDBC
┌─ BASE DE DATOS ────────────────────────────┐
│ PostgreSQL 14.x                            │
│ Database: otaku_shop                       │
│ Puerto: 5432                               │
│ Tablas: users, products, orders, etc       │
└────────────────────────────────────────────┘
```

### Flujo de Autenticación
```
Login Request (email, password)
        ↓
[AuthController.login()]
        ↓
[AuthService.login()] → authenticate with Spring Security
        ↓
[JwtTokenProvider.generateToken()] → create JWT
        ↓
[AuthResponse] → return token + user data
        ↓
Frontend stores token in localStorage
        ↓
All subsequent requests include: Authorization: Bearer <token>
        ↓
[JwtAuthenticationFilter] → validates token for protected endpoints
```

---

## 🔐 MÓDULO 1: AUTENTICACIÓN

### 1.1 Endpoints Identificados
| Endpoint | Método | Autenticación | Status |
|----------|--------|---------------|--------|
| `/auth/register` | POST | ❌ Público | ✅ Implementado |
| `/auth/login` | POST | ❌ Público | ✅ Implementado |
| `/auth/create-superadmin` | POST | ❌ Público | ⚠️ PROBLEMA |
| `/auth/logout` | POST | ✅ JWT | ❌ NO IMPLEMENTADO |
| `/auth/verify` | GET | ✅ JWT | ❌ NO IMPLEMENTADO |
| `/auth/refresh-token` | POST | ✅ JWT | ❌ NO IMPLEMENTADO |
| `/auth/resend-verification` | POST | ❌ Público | ❌ NO IMPLEMENTADO |
| `/auth/reset-password` | POST | ❌ Público | ❌ NO IMPLEMENTADO |

### 1.2 Validaciones de Registro

**Campos Esperados**:
```json
{
  "name": "string",
  "email": "email válido",
  "password": "mínimo 8 caracteres con mayúscula, número, especial",
  "confirmPassword": "debe coincidir con password",
  "phone": "string",
  "role": "cliente|vendedor|admin"
}
```

**Estado en Frontend**:
- ✅ Email validation (Zod)
- ✅ Password strength validation
- ✅ Phone validation
- ❓ Confirmación de email (¿verificación?)
- ❌ Términos y condiciones checkbox
- ❌ Captcha

**Estado en Backend**:
- ✅ Email uniqueness check
- ✅ Password encoding (BCrypt)
- ✅ Rol assignment
- ⚠️ NO HAY VALIDACIÓN DE EMAIL VERIFICADO antes de permitir login

### 1.3 Validaciones de Login

**Campos**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Estado**:
- ✅ Email y password requeridos
- ✅ Validación de credenciales con Spring Security
- ✅ JWT generation
- ❌ Rate limiting (¿protección contra fuerza bruta?)
- ❌ Tracking de intentos fallidos

### 1.4 Gestión de Sesiones

**Estado Actual**:
- ✅ Token guardado en localStorage
- ✅ User data guardado en localStorage
- ✅ AuthContext con state management
- ⚠️ useEffect en AuthContext carga user desde localStorage (CORRECTO)
- ⚠️ Token expiration: 24 horas (86400000 ms)
- ❌ NO HAY REFRESH TOKEN IMPLEMENTATION
- ❌ NO HAY LOGOUT API CALL (solo borra localStorage)

---

## 👥 MÓDULO 2: GESTIÓN DE USUARIOS

### 2.1 Endpoints Identificados

| Endpoint | Método | Autorización | Status |
|----------|--------|--------------|--------|
| `/users` | GET | ADMIN, SUPERADMIN | ✅ Implementado |
| `/users/{id}` | GET | ADMIN, SUPERADMIN | ✅ Implementado |
| `/users/{id}/role` | PUT | SUPERADMIN | ✅ Implementado |
| `/users/{id}/suspend` | PUT | ADMIN, SUPERADMIN | ✅ Implementado |
| `/users/{id}` | DELETE | SUPERADMIN | ✅ Implementado |
| `/users/profile` | GET | ✅ JWT | ❌ NO IMPLEMENTADO |
| `/users/profile` | PUT | ✅ JWT | ❌ NO IMPLEMENTADO |

### 2.2 Roles del Sistema

```
┌─────────────────────────────────────────────────────┐
│ CLIENTE (cliente)                                   │
├─────────────────────────────────────────────────────┤
│ ✅ Ver productos aprobados                         │
│ ✅ Ver carrito                                      │
│ ✅ Hacer compras                                    │
│ ✅ Ver historial de órdenes                         │
│ ✅ Ver perfil                                       │
│ ❌ Publicar productos                               │
│ ❌ Editar otros usuarios                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ VENDEDOR (vendedor)                                 │
├─────────────────────────────────────────────────────┤
│ ✅ Ver productos aprobados                         │
│ ✅ Publicar productos (estado POSTULADO)           │
│ ✅ Ver sus propios productos                        │
│ ✅ Editar productos POSTULADOS                      │
│ ✅ Cancelar productos APROBADOS                     │
│ ✅ Ver sus ventas                                   │
│ ✅ Ver notificaciones de aprobación/rechazo        │
│ ❌ Ver otros vendedores                             │
│ ❌ Cambiar roles                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ADMIN (admin)                                       │
├─────────────────────────────────────────────────────┤
│ ✅ Ver todos los usuarios                          │
│ ✅ Ver todos los productos                         │
│ ✅ Aprobar/rechazar productos                      │
│ ✅ Cancelar productos                              │
│ ✅ Ver ventas generales                            │
│ ✅ Editar productos POSTULADOS                      │
│ ✅ Desactivar usuarios                              │
│ ❌ Cambiar roles de usuarios                        │
│ ❌ Crear superadmin                                 │
│ ❌ Deletear usuarios                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SUPERADMIN (superadmin)                             │
├─────────────────────────────────────────────────────┤
│ ✅ Todo lo del Admin                               │
│ ✅ Cambiar roles (cliente ↔ vendedor ↔ admin)     │
│ ✅ Deletear usuarios                                │
│ ✅ Desactivar usuarios                              │
│ ✅ Crear nuevos usuarios                            │
│ ⚠️  NO PUEDE crear otro SUPERADMIN                 │
│ ⚠️  NUNCA debe perder su rol                        │
└─────────────────────────────────────────────────────┘
```

### 2.3 Validaciones de Roles

**Backend**:
- ✅ Anotaciones `@PreAuthorize("hasRole('...')")` en endpoints
- ✅ UserService valida cambios de rol
- ❌ NO hay validación para evitar que Admin cambie su propio rol
- ❌ NO hay validación para evitar que SUPERADMIN sea reemplazado
- ❌ NO hay endpoint para obtener perfil actual

**Frontend**:
- ✅ ProtectedRoute valida roles
- ✅ Navigation condicional por rol
- ❌ NO hay UI para cambiar roles (solo endpoint existe)
- ❌ NO hay UI para crear usuarios (solo endpoint existe)

---

## 🛍️ MÓDULO 3: PRODUCTOS

### 3.1 Endpoints Identificados

| Endpoint | Método | Autorización | Status |
|----------|--------|--------------|--------|
| `/products` | GET | Público | ✅ Implementado |
| `/products/{id}` | GET | Público | ✅ Implementado |
| `/products/category/{cat}` | GET | Público | ✅ Implementado |
| `/products/search` | GET | Público | ✅ Implementado |
| `/products/filter` | GET | Público | ✅ Implementado |
| `/products` | POST | Vendedor | ✅ Implementado |
| `/products/{id}` | PUT | Vendedor | ✅ Implementado |
| `/products/{id}` | DELETE | Vendedor | ✅ Implementado |
| `/products/{id}/approve` | POST | Admin | ❌ NO IMPLEMENTADO |
| `/products/{id}/reject` | POST | Admin | ❌ NO IMPLEMENTADO |
| `/products/pending` | GET | Admin | ❌ NO IMPLEMENTADO |

### 3.2 Estados de Productos

```
┌────────────────────────────────────────────────┐
│ POSTULADO (submitted)                          │
├────────────────────────────────────────────────┤
│ ✅ Vendedor lo publicó                         │
│ ✅ Esperando aprobación de Admin              │
│ ✅ NO visible para Clientes                    │
│ ✅ Vendedor PUEDE editar                       │
│ ✅ Vendedor PUEDE cancelar                     │
│ ✅ Admin PUEDE editar                          │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ APROBADO (approved)                            │
├────────────────────────────────────────────────┤
│ ✅ Admin lo aprobó                             │
│ ✅ VISIBLE para Clientes                       │
│ ❌ Vendedor NO PUEDE editar                    │
│ ✅ Vendedor PUEDE cancelar                     │
│ ❌ Admin NO PUEDE editar                       │
│ ❌ Stock se maneja automáticamente              │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ CANCELADO (cancelled)                          │
├────────────────────────────────────────────────┤
│ ✅ Vendedor lo canceló                         │
│ ✅ O Admin lo rechazó                          │
│ ❌ NO visible para Clientes                    │
│ ✅ Históricamente disponible                   │
└────────────────────────────────────────────────┘
```

### 3.3 Propiedades del Producto

**Esperadas**:
```json
{
  "id": "Long",
  "name": "String",
  "description": "String",
  "category": "String",
  "price": "BigDecimal",
  "stock": "Integer",
  "status": "POSTULADO|APROBADO|CANCELADO",
  "vendorId": "Long",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime",
  "images": "List<String>"
}
```

**Estado en Backend**:
- ✅ Campos básicos implementados
- ⚠️ Status field (¿cómo se maneja?)
- ❌ NO hay implementación de manejo de imágenes
- ❌ NO hay validación de stock mínimo

**Estado en Frontend**:
- ✅ Lista de productos
- ✅ Detalle de producto
- ✅ Filtros y búsqueda
- ❌ Formulario de creación de producto (vendedor)
- ❌ Interfaz de aprobación (admin)
- ❌ Galería de imágenes

### 3.4 Validaciones de Negocio

**Regla 1**: Productos POSTULADOS NO son visibles para Clientes
- ⚠️ ESTADO: ¿Se valida en backend? ¿Filtrado en ProductService?

**Regla 2**: Vendedor NO puede editar productos APROBADOS
- ⚠️ ESTADO: ¿ProductService valida esto?

**Regla 3**: Stock se descuenta SOLO al confirmar compra
- ❌ ESTADO: NO IMPLEMENTADO (módulo de órdenes sin hacer)

**Regla 4**: No se ELIMINAN productos, se cambian de estado
- ⚠️ ESTADO: DELETE endpoint existe pero ¿qué hace realmente?

---

## 🛒 MÓDULO 4: CARRITO

### 4.1 Endpoints Identificados

| Endpoint | Método | Autorización | Status |
|----------|--------|--------------|--------|
| `/cart` | GET | JWT | ❌ NO IMPLEMENTADO |
| `/cart/add` | POST | JWT | ❌ NO IMPLEMENTADO |
| `/cart/{item}` | PUT | JWT | ❌ NO IMPLEMENTADO |
| `/cart/{item}` | DELETE | JWT | ❌ NO IMPLEMENTADO |
| `/cart` | DELETE | JWT | ❌ NO IMPLEMENTADO |

### 4.2 Gestión de Carrito

**Requerimientos**:
1. Carrito temporal (sin login) usando session_id
2. Al login, unir carrito temporal + carrito real
3. Persistencia en base de datos
4. Expiración automática

**Estado**:
- ✅ Frontend tiene CartContext y useCart hook
- ✅ Frontend tiene CartService con métodos
- ❌ Backend NO tiene endpoints de carrito
- ❌ NO hay persistencia en BD
- ❌ NO hay manejo de carrito pre-login

### 4.3 Flujo de Carrito

```
Usuario Anónimo
    ↓
Selecciona productos
    ↓
Carrito temporal en localStorage/sessionStorage
    ↓
Hace login
    ↓
¿Se unifica? → ❌ NO IMPLEMENTADO
    ↓
Revisa carrito
    ↓
Procede a checkout
```

---

## 💳 MÓDULO 5: ÓRDENES Y PAGOS

### 5.1 Endpoints Identificados

| Endpoint | Método | Autorización | Status |
|----------|--------|--------------|--------|
| `/orders` | POST | JWT | ❌ NO IMPLEMENTADO |
| `/orders` | GET | JWT | ❌ NO IMPLEMENTADO |
| `/orders/{id}` | GET | JWT | ❌ NO IMPLEMENTADO |
| `/orders/{id}/invoice` | GET | JWT | ❌ NO IMPLEMENTADO (PDF) |
| `/orders/{id}/cancel` | POST | JWT | ❌ NO IMPLEMENTADO |

### 5.2 Validaciones de Compra

**Checklist de Validación**:
- ❌ Validar stock disponible
- ❌ Validar precio (evitar manipulation)
- ❌ Validar usuario existe
- ❌ Calcular total con impuestos
- ❌ Generar factura PDF
- ❌ Notificar al vendedor
- ❌ Notificar al cliente
- ❌ Actualizar stock

### 5.3 Estados de Orden

```
Posibles estados:
PENDIENTE → PAGADA → ENVIADA → ENTREGADA → COMPLETADA
                  → CANCELADA
```

**Estado en el sistema**: ❌ NO IMPLEMENTADO

---

## 🔑 MÓDULO 6: ROLES Y PERMISOS

### 6.1 Matriz de Permisos

```
                    CLIENTE  VENDEDOR  ADMIN  SUPERADMIN
Ver productos         ✅       ✅        ✅       ✅
Publicar prod         ❌       ✅        ❌       ❌
Editar prop           ❌       ⚠️        ⚠️       ⚠️
Aprobar prod          ❌       ❌        ✅       ✅
Ver usuarios          ❌       ❌        ✅       ✅
Cambiar roles         ❌       ❌        ❌       ✅
Deletear usuarios     ❌       ❌        ❌       ✅
Ver ventas            ⚠️       ✅        ✅       ✅
Ver órdenes           ✅       ⚠️        ✅       ✅

Leyenda:
✅ = Permitido
❌ = Prohibido
⚠️  = Depende de condiciones
```

### 6.2 Implementación en Backend

**Spring Security Configuration**:
```java
✅ @PreAuthorize("hasRole('...')") en endpoints
✅ @PreAuthorize("hasAnyRole('...','...')") para múltiples roles
⚠️  Faltan algunas protecciones en endpoints de productos
```

### 6.3 Implementación en Frontend

**ProtectedRoute**:
```jsx
✅ Valida autenticación
✅ Valida rol permitido
✅ Muestra spinner mientras carga
✅ Redirige a /login si no autenticado
```

---

## 🔒 SEGURIDAD

### 7.1 Checklist de Seguridad

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| CORS | ✅ | Configurado para localhost:5173 |
| JWT | ✅ | HS512 con expiración 24h |
| Password Hashing | ✅ | BCrypt implementado |
| SQL Injection | ✅ | JPA protege (parametrized queries) |
| CSRF | ✅ | Disabled (sesiones stateless) |
| Rate Limiting | ❌ | No implementado |
| Token Refresh | ❌ | No implementado |
| Email Verification | ❌ | No implementado |
| 2FA | ❌ | No implementado |
| Audit Logs | ❌ | No implementado |
| API Documentation | ⚠️ | README básico, no Swagger/OpenAPI |

### 7.2 Token JWT

**Estructura**:
```
Header: { "alg": "HS512" }
Payload: { "sub": "email", "userId": 123, "role": "vendedor", "iat": ..., "exp": ... }
Signature: HMACSHA512(secret)
```

**Expiración**: 24 horas (86400000 ms)
**Secreto**: `otakushop-secret-key-very-long-and-secure-for-production-use-only`
⚠️ **PROBLEMA**: Secreto hardcodeado en properties (debe ser variable de entorno)

### 7.3 CORS

**Configurado**:
```java
Allow Origins: http://localhost:5173, http://127.0.0.1:5173
Allow Methods: GET, POST, PUT, DELETE, OPTIONS
Allow Headers: *
Allow Credentials: true
```

✅ Correcto para desarrollo
⚠️ Debe cambiar en producción

---

## 🚨 HALLAZGOS CRÍTICOS

### CRÍTICO-001: `/auth/create-superadmin` es PÚBLICO
**Severidad**: 🔴 CRÍTICA  
**Descripción**: El endpoint para crear SUPERADMIN está públicamente disponible sin autenticación.

```java
@PostMapping("/create-superadmin")
@RequestMapping("/auth")  // ← SIN @PreAuthorize
public ResponseEntity<AuthResponse> createSuperAdmin(...) { }
```

**Impacto**: Cualquiera puede crear cuentas SUPERADMIN  
**Solución**:
```java
@PreAuthorize("hasRole('SUPERADMIN')")  // ← Agregar esto
@PostMapping("/create-superadmin")
```

---

### CRÍTICO-002: NO hay sistema de ÓRDENES/COMPRAS
**Severidad**: 🔴 CRÍTICA  
**Descripción**: El módulo completo de órdenes, checkouts y pagos no está implementado.

**Funcionalidad Faltante**:
- [ ] Endpoint POST `/orders` para crear órdenes
- [ ] Endpoint GET `/orders` para listar órdenes
- [ ] Validación de stock
- [ ] Cálculo de totales
- [ ] Generación de facturas PDF
- [ ] Notificaciones por email
- [ ] UI de checkout

**Impacto**: Clientes NO pueden comprar  
**Esfuerzo Estimado**: 40-60 horas

---

### CRÍTICO-003: No hay endpoints de CARRITO
**Severidad**: 🔴 CRÍTICA  
**Descripción**: Backend no tiene endpoints para gestionar carrito.

**Faltante**:
- [ ] GET /cart
- [ ] POST /cart/add
- [ ] PUT /cart/{id}
- [ ] DELETE /cart/{id}
- [ ] DELETE /cart (limpiar)

**Impacto**: Carrito no persiste en servidor  
**Solución**: Implementar CartController + CartService

---

### CRÍTICO-004: No hay aprobación de PRODUCTOS por Admin
**Severidad**: 🔴 CRÍTICA  
**Descripción**: Falta el flujo completo de aprobación de productos.

**Faltante**:
- [ ] Endpoint POST `/products/{id}/approve`
- [ ] Endpoint POST `/products/{id}/reject`
- [ ] Endpoint GET `/products/pending`
- [ ] Actualizar estado del producto
- [ ] Notificación al vendedor

**Impacto**: Productos nunca son APROBADOS  
**Solución**: Agregar métodos en ProductController

---

## ⚠️ HALLAZGOS MAYORES

### MAYOR-001: Falta validación de EMAIL VERIFICADO
**Severidad**: 🟠 MAYOR  
**Descripción**: No hay sistema de verificación de email después del registro.

**Checklist**:
- [ ] Envío de email de verificación
- [ ] Validación de token de email
- [ ] Retraso de login hasta verificar email
- [ ] Endpoint para reenviar email

**Estado Actual**:
- ✅ Formulario de registro acepta email
- ❌ No hay email de confirmación
- ❌ Usuario puede loguear sin verificar

**Solución**: Implementar servicio de email con confirmación

---

### MAYOR-002: Falta PROFILE del usuario
**Severidad**: 🟠 MAYOR  
**Descripción**: No hay endpoints para obtener/actualizar el perfil del usuario.

**Endpoints Faltantes**:
- [ ] GET `/users/profile` → Obtener perfil del usuario autenticado
- [ ] PUT `/users/profile` → Actualizar perfil

**Impacto**: Usuarios no pueden ver/editar su perfil  
**Solución**: Agregar en UserController

---

### MAYOR-003: No hay NOTIFICACIONES por email
**Severidad**: 🟠 MAYOR  
**Descripción**: Sistema no envía emails para eventos importantes.

**Emails Faltantes**:
- [ ] Bienvenida al registro
- [ ] Verificación de email
- [ ] Aprobación de producto
- [ ] Rechazo de producto
- [ ] Confirmación de compra
- [ ] Factura
- [ ] Cambio de rol
- [ ] Suspensión de cuenta

**Solución**: Implementar JavaMailSender + templates HTML

---

### MAYOR-004: No hay FACTURAS PDF
**Severidad**: 🟠 MAYOR  
**Descripción**: No se generan facturas PDF para órdenes.

**Faltante**:
- [ ] Endpoint GET `/orders/{id}/invoice`
- [ ] Generación de PDF (iText o similar)
- [ ] Información en PDF (producto, cantidad, total)
- [ ] Descarga automática

**Solución**: Usar librería iText o Apache PDFBox

---

### MAYOR-005: NO hay protección de TOKEN en ProductController
**Severidad**: 🟠 MAYOR  
**Descripción**: ProductController extrae token manualmente, debería usar @PreAuthorize.

**Actual** (Incorrecto):
```java
@PostMapping
public ResponseEntity<ProductDTO> createProduct(
    @RequestBody ProductRequest request,
    @RequestHeader("Authorization") String token) {  // ← Extrae manualmente
    Long vendorId = extractUserIdFromToken(token);
}
```

**Esperado**:
```java
@PostMapping
@PreAuthorize("hasRole('VENDEDOR')")
public ResponseEntity<ProductDTO> createProduct(
    @AuthenticationPrincipal UserDetails user,
    @RequestBody ProductRequest request) {  // ← Spring inyecta usuario
```

**Impacto**: Código frágil, riesgo de seguridad  
**Solución**: Refactorizar para usar Spring Security correctamente

---

## 🔶 HALLAZGOS MENORES

### MENOR-001: No hay Rate Limiting
**Severidad**: 🟡 MENOR  
**Descripción**: Sin protección contra fuerza bruta en login.

**Solución**: Implementar `@RateLimiter` de Spring Cloud

---

### MENOR-002: JWT Secret hardcodeado
**Severidad**: 🟡 MENOR  
**Descripción**: Secret en application.properties visible en código.

**Actual**:
```properties
jwt.secret=otakushop-secret-key-very-long-and-secure-for-production-use-only
```

**Solución**: Usar variables de entorno: `${JWT_SECRET:fallback-key}`

---

### MENOR-003: No hay validación de términos y condiciones
**Severidad**: 🟡 MENOR  
**Descripción**: Registro no valida aceptación de T&C.

**Solución**: Agregar checkbox en RegisterForm + validación Zod

---

### MENOR-004: Falta Swagger/OpenAPI
**Severidad**: 🟡 MENOR  
**Descripción**: API sin documentación interactiva.

**Solución**: Agregar `spring-doc-openapi` dependency

---

### MENOR-005: No hay Test Unitarios
**Severidad**: 🟡 MENOR  
**Descripción**: Código sin cobertura de tests.

**Solución**: Agregar JUnit 5 + Mockito para backend

---

## 📝 PLAN DE PRUEBAS

### Test Suite 1: Autenticación
```
TEST-AUTH-001: Registro exitoso
  - Precondición: Ninguna
  - Pasos: POST /auth/register con datos válidos
  - Esperado: HTTP 201, token generado, usuario creado
  - ✅ DEBE PASAR

TEST-AUTH-002: Registro con email duplicado
  - Precondición: Usuario existe
  - Pasos: POST /auth/register con email existente
  - Esperado: HTTP 400, mensaje de error
  - ❓ A VALIDAR

TEST-AUTH-003: Registro con password débil
  - Precondición: Ninguna
  - Pasos: POST /auth/register con password < 8 caracteres
  - Esperado: HTTP 400, mensaje de error
  - ✅ DEBE PASAR (Zod validation)

TEST-AUTH-004: Login exitoso
  - Precondición: Usuario registrado
  - Pasos: POST /auth/login con credenciales válidas
  - Esperado: HTTP 200, token JWT, datos de usuario
  - ✅ DEBE PASAR

TEST-AUTH-005: Login con credenciales inválidas
  - Precondición: Usuario existe
  - Pasos: POST /auth/login con password incorrecto
  - Esperado: HTTP 401, mensaje "credenciales inválidas"
  - ❓ A VALIDAR

TEST-AUTH-006: Acceso a endpoint protegido sin token
  - Precondición: Ninguna
  - Pasos: GET /users (sin Authorization header)
  - Esperado: HTTP 401 o redirigir a /login
  - ✅ DEBE PASAR

TEST-AUTH-007: Acceso a endpoint con token inválido
  - Precondición: Ninguna
  - Pasos: GET /users con token corrompido
  - Esperado: HTTP 401
  - ❓ A VALIDAR

TEST-AUTH-008: Token expirado
  - Precondición: Token expirado
  - Pasos: GET /users con token expirado
  - Esperado: HTTP 401
  - ❓ A VALIDAR (no hay refresh token)
```

### Test Suite 2: Roles y Autorización

```
TEST-ROLE-001: Admin accede a /users
  - Precondición: Usuario es ADMIN
  - Pasos: GET /users con token de admin
  - Esperado: HTTP 200, lista de usuarios
  - ✅ DEBE PASAR

TEST-ROLE-002: Cliente intenta acceder a /users
  - Precondición: Usuario es CLIENTE
  - Pasos: GET /users con token de cliente
  - Esperado: HTTP 403 (Forbidden)
  - ✅ DEBE PASAR

TEST-ROLE-003: Vendedor intenta crear producto
  - Precondición: Usuario es VENDEDOR
  - Pasos: POST /products con token de vendedor
  - Esperado: HTTP 201, producto creado con estado POSTULADO
  - ❓ A VALIDAR

TEST-ROLE-004: Cliente intenta crear producto
  - Precondición: Usuario es CLIENTE
  - Pasos: POST /products con token de cliente
  - Esperado: HTTP 403
  - ❓ A VALIDAR (¿está protegido?)

TEST-ROLE-005: Superadmin cambia rol de usuario
  - Precondición: Usuario es SUPERADMIN, existe usuario CLIENTE
  - Pasos: PUT /users/{id}/role con role="vendedor"
  - Esperado: HTTP 200, usuario ahora es VENDEDOR
  - ✅ DEBE PASAR

TEST-ROLE-006: Admin intenta cambiar rol
  - Precondición: Usuario es ADMIN
  - Pasos: PUT /users/{id}/role
  - Esperado: HTTP 403
  - ✅ DEBE PASAR (@PreAuthorize valida)
```

### Test Suite 3: Productos

```
TEST-PROD-001: Vendedor publica producto
  - Precondición: Usuario es VENDEDOR
  - Pasos: POST /products con datos válidos
  - Esperado: HTTP 201, estado=POSTULADO
  - ✅ DEBE PASAR

TEST-PROD-002: Cliente ve solo productos APROBADOS
  - Precondición: Existen productos POSTULADO y APROBADO
  - Pasos: GET /products sin autenticación
  - Esperado: HTTP 200, solo APROBADOS en lista
  - ❓ A VALIDAR (¿se filtra?)

TEST-PROD-003: Vendedor edita producto POSTULADO
  - Precondición: Producto es POSTULADO y propiedad del vendedor
  - Pasos: PUT /products/{id} con cambios
  - Esperado: HTTP 200, producto actualizado
  - ❓ A VALIDAR

TEST-PROD-004: Vendedor intenta editar producto APROBADO
  - Precondición: Producto es APROBADO
  - Pasos: PUT /products/{id}
  - Esperado: HTTP 403 (negado)
  - ❓ A VALIDAR (¿está validado?)

TEST-PROD-005: Admin aprueba producto
  - Precondición: Producto está POSTULADO
  - Pasos: POST /products/{id}/approve
  - Esperado: HTTP 200, estado=APROBADO
  - ❌ ENDPOINT NO EXISTE

TEST-PROD-006: Admin rechaza producto
  - Precondición: Producto está POSTULADO
  - Pasos: POST /products/{id}/reject
  - Esperado: HTTP 200, estado=CANCELADO, email a vendedor
  - ❌ ENDPOINT NO EXISTE
```

### Test Suite 4: Frontend UI

```
TEST-UI-001: Página de login se carga
  - Precondición: Ninguna
  - Pasos: Navegar a /login
  - Esperado: Formulario visible, campos de email y password
  - ✅ DEBE PASAR

TEST-UI-002: Login exitoso redirige a dashboard
  - Precondición: Credenciales válidas
  - Pasos: Llenar formulario y clickear "Ingresar"
  - Esperado: Redirige a /cliente/dashboard (o según rol)
  - ✅ DEBE PASAR

TEST-UI-003: Error en login muestra notificación
  - Precondición: Credenciales inválidas
  - Pasos: Llenar formulario con password incorrecto
  - Esperado: Toast de error visible
  - ✅ DEBE PASAR

TEST-UI-004: Página de productos se carga
  - Precondición: Ninguna
  - Pasos: Navegar a /productos
  - Esperado: Grid de productos visible
  - ✅ DEBE PASAR

TEST-UI-005: Filtro de productos funciona
  - Precondición: Existen productos
  - Pasos: Seleccionar filtro de categoría
  - Esperado: Lista se actualiza
  - ❓ A VALIDAR

TEST-UI-006: SuperAdmin Dashboard muestra botones
  - Precondición: Usuario es SUPERADMIN
  - Pasos: Navegar a /superadmin/dashboard
  - Esperado: Botones de "Ver Usuarios", "Ver Productos"
  - ✅ DEBE PASAR
```

---

## ✅ CHECKLIST COMPLETO DEL SISTEMA

### A. AUTENTICACIÓN (10/15)
- [x] Registro con validación
- [x] Login con JWT
- [x] Password hashing con BCrypt
- [x] Tokens en localStorage
- [x] AuthContext con estado de usuario
- [x] ProtectedRoute para rutas
- [x] CORS configurado
- [x] Logout borra localStorage
- [ ] Logout API call al backend
- [ ] Email de verificación
- [ ] Refresh token
- [ ] Recuperación de contraseña
- [ ] 2FA
- [ ] Rate limiting en login
- [ ] Términos y condiciones

### B. USUARIOS (7/12)
- [x] Endpoint GET /users (admin, superadmin)
- [x] Endpoint GET /users/{id}
- [x] Endpoint PUT /users/{id}/role (superadmin)
- [x] Endpoint DELETE /users/{id} (superadmin)
- [x] Endpoint PUT /users/{id}/suspend
- [ ] Endpoint GET /users/profile (usuario actual)
- [ ] Endpoint PUT /users/profile (actualizar perfil)
- [ ] Validación para no cambiar propio rol
- [ ] Protección de SUPERADMIN único
- [ ] Creación de usuario por superadmin
- [ ] Audit logs de cambios
- [ ] Notifications por cambio de rol

### C. PRODUCTOS (8/15)
- [x] Endpoint GET /products (público)
- [x] Endpoint GET /products/{id}
- [x] Endpoint GET /products/search
- [x] Endpoint GET /products/filter
- [x] Endpoint POST /products (vendedor)
- [x] Endpoint PUT /products/{id} (vendedor)
- [x] Endpoint DELETE /products/{id} (vendedor)
- [x] Estados: POSTULADO, APROBADO, CANCELADO
- [ ] Endpoint POST /products/{id}/approve (admin)
- [ ] Endpoint POST /products/{id}/reject (admin)
- [ ] Endpoint GET /products/pending (admin)
- [ ] Validación: NO editar aprobados
- [ ] Validación: NO ver postulados por cliente
- [ ] Manejo de imágenes/uploads
- [ ] Búsqueda full-text

### D. CARRITO (0/5)
- [ ] Endpoint GET /cart
- [ ] Endpoint POST /cart/add
- [ ] Endpoint PUT /cart/{id}
- [ ] Endpoint DELETE /cart/{id}
- [ ] Endpoint DELETE /cart (limpiar)

### E. ÓRDENES Y COMPRAS (0/10)
- [ ] Endpoint POST /orders
- [ ] Endpoint GET /orders
- [ ] Endpoint GET /orders/{id}
- [ ] Endpoint POST /orders/{id}/cancel
- [ ] Validación de stock
- [ ] Cálculo de totales
- [ ] Estados de orden (PENDIENTE, PAGADA, ENVIADA, etc)
- [ ] Generación de facturas PDF
- [ ] Notificación por compra
- [ ] Descarga de factura

### F. NOTIFICACIONES EMAIL (0/8)
- [ ] Email de bienvenida
- [ ] Email de verificación
- [ ] Email de aprobación de producto
- [ ] Email de rechazo de producto
- [ ] Email de confirmación de compra
- [ ] Email con factura
- [ ] Email de cambio de rol
- [ ] Email de suspensión de cuenta

### G. SEGURIDAD (6/10)
- [x] JWT tokens con expiración
- [x] BCrypt password hashing
- [x] CORS configurado
- [x] @PreAuthorize en endpoints
- [x] SQL Injection protection (JPA)
- [x] CSRF disabled (stateless)
- [ ] Rate limiting
- [ ] Token refresh mechanism
- [ ] 2FA
- [ ] Audit logs

### H. FRONTEND (12/20)
- [x] Página de login
- [x] Página de registro
- [x] Página de inicio
- [x] Página de productos
- [x] Página de detalle de producto
- [x] Página de carrito
- [x] Dashboard cliente
- [x] Dashboard vendedor
- [x] Dashboard admin
- [x] Dashboard superadmin
- [x] ProtectedRoute
- [x] Theme switcher (oscuro/claro)
- [ ] Formulario de creación de producto (vendedor)
- [ ] Interfaz de aprobación (admin)
- [ ] Página de checkout
- [ ] Confirmación de compra
- [ ] Historial de órdenes
- [ ] Descarga de facturas
- [ ] Página de perfil
- [ ] Manejo de notificaciones toast

### I. BASE DE DATOS (4/8)
- [x] Tabla users
- [x] Tabla products
- [x] Tabla orders
- [x] Tabla order_items
- [ ] Tabla cart_items
- [ ] Tabla notifications
- [ ] Tabla audit_logs
- [ ] Índices optimizados

### J. DOCUMENTACIÓN (3/5)
- [x] README backend
- [x] README frontend
- [ ] API Documentation (Swagger)
- [ ] Guía de instalación
- [ ] Diagrama de arquitectura

---

## 📊 RESUMEN DE GAPS

```
TOTAL CHECKLIST ITEMS: 110
IMPLEMENTADOS: 45 (40.9%)
FALTANTES: 65 (59.1%)

DISTRIBUCIÓN DE FALTANTES:
- Autenticación:         5/15 (33%)
- Usuarios:              5/12 (42%)
- Productos:             7/15 (47%)
- Carrito:               0/5 (0%)        ← CRÍTICO
- Órdenes:              0/10 (0%)        ← CRÍTICO
- Emails:               0/8 (0%)         ← CRÍTICO
- Seguridad:            4/10 (40%)
- Frontend:             12/20 (60%)
- BD:                   4/8 (50%)
- Documentación:        3/5 (60%)
```

---

## 🎯 RECOMENDACIONES PRIORITARIAS

### Fase 1: FIX CRÍTICO (Semana 1)
**MUST DO - Sin esto el sistema no funciona**

1. **🔴 [CRÍTICO-001]** Proteger `/auth/create-superadmin`
   - Agregar `@PreAuthorize("hasRole('SUPERADMIN')")`
   - Compile + restart backend

2. **🔴 [CRÍTICO-003]** Implementar endpoints de CARRITO
   - CartController + CartService + CartRepository
   - ETA: 8 horas

3. **🔴 [CRÍTICO-004]** Implementar aprobación de PRODUCTOS
   - POST `/products/{id}/approve`
   - POST `/products/{id}/reject`
   - GET `/products/pending`
   - ETA: 6 horas

4. **🔴 [CRÍTICO-002]** Implementar ÓRDENES básico
   - POST `/orders` → crear orden
   - GET `/orders` → listar órdenes del usuario
   - GET `/orders/{id}` → detalle
   - ETA: 16 horas

### Fase 2: VALIDACIONES (Semana 2)
**Must-have para producción**

1. **🟠 [MAYOR-001]** Sistema de verificación de EMAIL
   - EmailService con JavaMailSender
   - Token de verificación
   - Bloqueo de login sin verificar
   - ETA: 12 horas

2. **🟠 [MAYOR-002]** Endpoints de PROFILE
   - GET `/users/profile`
   - PUT `/users/profile`
   - ETA: 4 horas

3. **🟠 [MAYOR-005]** Refactorizar ProductController
   - Usar `@AuthenticationPrincipal`
   - Eliminar extracción manual de token
   - ETA: 4 horas

### Fase 3: INTEGRACIONES (Semana 3)
**Nice to have pero importante**

1. Generación de FACTURAS PDF
2. Sistema de NOTIFICACIONES por email
3. Swagger/OpenAPI documentation
4. Tests unitarios backend

---

## 🏁 CONCLUSIÓN

**Estado General**: ⚠️ **EN DESARROLLO INCOMPLETO**

### Funcionalidades Operacionales ✅
- Autenticación y login funcionando
- Gestión de usuarios (listar, cambiar rol)
- Catálogo de productos (público)
- Estructura de roles y permisos

### Funcionalidades Críticas Faltantes 🔴
- Sistema de carrito
- Sistema de órdenes y compras
- Aprobación de productos por admin
- Facturas PDF
- Verificación de email

### Recomendación Final
**El sistema requiere un mínimo de 2-3 semanas de desarrollo adicional antes de estar listo para producción.**

Priorizar:
1. Carrito (es el corazón del ecommerce)
2. Órdenes (sin esto no se vende)
3. Aprobación de productos (sin esto, los vendedores no pueden publicar)
4. Verificación de email (seguridad)

---

**Fecha del Reporte**: 22 de Noviembre, 2025  
**Próxima Revisión**: Recomendada después de implementar Fase 1  
**Responsable**: QA Senior + Arquitecto

