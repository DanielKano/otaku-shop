# 🚀 ACCIÓN INMEDIATA #1: Proteger create-superadmin

**Tiempo Total**: ~5 minutos  
**Severidad**: 🔴 CRÍTICA  
**Status**: ❌ VULNERABLE AHORA  

---

## 📝 PASO A PASO

### PASO 1: Localizar el archivo (30 segundos)

Abre:
```
backend/src/main/java/com/otakushop/controller/AuthController.java
```

Busca el método `createSuperAdmin`:
```java
@PostMapping("/create-superadmin")
public ResponseEntity<AuthResponse> createSuperAdmin(...) {
```

### PASO 2: Agregar protección (30 segundos)

**ANTES** (INSEGURO):
```java
@PostMapping("/create-superadmin")
public ResponseEntity<AuthResponse> createSuperAdmin(
```

**DESPUÉS** (SEGURO):
```java
@PreAuthorize("hasRole('SUPERADMIN')")
@PostMapping("/create-superadmin")
public ResponseEntity<AuthResponse> createSuperAdmin(
```

### PASO 3: Compilar (2 minutos)

Terminal:
```powershell
cd backend
mvn clean package -DskipTests
```

Esperar hasta ver:
```
BUILD SUCCESS
```

### PASO 4: Reiniciar backend (1 minuto)

Terminal:
```powershell
# Detener proceso anterior
# (Si está corriendo en otra terminal)

# Iniciar nuevo
java -jar target/otaku-shop-backend-0.1.0.jar
```

### PASO 5: Validar fix (1 minuto)

Terminal:
```powershell
# Intentar crear superadmin SIN autenticación
$body = @{
    name = "Hacker Admin"
    email = "hacker@evil.com"
    password = "HackerPass123!"
} | ConvertTo-Json

curl -X POST "http://localhost:8080/api/auth/create-superadmin" `
  -H "Content-Type: application/json" `
  -d $body
```

**ESPERADO**: HTTP **403 (Forbidden)** ← SEGURO ✅

**Si obtuviste 403**: ✅ FIX EXITOSO
**Si obtuviste 201**: ❌ Algo salió mal (verificar @PreAuthorize)

---

## 📋 CHECKLIST

```
[ ] 1. Abrir AuthController.java
[ ] 2. Localizar createSuperAdmin()
[ ] 3. Agregar @PreAuthorize("hasRole('SUPERADMIN')")
[ ] 4. mvn clean package -DskipTests
[ ] 5. Esperar BUILD SUCCESS
[ ] 6. Reiniciar backend (java -jar ...)
[ ] 7. Probar con curl (debe dar 403)
[ ] 8. ✅ COMPLETADO
```

---

## ✅ RESULTADO

Acabas de:
- ✅ Cerraste vulnerabilidad crítica de seguridad
- ✅ Previste creación no autorizada de cuentas SUPERADMIN
- ✅ Protegiste el endpoint con autenticación

**SIGUIENTE ACCIÓN**: CartController (ver `HALLAZGOS_CRITICOS_Y_PLAN_ACCION.md`)

