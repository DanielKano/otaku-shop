# Bitácora de Resolución - Proyecto Otaku Shop

## Fecha: 22 de Noviembre 2025

---

## Problema Inicial

El usuario solicitó: **"inicial el proyecto localmente"**

Sin embargo, después de iniciar el proyecto, reportó:
- ❌ El botón "Registrarse" en el frontend lo redirigía al login
- ❌ El usuario NO se guardaba en la base de datos
- ❌ El endpoint `/api/auth/register` retornaba 401 Unauthorized

---

## Proceso de Diagnóstico y Solución

### Fase 1: Identificación del Problema de Seguridad

**Error observado**:
```
401 Unauthorized: Full authentication is required to access this resource
```

**Causa identificada**: 
Spring Security 6.2.0 estaba bloqueando el endpoint `/api/auth/register` aunque debería ser público.

**Archivos revisados**:
- `SecurityConfig.java` - Configuración de Spring Security
- `AuthController.java` - Endpoints de autenticación
- `AuthService.java` - Lógica de negocio de registro

---

### Fase 2: Análisis de SecurityConfig

**Problema encontrado**:
```java
.requestMatchers("").permitAll()  // ❌ PATRÓN VACÍO
```

Esta línea causaba que Maven no pudiera inicializar el SecurityFilterChain.

**Error específico**:
```
Caused by: java.lang.IllegalArgumentException: Pattern cannot be null or empty
```

**Solución aplicada** (Cambio 1/3):
```java
// ANTES
.requestMatchers("/").permitAll()
.requestMatchers("").permitAll()  // ❌ ELIMINAR
.requestMatchers("/health").permitAll()
.requestMatchers(HttpMethod.POST, "/auth/register").permitAll()

// DESPUÉS
.requestMatchers("/").permitAll()
.requestMatchers("/health").permitAll()
.requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
.requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
.requestMatchers(HttpMethod.GET, "/products").permitAll()
.requestMatchers(HttpMethod.GET, "/products/**").permitAll()
```

**Archivo modificado**: `backend/src/main/java/com/otakushop/config/SecurityConfig.java`

---

### Fase 3: Problema de Persistencia - Campo `enabled` Nulo

**Error en base de datos**:
```
ERROR: null value in column "enabled" of relation "users" violates not-null constraint
```

**Causa**: 
El User entity tenía `private Boolean enabled = true;` pero cuando se usa `@Builder` de Lombok, los valores por defecto se ignoran.

**Solución aplicada** (Cambio 2/3):

```java
// ANTES
User user = User.builder()
    .email(request.getEmail())
    .password(passwordEncoder.encode(request.getPassword()))
    .name(request.getName())
    .phone(request.getPhone())
    .role(Role.fromValue(request.getRole()))
    .build();

// DESPUÉS
User user = User.builder()
    .email(request.getEmail())
    .password(passwordEncoder.encode(request.getPassword()))
    .name(request.getName())
    .phone(request.getPhone())
    .role(Role.fromValue(request.getRole()))
    .enabled(true)  // ✅ AGREGAR ESTA LÍNEA
    .build();
```

**Archivo modificado**: `backend/src/main/java/com/otakushop/service/AuthService.java` (línea 39)

---

### Fase 4: Error de Datasource - Resources No Empaquetadas

**Error al ejecutar JAR**:
```
Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured.

Reason: Failed to determine a suitable driver class
```

**Causa**: 
Maven no estaba incluyendo `application.properties` en el JAR empaquetado, lo que impedía que Spring Boot tuviera la configuración de la base de datos.

**Solución aplicada** (Cambio 3/3):

Se agregó la sección `<resources>` al `pom.xml`:

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>application.properties</include>
                <include>application-*.properties</include>
                <include>static/**</include>
            </includes>
        </resource>
    </resources>
    <plugins>
        <!-- ... plugins ... -->
    </plugins>
</build>
```

**Archivo modificado**: `backend/pom.xml` (línea ~107)

**Verificación**:
```bash
jar tf target/otaku-shop-backend-0.1.0.jar | grep application.properties
# Output: BOOT-INF/classes/application.properties ✅
```

---

## Cambios Realizados - Resumen Técnico

### 1. SecurityConfig.java
**Línea**: ~62  
**Tipo**: Corrección de sintaxis  
**Cambio**: Remover patrón vacío en requestMatchers

### 2. AuthService.java
**Línea**: 39  
**Tipo**: Corrección de lógica  
**Cambio**: Agregar `.enabled(true)` en User builder

### 3. pom.xml
**Línea**: ~107  
**Tipo**: Configuración de Maven  
**Cambio**: Agregar sección `<resources>` para incluir properties

---

## Prueba de Validación

### Test POST /api/auth/register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Garcia",
    "email": "maria@example.com",
    "phone": "3105555555",
    "password": "Pass123!@",
    "confirmPassword": "Pass123!@",
    "role": "cliente"
  }'

# Resultado (HTTP 201 Created)
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "id": 2,
  "name": "Maria Garcia",
  "email": "maria@example.com",
  "role": "cliente"
}
```

### Validación en Base de Datos

```sql
SELECT id, name, email, role, enabled, created_at 
FROM users 
WHERE id = 2;

-- Resultado:
-- id | name         | email              | role    | enabled | created_at
-- 2  | Maria Garcia | maria@example.com  | CLIENTE | true    | 2025-11-22 07:04:29
```

✅ **EXITOSO**: Usuario registrado correctamente en la base de datos

---

## Estado Final

| Item | Status | Detalles |
|------|--------|----------|
| Backend Spring Boot | ✅ ACTIVO | Puerto 8080, Contexto /api |
| PostgreSQL | ✅ ACTIVO | localhost:5432, BD otaku_shop |
| Frontend Vite | ✅ ACTIVO | Puerto 5173, HMR enabled |
| Endpoint /auth/register | ✅ FUNCIONANDO | Retorna 201 Created |
| Persistencia de usuarios | ✅ FUNCIONANDO | Guardados en tabla users |
| JWT Tokens | ✅ GENERADOS | Expiración 24 horas |
| CORS | ✅ CONFIGURADO | Permite localhost:5173 |

---

## Comandos de Compilación y Ejecución

### Backend

```bash
# Compilación
cd backend
mvn clean compile

# Empaquetado
mvn package -DskipTests

# Ejecución
java -jar target/otaku-shop-backend-0.1.0.jar
```

### Frontend

```bash
# Instalar dependencias (si es necesario)
cd frontend
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build
```

---

## Notas Importantes

1. **Roles válidos**: `cliente`, `vendedor`, `admin`, `superadmin` (minúsculas)
2. **Base de datos**: Credentials en `application.properties`:
   - User: `postgres`
   - Password: `123` (⚠️ cambiar en producción)
3. **JWT Secret**: `otakushop-secret-key-very-long-and-secure-for-production-use-only`
4. **Codificación**: Usar caracteres ASCII en JSON para evitar problemas UTF-8 en PowerShell

---

## Lecciones Aprendidas

✅ **Spring Security 6.2.0** requiere patrones válidos (no vacíos) en requestMatchers  
✅ **Lombok @Builder** no respeta valores por defecto de campos  
✅ **Maven** necesita configuración explícita de `<resources>` para incluir properties en JAR  
✅ **Context Path** en Spring Boot se elimina antes de hacer matching de patrones de seguridad  

---

## Próximo Paso Recomendado

Continuar con:
- [ ] Testing de login endpoint
- [ ] Integración completa frontend-backend
- [ ] Validaciones adicionales de seguridad
- [ ] Configuración de variable de entorno para secretos

---

**Proyecto inicializado exitosamente.** 🚀
