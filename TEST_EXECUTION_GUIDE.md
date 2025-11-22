# 🧪 GUÍA DE PRUEBAS INTERACTIVAS - OTAKU SHOP
**Fecha**: 22 de Noviembre, 2025  
**Propósito**: Validar el sistema manualmente antes de implementar Fase 1

---

## 🚀 ANTES DE EMPEZAR

### Verificar Estado de Servicios
```powershell
# Terminal 1: Verificar Backend
curl http://localhost:8080/api/health

# Terminal 2: Verificar Frontend
curl http://localhost:5173

# Terminal 3: Verificar PostgreSQL
psql -U otaku_shop_user -d otaku_shop -c "SELECT COUNT(*) FROM users;"
```

**Esperado**: Respuestas 200 en backend y frontend, conexión a BD exitosa.

---

## TEST SUITE 1: AUTENTICACIÓN

### TEST-AUTH-001: Registro exitoso

**Paso 1: Ir a página de registro**
```
URL: http://localhost:5173/registro
Esperado: Formulario con campos de nombre, email, password
```

**Paso 2: Completar formulario**
```
Nombre: QA Test User
Email: qatest-001@test.com
Password: TestPass123!
Repetir Password: TestPass123!
Rol: cliente
```

**Paso 3: Hacer POST manual (con curl)**
```powershell
$body = @{
    name = "QA Test User"
    email = "qatest-001@test.com"
    password = "TestPass123!"
    role = "cliente"
} | ConvertTo-Json

curl -X POST "http://localhost:8080/api/auth/register" `
  -H "Content-Type: application/json" `
  -d $body
```

**Esperado**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 123,
    "email": "qatest-001@test.com",
    "name": "QA Test User",
    "role": "cliente"
  }
}
```

**Validar**:
- [ ] HTTP 201 (Created)
- [ ] Token retornado
- [ ] Usuario creado en BD
  ```sql
  SELECT * FROM users WHERE email = 'qatest-001@test.com';
  ```

---

### TEST-AUTH-002: Login exitoso

**Paso 1: Ir a página de login**
```
URL: http://localhost:5173/login
```

**Paso 2: Ingresar credenciales**
```
Email: testuser@test.com
Password: TestPass123!
```

**Paso 3: Hacer POST manual**
```powershell
$body = @{
    email = "testuser@test.com"
    password = "TestPass123!"
} | ConvertTo-Json

curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body
```

**Esperado**: HTTP 200 con token y datos de usuario

**Validar**:
- [ ] Token guardado en localStorage
  ```javascript
  // En consola del navegador:
  localStorage.getItem('token')  // Debe mostrar token
  localStorage.getItem('user')   // Debe mostrar objeto JSON
  ```

---

### TEST-AUTH-003: Login con credenciales incorrectas

**Paso 1: Intentar login**
```powershell
$body = @{
    email = "testuser@test.com"
    password = "WrongPassword123!"
} | ConvertTo-Json

curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body
```

**Esperado**: HTTP 401 (Unauthorized) con mensaje de error

---

### TEST-AUTH-004: Acceso sin token

**Paso 1: Intentar acceder a endpoint protegido sin token**
```powershell
curl -X GET "http://localhost:8080/api/users"
```

**Esperado**: HTTP 401 o 403

**Paso 2: Acceder con token válido**
```powershell
# Primero haz login para obtener token
$loginBody = @{
    email = "superadmin@otakushop.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

$loginResponse = curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $loginBody | ConvertFrom-Json

$token = $loginResponse.token

# Ahora accede con token
curl -X GET "http://localhost:8080/api/users" `
  -H "Authorization: Bearer $token"
```

**Esperado**: HTTP 200 con lista de usuarios

---

## TEST SUITE 2: GESTIÓN DE USUARIOS

### TEST-ROLE-001: Listar usuarios (solo admin/superadmin)

**Paso 1: Loguear como SUPERADMIN**
```powershell
$body = @{
    email = "superadmin@otakushop.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

$response = curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body | ConvertFrom-Json

$token = $response.token
```

**Paso 2: Listar usuarios**
```powershell
curl -X GET "http://localhost:8080/api/users" `
  -H "Authorization: Bearer $token"
```

**Esperado**: HTTP 200 con array de usuarios

**Validar**:
- [ ] Lista incluye al menos 2 usuarios
- [ ] Cada usuario tiene: id, email, name, role, enabled, createdAt

---

### TEST-ROLE-002: Cliente NO puede listar usuarios

**Paso 1: Loguear como CLIENTE**
```powershell
$body = @{
    email = "testuser@test.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body | ConvertFrom-Json

$token = $response.token
```

**Paso 2: Intentar listar usuarios**
```powershell
curl -X GET "http://localhost:8080/api/users" `
  -H "Authorization: Bearer $token"
```

**Esperado**: HTTP 403 (Forbidden)

---

### TEST-ROLE-003: Cambiar rol de usuario (superadmin)

**Precondición**: Usuario con ID 15 existe como CLIENTE

**Paso 1: Ver usuario actual**
```powershell
curl -X GET "http://localhost:8080/api/users/15" `
  -H "Authorization: Bearer $token"
```

**Paso 2: Cambiar a VENDEDOR**
```powershell
$body = @{
    role = "vendedor"
} | ConvertTo-Json

curl -X PUT "http://localhost:8080/api/users/15/role" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $body
```

**Esperado**: HTTP 200 con usuario actualizado

**Validar**:
- [ ] Rol cambió a VENDEDOR en respuesta
- [ ] BD refleja el cambio:
  ```sql
  SELECT role FROM users WHERE id = 15;
  ```

---

### TEST-ROLE-004: Desactivar usuario (suspend)

**Paso 1: Suspender usuario**
```powershell
curl -X PUT "http://localhost:8080/api/users/15/suspend" `
  -H "Authorization: Bearer $token"
```

**Esperado**: HTTP 200, `enabled: false`

**Validar**:
- [ ] Usuario no puede loguear después de suspender
  ```powershell
  # Intentar login
  $body = @{
      email = "testuser@test.com"
      password = "TestPass123!"
  } | ConvertTo-Json

  curl -X POST "http://localhost:8080/api/auth/login" `
    -H "Content-Type: application/json" `
    -d $body
  ```
  **Esperado**: HTTP 401 o mensaje "Account disabled"

---

## TEST SUITE 3: PRODUCTOS

### TEST-PROD-001: Listar productos públicamente

**Paso 1: Obtener lista de productos**
```powershell
curl -X GET "http://localhost:8080/api/products"
```

**Esperado**: HTTP 200 con array de productos APROBADOS

**Validar**:
- [ ] Respuesta es un array
- [ ] Cada producto tiene: id, title, description, price, category, status
- [ ] NO incluye productos POSTULADOS

---

### TEST-PROD-002: Buscar productos

**Paso 1: Buscar por palabra clave**
```powershell
curl -X GET "http://localhost:8080/api/products/search?keyword=anime"
```

**Esperado**: HTTP 200 con productos que contengan "anime"

**Paso 2: Filtrar por categoría**
```powershell
curl -X GET "http://localhost:8080/api/products/filter?category=manga&minPrice=10&maxPrice=50"
```

**Esperado**: HTTP 200 con productos filtrados

---

### TEST-PROD-003: Crear producto (vendedor)

**Precondición**: Usuario cambió a VENDEDOR (TEST-ROLE-003)

**Paso 1: Loguear como VENDEDOR**
```powershell
$body = @{
    email = "testuser@test.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body | ConvertFrom-Json

$token = $response.token
```

**Paso 2: Crear producto**
```powershell
$body = @{
    title = "Figura Dragon Ball Z - Goku"
    description = "Figura de acción de Goku en escala 1:8"
    price = 45.99
    category = "figuras"
    stock = 10
} | ConvertTo-Json

curl -X POST "http://localhost:8080/api/products" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $body
```

**Esperado**: HTTP 201 con producto creado

**Validar**:
- [ ] Estado del producto es POSTULADO
  ```sql
  SELECT * FROM products WHERE vendor_id = 15 ORDER BY created_at DESC LIMIT 1;
  ```

---

### TEST-PROD-004: ⚠️ CRÍTICO - Productos POSTULADOS no se ven en catálogo

**Paso 1: Listar productos (anónimo)**
```powershell
curl -X GET "http://localhost:8080/api/products"
```

**Esperado**: NO incluye el producto que acabas de crear (POSTULADO)

**Validar**:
- [ ] Solo incluye productos APROBADOS
- [ ] Si incluye POSTULADOS → **FALLO DE NEGOCIO**

---

### TEST-PROD-005: ⚠️ CRÍTICO - NO existe endpoint de aprobación

**Paso 1: Loguear como SUPERADMIN**
```powershell
$body = @{
    email = "superadmin@otakushop.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

$response = curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body | ConvertFrom-Json

$token = $response.token
```

**Paso 2: Intentar aprobar producto**
```powershell
curl -X POST "http://localhost:8080/api/products/999/approve" `
  -H "Authorization: Bearer $token"
```

**Esperado Actual**: HTTP 404 (Not Found) ← **ENDPOINT NO EXISTE**

**RESULTADO**: ❌ **CRÍTICO** - No hay forma de aprobar productos

---

## TEST SUITE 4: ⚠️ CRÍTICO - CARRITO

### TEST-CART-001: NO existen endpoints de carrito

**Paso 1: Intentar obtener carrito**
```powershell
$body = @{
    email = "testuser@test.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = curl -X POST "http://localhost:8080/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body | ConvertFrom-Json

$token = $response.token

curl -X GET "http://localhost:8080/api/cart" `
  -H "Authorization: Bearer $token"
```

**Esperado**: HTTP 404 (Not Found)

**RESULTADO**: ❌ **CRÍTICO** - Carrito no implementado en backend

---

## TEST SUITE 5: ⚠️ CRÍTICO - ÓRDENES

### TEST-ORDER-001: NO existe endpoint para crear órdenes

**Paso 1: Intentar crear orden**
```powershell
$body = @{
    items = @(
        @{ productId = 1; quantity = 2 }
    )
} | ConvertTo-Json

curl -X POST "http://localhost:8080/api/orders" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $body
```

**Esperado**: HTTP 404 (Not Found)

**RESULTADO**: ❌ **CRÍTICO** - Órdenes no implementadas

---

## TEST SUITE 6: SEGURIDAD

### TEST-SEC-001: ⚠️ CRÍTICO - create-superadmin es público

**Paso 1: Intentar crear superadmin sin autenticación**
```powershell
$body = @{
    name = "Hacker Admin"
    email = "hacker@evil.com"
    password = "HackerPass123!"
} | ConvertTo-Json

curl -X POST "http://localhost:8080/api/auth/create-superadmin" `
  -H "Content-Type: application/json" `
  -d $body
```

**Resultado Esperado**: HTTP 403 (Forbidden)
**Resultado Actual**: HTTP 201 ← **VULNERABILIDAD CRÍTICA**

**PROBLEMA**: Cualquiera puede crear cuenta SUPERADMIN

---

### TEST-SEC-002: Token expirado

**Paso 1: Esperar a que token expire (24 horas)**

**Paso 2: Usar token expirado**
```powershell
$expiredToken = "eyJhbGc..." # Token viejo

curl -X GET "http://localhost:8080/api/users" `
  -H "Authorization: Bearer $expiredToken"
```

**Esperado**: HTTP 401 con mensaje de token expirado

---

## TEST SUITE 7: FRONTEND

### TEST-UI-001: Página de login

**Paso 1: Navegar a /login**
```
URL: http://localhost:5173/login
```

**Validar**:
- [ ] Formulario visible
- [ ] Campos: Email, Password
- [ ] Botón "Ingresar"
- [ ] Link a "¿No tienes cuenta?"

**Paso 2: Ingresar credenciales correctas**
```
Email: testuser@test.com
Password: TestPass123!
```

**Validar**:
- [ ] Botón se deshabilita (loading)
- [ ] Se redirige a /cliente/dashboard (o según rol)
- [ ] Token guardado en localStorage

---

### TEST-UI-002: Página de registro

**Paso 1: Navegar a /registro**
```
URL: http://localhost:5173/registro
```

**Validar**:
- [ ] Formulario visible
- [ ] Campos: Nombre, Email, Password, Repetir Password, Teléfono, Rol
- [ ] Botón "Registrarse"
- [ ] Validaciones en vivo (email, password strength)

**Paso 2: Completar y enviar**
```
Nombre: QA Frontend Test
Email: qafrontend@test.com
Password: TestPass123!
Repetir: TestPass123!
Teléfono: 123456789
Rol: cliente
```

**Validar**:
- [ ] Validación de campos requeridos
- [ ] Validación de email válido
- [ ] Validación de password strength
- [ ] Se crea el usuario

---

### TEST-UI-003: Dashboard Superadmin

**Paso 1: Loguear como superadmin**
```
Email: superadmin@otakushop.com
Password: SuperAdmin123!
```

**Paso 2: Navegar a /superadmin/dashboard**

**Validar**:
- [ ] "Ver Todos los Usuarios" button existe
- [ ] "Ver Todos los Productos" button existe
- [ ] Otros botones muestran "Próximamente"

**Paso 3: Clickear "Ver Todos los Usuarios"**

**Esperado**: 
- [ ] Llamada a `/api/users`
- [ ] Notificación con cantidad de usuarios
- [ ] (Idealmente) lista de usuarios visible

---

### TEST-UI-004: Navbar responde a roles

**Paso 1: Loguear como CLIENTE**

**Validar Navbar**:
- [ ] Muestra nombre del usuario
- [ ] Link a "/cliente/dashboard"
- [ ] No muestra opciones de admin/vendedor

**Paso 2: Loguear como VENDEDOR**

**Validar Navbar**:
- [ ] Muestra nombre del usuario
- [ ] Link a "/vendedor/dashboard"
- [ ] No muestra opciones de admin

**Paso 3: Loguear como SUPERADMIN**

**Validar Navbar**:
- [ ] Muestra nombre del usuario
- [ ] Link a "/superadmin/dashboard"
- [ ] Acceso a todas las secciones

---

### TEST-UI-005: Sesión persiste en reload

**Paso 1: Loguear como usuario**

**Paso 2: Presionar F5 (refresh)**

**Esperado**:
- [ ] Usuario sigue logueado
- [ ] NO redirige a /login
- [ ] User data visible en navbar

---

### TEST-UI-006: Logout borra sesión

**Paso 1: Loguear como usuario**

**Paso 2: Hacer logout (botón en navbar)**

**Validar**:
- [ ] localStorage limpiado
  ```javascript
  // Consola del navegador:
  localStorage.getItem('token')   // null
  localStorage.getItem('user')    // null
  ```
- [ ] Redirige a /login
- [ ] Usuario no puede acceder a /cliente/dashboard

---

## 📊 RESUMEN DE PRUEBAS

### Rutas Disponibles

```
PÚBLICAS:
✅ POST   /auth/register         → Crear usuario
✅ POST   /auth/login            → Login
❌ POST   /auth/create-superadmin → ⚠️ VULNERABLE (debe ser protegida)

PROTEGIDAS (Admin/Superadmin):
✅ GET    /api/users             → Listar usuarios
✅ GET    /api/users/{id}        → Detalle usuario
✅ PUT    /api/users/{id}/role   → Cambiar rol
✅ PUT    /api/users/{id}/suspend→ Suspender usuario
✅ DELETE /api/users/{id}        → Eliminar usuario

PÚBLICAS (Productos):
✅ GET    /api/products          → Listar productos
✅ GET    /api/products/{id}     → Detalle producto
✅ GET    /api/products/search   → Buscar
✅ GET    /api/products/filter   → Filtrar

PROTEGIDAS (Vendedor):
✅ POST   /api/products          → Crear producto
✅ PUT    /api/products/{id}     → Editar producto
✅ DELETE /api/products/{id}     → Eliminar producto

❌ NO IMPLEMENTADOS:
❌ POST   /api/products/{id}/approve        → Aprobar producto
❌ POST   /api/products/{id}/reject         → Rechazar producto
❌ GET    /api/products/pending             → Ver pendientes
❌ GET    /api/cart                         → Obtener carrito
❌ POST   /api/cart/add                     → Agregar al carrito
❌ PUT    /api/cart/{id}                    → Actualizar cantidad
❌ DELETE /api/cart/{id}                    → Quitar del carrito
❌ POST   /api/orders                       → Crear orden
❌ GET    /api/orders                       → Listar órdenes
❌ GET    /api/orders/{id}                  → Detalle orden
❌ GET    /api/users/profile                → Obtener perfil
❌ PUT    /api/users/profile                → Actualizar perfil
```

---

## ✅ CHECKLIST DE PRUEBAS A EJECUTAR

```
AUTENTICACIÓN:
- [ ] TEST-AUTH-001: Registro exitoso
- [ ] TEST-AUTH-002: Login exitoso
- [ ] TEST-AUTH-003: Login con password incorrecto
- [ ] TEST-AUTH-004: Acceso sin token

USUARIOS:
- [ ] TEST-ROLE-001: Superadmin lista usuarios
- [ ] TEST-ROLE-002: Cliente NO puede listar usuarios
- [ ] TEST-ROLE-003: Cambiar rol de usuario
- [ ] TEST-ROLE-004: Desactivar usuario

PRODUCTOS:
- [ ] TEST-PROD-001: Listar productos públicamente
- [ ] TEST-PROD-002: Buscar productos
- [ ] TEST-PROD-003: Vendedor crea producto
- [ ] TEST-PROD-004: ⚠️ Productos POSTULADOS se ven en catálogo (DEBERÍAN NO VERSE)
- [ ] TEST-PROD-005: ⚠️ NO existe endpoint /approve

CARRITO:
- [ ] TEST-CART-001: ⚠️ NO existen endpoints de carrito

ÓRDENES:
- [ ] TEST-ORDER-001: ⚠️ NO existen endpoints de órdenes

SEGURIDAD:
- [ ] TEST-SEC-001: ⚠️ create-superadmin es público (CRÍTICO)
- [ ] TEST-SEC-002: Token expirado es rechazado

FRONTEND:
- [ ] TEST-UI-001: Página login
- [ ] TEST-UI-002: Página registro
- [ ] TEST-UI-003: Dashboard superadmin
- [ ] TEST-UI-004: Navbar responde a roles
- [ ] TEST-UI-005: Sesión persiste en reload
- [ ] TEST-UI-006: Logout borra sesión
```

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE PRUEBAS

1. **Ejecutar todas las pruebas** y documentar resultados
2. **Arreglar [CRÍTICO-001]**: Proteger `/auth/create-superadmin`
3. **Implementar [CRÍTICO-003]**: Endpoints de carrito
4. **Implementar [CRÍTICO-004]**: Aprobación de productos
5. **Implementar [CRÍTICO-002]**: Módulo de órdenes

