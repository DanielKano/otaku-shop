# ⚡ GUÍA RÁPIDA DE TESTING - OTAKU SHOP

**Tiempo estimado:** 30 minutos  
**Precondición:** Tener Java 21+ y Node.js instalados

---

## 🚀 PASO 1: INICIAR SERVICIOS

### Terminal 1 - Backend
```bash
cd backend
mvn spring-boot:run
```

**Esperado:**
```
2025-11-23 ... INFO com.otakushop.OtakuShopApplication : Started OtakuShopApplication in X seconds
2025-11-23 ... INFO o.s.b.w.e.tomcat.TomcatWebServer : Tomcat started on port(s): 8080
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Esperado:**
```
  VITE v5.4.21  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🎯 PASO 2: TESTING RÁPIDO (Seguir en orden)

### TEST 1: Vendedor crea producto ✅
**Rol:** Vendedor  
**Objetivo:** Verificar que el modal de crear producto funciona

1. Ir a: `http://localhost:5173/login`
2. Login como vendedor:
   ```
   Email: vendedor@test.com
   Password: test123
   ```
3. Ir a: Dashboard de Vendedor (debe estar disponible)
4. Buscar botón "+ Nuevo Producto"
5. **VERIFICAR:** Se abre modal de creación
6. Llenar formulario:
   ```
   Nombre: Test Manga
   Descripción: Manga de prueba
   Precio: 15.99
   Categoría: Manga
   Stock: 10
   ```
7. Hacer clic "Crear Producto"
8. **VERIFICAR:** 
   - ✅ Notificación verde de éxito
   - ✅ Modal se cierra
   - ✅ Producto aparece en tabla

**Resultado esperado:** ✅ PASS

---

### TEST 2: Producto pendiente NO aparece en tienda ✅
**Rol:** Cliente  
**Objetivo:** Verificar que clientes no ven productos PENDING

1. En nueva ventana incógnita (sin login)
2. Ir a: `http://localhost:5173/`
3. Click en "Productos" o ir a `/productos`
4. **VERIFICAR:** El producto creado en TEST 1 NO aparece
5. Si aparecen productos, deben ser todos APROBADOS

**Resultado esperado:** ✅ PASS

---

### TEST 3: Admin aprueba producto ✅
**Rol:** Admin  
**Objetivo:** Verificar que admin puede aprobar productos

1. Login como admin:
   ```
   Email: admin@test.com
   Password: test123
   ```
2. Ir a: Dashboard de Admin
3. Buscar sección "Productos Pendientes"
4. Debe haber un modal o tabla mostrando el producto de TEST 1
5. Hacer clic "Aprobar"
6. Seleccionar producto del TEST 1
7. Confirmar aprobación
8. **VERIFICAR:**
   - ✅ Notificación de éxito
   - ✅ Producto desaparece de lista de pendientes

**Resultado esperado:** ✅ PASS

---

### TEST 4: Ahora cliente ve el producto ✅
**Rol:** Cliente  
**Objetivo:** Verificar que el producto aprobado aparece en tienda

1. Abrir incógnita (sin login)
2. Ir a: `http://localhost:5173/productos`
3. Buscar el producto creado en TEST 1
4. **VERIFICAR:**
   - ✅ El producto aparece
   - ✅ Muestra nombre, precio, imagen
   - ✅ Tiene botón "Añadir al carrito"

**Resultado esperado:** ✅ PASS

---

### TEST 5: SuperAdmin cambia rol de usuario ✅
**Rol:** SuperAdmin  
**Objetivo:** Verificar que SuperAdmin puede cambiar roles

1. Login como superadmin:
   ```
   Email: superadmin@test.com
   Password: test123
   ```
2. Ir a: Dashboard de SuperAdmin
3. Buscar sección "Cambiar Roles" o "Gestionar Usuarios"
4. Seleccionar un usuario (ej: vendedor@test.com)
5. Cambiar rol a "ADMIN"
6. Confirmar
7. **VERIFICAR:**
   - ✅ Notificación de éxito
   - ✅ El rol cambió en la lista

**Resultado esperado:** ✅ PASS

---

### TEST 6: No se puede crear otro SUPERADMIN ✅
**Rol:** SuperAdmin  
**Objetivo:** Verificar protección contra múltiples SUPERADMIN

1. Continuar como SuperAdmin
2. Intentar cambiar rol de otro usuario a "SUPERADMIN"
3. **VERIFICAR:**
   - ✅ Error: "No se puede crear otro SUPERADMIN"
   - ✅ El rol NO cambia

**Resultado esperado:** ✅ PASS

---

### TEST 7: Solo VENDEDOR puede crear productos ✅
**Rol:** Admin  
**Objetivo:** Verificar que Admin NO puede crear productos

1. Login como admin:
   ```
   Email: admin@test.com
   Password: test123
   ```
2. Intentar acceder a `/vendedor/dashboard` directamente
3. **VERIFICAR:**
   - ✅ Acceso denegado (error 403 o redirección)
   - ✅ No hay botón "+ Nuevo Producto"

**Resultado esperado:** ✅ PASS

---

### TEST 8: Vendedor NO puede editar producto aprobado ✅
**Rol:** Vendedor  
**Objetivo:** Verificar que no se pueden editar productos APPROVED

1. Login como vendedor
2. Ir a Dashboard de Vendedor
3. El producto creado en TEST 1 debe estar APPROVED (cambiar de estado si no)
4. Intentar hacer clic en botón "Editar" del producto
5. **VERIFICAR:**
   - ✅ Modal se abre pero está deshabilitado, O
   - ✅ Error: "No se puede editar productos aprobados"

**Resultado esperado:** ✅ PASS

---

### TEST 9: Cliente puede añadir al carrito ✅
**Rol:** Cliente  
**Objetivo:** Verificar que funciona el carrito

1. Abrir incógnita, ir a `/productos`
2. Buscar producto aprobado
3. Hacer clic "Añadir al carrito"
4. Ir a `/carrito`
5. **VERIFICAR:**
   - ✅ El producto aparece en el carrito
   - ✅ Muestra cantidad, precio, subtotal

**Resultado esperado:** ✅ PASS

---

## 📋 CHECKLIST DE VERIFICACIÓN

```
SEGURIDAD
[ ] @PreAuthorize funciona en POST /products
[ ] @PreAuthorize funciona en PUT /products/{id}
[ ] @PreAuthorize funciona en DELETE /products/{id}
[ ] No se puede crear SUPERADMIN adicional
[ ] No se puede cambiar propio rol a CLIENTE

FUNCIONALIDAD
[ ] Vendedor crea producto
[ ] Producto aparece en PENDING
[ ] Cliente NO ve PENDING
[ ] Admin aprueba producto
[ ] Cliente ve APPROVED
[ ] Productos editables solo si PENDING

ROLES
[ ] CLIENTE: Ver APPROVED, no crear
[ ] VENDEDOR: Crear, editar PENDING, no aprobar
[ ] ADMIN: Aprobar/rechazar, ver PENDING
[ ] SUPERADMIN: Todo
```

---

## 🐛 SI ALGO NO FUNCIONA

### Error: "No se puede encontrar el usuario"
- **Solución:** Crear usuarios de test en base de datos
- **SQL:**
  ```sql
  INSERT INTO users (email, password, name, phone, role, enabled) VALUES
  ('vendedor@test.com', '$2a$10$...', 'Vendedor Test', '555-0001', 'VENDEDOR', true),
  ('admin@test.com', '$2a$10$...', 'Admin Test', '555-0002', 'ADMIN', true),
  ('superadmin@test.com', '$2a$10$...', 'SuperAdmin Test', '555-0003', 'SUPERADMIN', true),
  ('cliente@test.com', '$2a$10$...', 'Cliente Test', '555-0004', 'CLIENTE', true);
  ```

### Error: "403 Forbidden"
- **Causa:** Role no coincide con @PreAuthorize
- **Solución:** Verificar que el usuario tiene el role correcto

### Modal no abre
- **Causa:** Componente CreateProductModal no encontrado
- **Solución:** Verificar que está en `frontend/src/components/modals/CreateProductModal.jsx`
- **Comando:** `ls frontend/src/components/modals/`

### Producto no aparece después de crear
- **Causa:** Status no es PENDING o no se guardó
- **Solución:** Verificar en DB: `SELECT * FROM products ORDER BY created_at DESC LIMIT 1`

### Frontend no compila
- **Causa:** Dependencias faltantes
- **Solución:** `cd frontend && npm install && npm run dev`

---

## 📊 LOGS A REVISAR

### Backend - Archivo de log
```
tail -f backend/target/classes/application.properties
```

### Console Backend
Buscar líneas tipo:
```
o.s.s.access.vote.AffirmativeBased : Voted: GRANT
o.h.h.Hibernate : INSERT INTO products ...
o.h.h.Hibernate : SELECT * FROM products WHERE status = 'APPROVED'
```

### Console Frontend
Buscar en DevTools:
```
Network: POST /api/products/create (201 Created)
Console: No errors
```

---

## ✅ RESULTADO ESPERADO

Si todos los tests pasan:

```
═══════════════════════════════════════════════════════════
  TESTING COMPLETADO - RESULTADOS
═══════════════════════════════════════════════════════════

TEST 1: Crear Producto................ ✅ PASS
TEST 2: Cliente NO ve PENDING......... ✅ PASS
TEST 3: Admin aprueba................ ✅ PASS
TEST 4: Cliente ve APPROVED.......... ✅ PASS
TEST 5: SuperAdmin cambia rol........ ✅ PASS
TEST 6: No múltiples SUPERADMIN...... ✅ PASS
TEST 7: Solo VENDEDOR crea.......... ✅ PASS
TEST 8: No editar APPROVED.......... ✅ PASS
TEST 9: Carrito funciona............ ✅ PASS

TOTAL: 9/9 TESTS PASSED ✅
═══════════════════════════════════════════════════════════
```

Si algo falla, abrir GitHub issue con:
- Número del TEST que falló
- Pasos exactos para reproducir
- Error message (screenshot)
- Rol usado
- Navegador

---

## 🎁 NEXT STEPS

Después del testing:

1. ✅ Si todo pasa: Mergear a master
   ```bash
   git checkout master
   git merge fix/critical-bugs-nov23
   git push origin master
   ```

2. ✅ Deployar a producción con tu flujo normal

3. ✅ Bug #5 (Stock Inteligente) para próxima iteración

---

**Buena suerte con el testing! 🚀**

Si tienes dudas, consultar:
- `IMPLEMENTATION_REPORT.md` - Detalles técnicos
- `ESTADO_FINAL.md` - Resumen ejecutivo
- `CODE_FIXES_READY.md` - Código implementado

