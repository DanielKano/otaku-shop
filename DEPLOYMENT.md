# 🚀 Guía de Despliegue - Otaku Shop

## 📋 Requisitos Previos

- Java 21
- PostgreSQL 15+
- Node.js 20+
- Docker (opcional)
- Git

---

## 🛠️ Configuración Inicial

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

**Variables críticas:**
- `JWT_SECRET`: Clave secreta de al menos 256 bits
- `DB_PASSWORD`: Contraseña segura para PostgreSQL
- `DATABASE_URL`: URL de conexión a la base de datos

---

## 🐳 Despliegue con Docker (Recomendado)

### Desarrollo

```bash
# Iniciar base de datos
docker-compose up -d postgres

# Instalar dependencias backend
cd backend
mvn clean install

# Instalar dependencias frontend
cd ../frontend
npm install

# Iniciar backend (puerto 8080)
cd ../backend
mvn spring-boot:run

# Iniciar frontend (puerto 5173)
cd ../frontend
npm run dev
```

### Producción

```bash
# Build de todas las imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

Accede a:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/actuator/health

---

## 📦 Despliegue Manual

### Backend

```bash
cd backend

# 1. Compilar aplicación
mvn clean package -DskipTests

# 2. Configurar variables de entorno
export DATABASE_URL="jdbc:postgresql://localhost:5432/otaku_shop"
export DB_USERNAME="postgres"
export DB_PASSWORD="tu_password"
export JWT_SECRET="tu-secreto-jwt-muy-largo-y-seguro"

# 3. Ejecutar JAR
java -jar target/otaku-shop-backend-0.1.0.jar
```

### Frontend

```bash
cd frontend

# 1. Instalar dependencias
npm ci

# 2. Build de producción
npm run build

# 3. Servir con nginx (opción 1)
cp -r dist/* /usr/share/nginx/html/
cp nginx.conf /etc/nginx/conf.d/default.conf
nginx -s reload

# O servir con servidor estático (opción 2)
npx serve -s dist -l 80
```

---

## 🗄️ Migración de Base de Datos

### Primera Ejecución (Flyway Baseline)

```bash
# 1. Crear base de datos
psql -U postgres -c "CREATE DATABASE otaku_shop;"

# 2. La primera vez que ejecutes la aplicación, Flyway creará automáticamente:
#    - Todas las tablas (users, products, orders, cart_items)
#    - Índices necesarios
#    - Usuario superadmin inicial

# 3. Verificar migraciones aplicadas
psql -U postgres -d otaku_shop -c "SELECT * FROM flyway_schema_history;"
```

### Migraciones Incluidas

- **V1**: Tabla `users` con roles (CLIENT, VENDOR, ADMIN, SUPERADMIN)
- **V2**: Tabla `products` con workflow de aprobación
- **V3**: Tablas `orders` y `order_items`
- **V4**: Tabla `cart_items`
- **V8**: Usuario superadmin inicial

---

## ☁️ Despliegue en Render

### Configuración del Proyecto

1. **Fork o conecta tu repositorio** a Render

2. **Crear servicio PostgreSQL:**
   - Plan: Free o superior
   - Nombre: `otaku-shop-db`
   - Guardar la `DATABASE_URL` generada

3. **Crear servicio Backend (Web Service):**
   - Build Command: `cd backend && mvn clean package -DskipTests`
   - Start Command: `java -jar backend/target/otaku-shop-backend-0.1.0.jar`
   - Environment Variables:
     ```
     DATABASE_URL=<tu-postgresql-internal-url>
     DB_USERNAME=<usuario-generado>
     DB_PASSWORD=<password-generado>
     JWT_SECRET=<generar-secreto-seguro>
     CORS_ALLOWED_ORIGINS=https://tu-frontend.onrender.com
     ```

4. **Crear servicio Frontend (Static Site):**
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Environment Variables:
     ```
     VITE_API_BASE_URL=https://tu-backend.onrender.com/api
     ```

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- [ ] JWT_SECRET con al menos 256 bits aleatorios
- [ ] DB_PASSWORD segura (mínimo 16 caracteres)
- [ ] CORS configurado solo para dominios autorizados
- [ ] HTTPS habilitado (obligatorio)
- [ ] Variables de entorno NUNCA en el código
- [ ] Logs de debug desactivados (`logging.level.root=INFO`)
- [ ] Firewall configurado (solo puertos 80/443/22)
- [ ] Backups automáticos de base de datos

### Generar JWT Secret Seguro

```bash
# Opción 1: OpenSSL
openssl rand -base64 64

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Opción 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## 📊 Monitoreo

### Health Checks

```bash
# Backend health
curl http://localhost:8080/api/actuator/health

# Backend metrics
curl http://localhost:8080/api/actuator/metrics

# Frontend status
curl -I http://localhost
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Logs de aplicación (manual)
tail -f backend/logs/application.log
```

---

## 🧪 Testing

### Tests Unitarios

```bash
cd backend
mvn test
```

### CI/CD con GitHub Actions

El proyecto incluye workflow configurado (`.github/workflows/ci.yml`) que ejecuta:

1. ✅ Tests backend con PostgreSQL
2. ✅ Build frontend
3. ✅ Security scan con Trivy
4. ✅ Build de imágenes Docker

**Activar CI/CD:**
1. Push a `main` o `develop`
2. Crear Pull Request

---

## 🔄 Actualizaciones

### Backend

```bash
cd backend
git pull origin main
mvn clean package -DskipTests
# Flyway aplicará automáticamente nuevas migraciones
java -jar target/otaku-shop-backend-0.1.0.jar
```

### Frontend

```bash
cd frontend
git pull origin main
npm install
npm run build
# Copiar dist/ a servidor nginx
```

---

## 🐛 Troubleshooting

### Error: "Table already exists"

```bash
# Ejecutar baseline de Flyway
spring.flyway.baseline-on-migrate=true
```

### Error: "JWT signature does not match"

```bash
# Verificar que JWT_SECRET sea el mismo en todos los entornos
echo $JWT_SECRET
```

### Error de CORS

```bash
# Verificar CORS_ALLOWED_ORIGINS incluye el dominio frontend
# Formato: http://localhost:5173,https://tudominio.com
```

### PostgreSQL connection refused

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Verificar credenciales
psql -U $DB_USERNAME -d otaku_shop -h localhost
```

---

## 📞 Soporte

**Logs importantes:**
- Backend: `backend/logs/application.log`
- Frontend: Console del navegador (F12)
- PostgreSQL: `docker-compose logs postgres`

**Usuario Superadmin por defecto:**
- Email: `superadmin@otakushop.com`
- Password: `SuperAdmin123!`
- ⚠️ **Cambiar inmediatamente en producción**

---

## 🎯 Próximos Pasos

Después del primer despliegue:

1. Cambiar password del superadmin
2. Crear usuarios de prueba
3. Configurar backup automático de PostgreSQL
4. Configurar alertas de monitoreo
5. Revisar logs de errores
6. Ejecutar tests de carga (opcional)

---

**✨ ¡Despliegue exitoso! Tu Otaku Shop está online.**
