# Otaku Shop - Monorepo

E-commerce fullstack para venta de productos relacionados con anime, manga y cultura otaku.

## 📁 Estructura del Proyecto

```
otaku-shop-fullstack/
├── frontend/              # React 18 + Vite + Tailwind CSS
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/               # Spring Boot 3.2 + MySQL + JWT
│   ├── src/
│   ├── pom.xml
│   └── application.properties
├── docker-compose.yml     # Configuración local de MySQL
├── render.yaml           # Configuración para deployment en Render
└── .gitignore
```

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos
- Node.js 18+
- Java 21
- Maven 3.8+
- MySQL 8.0+

### Frontend
```bash
cd frontend
npm install
npm run dev        # Arranca en http://localhost:5173
```

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run  # Arranca en http://localhost:8080
```

### Base de Datos
```bash
# Con Docker Compose (recomendado)
docker-compose up -d

# O MySQL manual
mysql -u root -p
CREATE DATABASE otaku_shop;
```

## 🌐 Deployment en Render

### Configuración Automática
El archivo `render.yaml` configura automáticamente:
- ✅ Backend Spring Boot como Web Service
- ✅ Frontend React como Static Site
- ✅ MySQL como Managed Database

### Variables de Entorno Necesarias

**Backend (.env):**
```
SPRING_DATASOURCE_URL=mysql://user:password@host:3306/otaku_shop
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=tu_secret_key_super_segura
JWT_EXPIRATION=86400000
```

**Frontend (.env):**
```
VITE_API_BASE_URL=https://tu-backend-render.onrender.com
```

## 📚 Documentación

- [Frontend Setup](./frontend/README.md)
- [Backend Setup](./backend/README.md)

## 🔐 Seguridad

- JWT para autenticación
- CORS configurado
- Validación de input
- Contraseñas hasheadas con BCrypt
- Environment variables para secretos

## 👥 Arquitectura

### Frontend
- React 18.3.1
- Vite 5.2.11
- Tailwind CSS 3.4.4
- React Router 6.24.1
- Zod para validación
- Axios con interceptores JWT

### Backend
- Spring Boot 3.2
- Spring Data JPA + Hibernate
- Spring Security 6.0
- MySQL 8.0
- JWT (jjwt)
- Lombok + MapStruct

## 📊 Estados de la Aplicación

- ✅ Frontend: 43 componentes, 15 páginas
- ✅ Backend: 27 archivos, APIs CRUD
- ✅ Base de datos: Esquema completo
- 🔄 Deployment: Listo para Render

## 📝 Licencia

MIT
