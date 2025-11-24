# Otaku Shop - Monorepo

E-commerce fullstack para venta de productos relacionados con anime, manga y cultura otaku.

## 📁 Estructura del Proyecto

```
otaku-shop-fullstack/
├── frontend/              # React 18 + Vite + Tailwind CSS
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/               # Spring Boot 3.2 + PostgreSQL + JWT + OAuth2
│   ├── src/
│   ├── pom.xml
│   └── application.properties
├── docker-compose.yml     # Configuración local de PostgreSQL
└── .gitignore
```

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos
- Node.js 18+
- Java 21
- Maven 3.8+
- PostgreSQL 14+

### Frontend
```bash
cd frontend
npm install
npm run dev        # Arranca en http://localhost:5174
```

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run  # Arranca en http://localhost:8080
```

### Base de Datos
```bash
# Con PostgreSQL manual
psql -U postgres
CREATE DATABASE otaku_shop;
```

## 📚 Documentación

- [OAuth2 Setup Guide](./OAUTH2_SETUP_GUIDE.md) - Configuración de Google y Facebook Login
- [OAuth2 Implementation Summary](./OAUTH2_IMPLEMENTATION_SUMMARY.md) - Resumen técnico

## 🔐 Seguridad

- JWT para autenticación
- OAuth2 Social Login (Google, Facebook)
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
- Axios con interceptores JWT

### Backend
- Spring Boot 3.2
- Spring Data JPA + Hibernate
- Spring Security 6.0 + OAuth2
- PostgreSQL 14
- JWT (jjwt)
- Lombok

## 📝 Licencia

MIT
