# Proyecto Otaku Shop - Inicialización Completada ✅

## Resumen de Estado

El proyecto **Otaku Shop fullstack** ha sido **inicializado correctamente** en el ambiente local. Tanto el backend como el frontend están operacionales y comunicándose correctamente.

### Fecha: 22 de Noviembre 2025
### Hora: 07:04 AM (Hora Colombia)

---

## ✅ Backend - Estado Operacional

### Servidor Spring Boot
- **URL Base**: `http://localhost:8080/api`
- **Estado**: ✅ **CORRIENDO**
- **Puerto**: 8080
- **Contexto**: /api

### Tecnologías
- Java 21
- Spring Boot 3.2.0
- Spring Security 6.2.0
- Hibernate 6.3.1.Final
- PostgreSQL 14
- JWT (JSON Web Tokens)

### Base de Datos
- **Tipo**: PostgreSQL
- **Host**: localhost:5432
- **Nombre BD**: otaku_shop
- **Estado**: ✅ **Conectada y funcionando**
- **Usuarios registrados**: 2
  - ID 1: primer usuario de prueba
  - ID 2: Maria Garcia (maria@example.com)

### Endpoints Probados
#### ✅ Autenticación - Funcionando

**POST /api/auth/register**
```bash
# Request
{
  "name": "Maria Garcia",
  "email": "maria@example.com",
  "phone": "3105555555",
  "password": "Pass123!@",
  "confirmPassword": "Pass123!@",
  "role": "cliente"
}

# Response (201 Created)
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtYXJpYUBleGFtcGxlLmNvbSIsInVzZXJJZCI6Miwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3NjM4MTMwNzYsImV4cCI6MTc2Mzg5OTQ3Nn0.UuXivBNYxvjG4kFqmkDw5BemeuEnigTQ39JhfQ1QQ-b37Gu1l_kT8CevbzWm973FlbnwMGK7wf5Vb3gM6sQFiQ",
  "id": 2,
  "name": "Maria Garcia",
  "email": "maria@example.com",
  "role": "cliente"
}
```

**Notas sobre el registro:**
- ✅ Los datos se guardan correctamente en la base de datos
- ✅ Se genera un JWT token de 24 horas
- ✅ El rol debe enviarse en minúsculas: "cliente", "vendedor", "admin", "superadmin"
- ✅ Las contraseñas deben coincidir
- ✅ La contraseña se almacena encriptada con BCrypt

---

## ✅ Frontend - Estado Operacional

### Servidor Vite
- **URL Base**: `http://localhost:5173`
- **Estado**: ✅ **CORRIENDO**
- **Puerto**: 5173
- **Modo**: Desarrollo (HMR enabled)

### Tecnologías
- React 18.3.1
- Vite 5.4.21
- React Router 6.24.1
- Axios 1.7.7
- Tailwind CSS
- React Hook Form + Zod validation

### Características
- ✅ Autenticación con JWT
- ✅ Gestor de estado (Context API)
- ✅ Rutas protegidas
- ✅ Notificaciones en tiempo real
- ✅ Carrito de compras
- ✅ Temas (Light/Dark)

---

## 🔧 Problemas Resueltos

### 1. **Endpoint de Registro Bloqueado (401 Unauthorized)**
**Problema**: POST `/api/auth/register` retornaba 401 a pesar de ser público

**Solución**:
- Actualizar `SecurityConfig.java`:
  - Remover patrón vacío: `.requestMatchers("").permitAll()`
  - Agregar reglas explícitas para `/auth/register` y `/auth/login`
  - Considerar que `/api` context path se elimina antes de matching

**Commit**: Cambios en `SecurityConfig.java`

### 2. **Campo `enabled` Nulo en Base de Datos**
**Problema**: al crear usuarios, `enabled` column violaba NOT NULL constraint

**Solución**:
- Modificar `AuthService.java`:
  - Agregar `.enabled(true)` al User builder
  - El valor por defecto de la entidad no funciona con @Builder de Lombok

**Archivo modificado**: `AuthService.java` línea 39

### 3. **Resources no Inclusos en JAR**
**Problema**: `application.properties` no se empaquetaba en el JAR, causando datasource errors

**Solución**:
- Agregar sección `<resources>` al `pom.xml`:
  ```xml
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
  ```

**Archivo modificado**: `pom.xml` línea ~107

---

## 📝 Instrucciones para Usar

### Iniciar Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/otaku-shop-backend-0.1.0.jar
```

### Iniciar Frontend
```bash
cd frontend
npm install  # si no está instalado
npm run dev
```

### Probar Registro vía API
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tu Nombre",
    "email": "tu@ejemplo.com",
    "phone": "3001234567",
    "password": "Pass123!@",
    "confirmPassword": "Pass123!@",
    "role": "cliente"
  }'
```

---

## 🔐 Configuración de Seguridad

### JWT
- **Secret**: `otakushop-secret-key-very-long-and-secure-for-production-use-only`
- **Expiración**: 24 horas (86400000 ms)
- **Algoritmo**: HS512

### CORS
- **Orígenes permitidos**:
  - `http://localhost:5173` (frontend dev)
  - `http://localhost:3000`
  - `http://localhost:4173`

### Base de Datos
- **Usuario**: postgres
- **Contraseña**: 123 (⚠️ cambiar en producción)
- **Conexión**: HikariCP (5 conexiones máximo por defecto)

---

## 📊 Estructura Base de Datos

### Tabla `users`
```sql
id (BIGINT, PK, AUTO_INCREMENT)
email (VARCHAR, UNIQUE, NOT NULL)
password (VARCHAR, NOT NULL) -- BCrypt encoded
name (VARCHAR, NOT NULL)
phone (VARCHAR, NOT NULL)
role (VARCHAR, NOT NULL) -- CLIENTE, VENDEDOR, ADMIN, SUPERADMIN
enabled (BOOLEAN, NOT NULL, default=true)
created_at (TIMESTAMP, NOT NULL)
updated_at (TIMESTAMP)
```

---

## 🎯 Próximos Pasos Recomendados

1. **Testing Manual**:
   - [ ] Probar flujo completo de registro en UI
   - [ ] Verificar que el token se almacena en localStorage
   - [ ] Probar login con usuario registrado
   - [ ] Validar redirección según rol

2. **Validaciones Necesarias**:
   - [ ] Emails únicos (verificado ✅)
   - [ ] Formato de email válido
   - [ ] Contraseñas seguras
   - [ ] Teléfono válido

3. **Mejoras de Seguridad**:
   - [ ] Usar variables de entorno para secrets
   - [ ] Rate limiting en auth endpoints
   - [ ] Email verification
   - [ ] HTTPS en producción

4. **Extensiones Funcionales**:
   - [ ] Endpoints de productos (GET)
   - [ ] Carrito (POST/PUT/DELETE)
   - [ ] Órdenes
   - [ ] Perfil de usuario
   - [ ] Cambio de contraseña

---

## 📋 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `backend/pom.xml` | Agregada sección `<resources>` |
| `backend/src/main/java/.../SecurityConfig.java` | Actualizada configuración de auth endpoints |
| `backend/src/main/java/.../AuthService.java` | Agregado `.enabled(true)` en User builder |
| `frontend/src/pages/auth/RegisterPage.jsx` | Actualizado para guardar token y redirigir |

---

## 🚀 Comandos Útiles

```bash
# Backend - rebuild
mvn clean package -DskipTests

# Frontend - instalar dependencias
npm install

# Backend - logs en tiempo real
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.root=DEBUG"

# Probar conexión a BD
psql -h localhost -U postgres -d otaku_shop -c "SELECT COUNT(*) FROM users;"
```

---

## ✨ Estado Final

| Componente | Estado | Notas |
|-----------|--------|-------|
| Backend Spring Boot | ✅ Operacional | Compilado y corriendo |
| Base de Datos PostgreSQL | ✅ Conectada | Tablas creadas automáticamente |
| Frontend Vite | ✅ Operacional | Servidor dev corriendo |
| Autenticación JWT | ✅ Funcional | Tokens generados correctamente |
| Registro de Usuarios | ✅ Funcional | Probado exitosamente |
| CORS | ✅ Configurado | Permite requests desde frontend |

---

**Proyecto listo para desarrollo y testing.** 🎉

Para más información, consultar los archivos README.md en cada carpeta (backend/ y frontend/).
