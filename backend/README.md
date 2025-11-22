# Otaku Shop Backend - Spring Boot 3.2

Backend API REST para el e-commerce de Otaku Shop, desarrollado con Spring Boot 3.2 y Java 21.

## 🚀 Características

- ✅ Autenticación con JWT
- ✅ Gestión de usuarios con roles (cliente, vendedor, admin, superadmin)
- ✅ API REST de productos con filtros, búsqueda y paginación
- ✅ Sistema de órdenes completo
- ✅ Validación de datos con Zod (backend)
- ✅ CORS configurado
- ✅ Seguridad con Spring Security
- ✅ Base de datos MySQL

## 📋 Requisitos

- Java 21 o superior
- Maven 3.9+
- MySQL 8.0+
- Node.js 20+ (para ejecutar el frontend)

## ⚙️ Instalación

### 1. Clonar y navegar al proyecto

```bash
cd otaku-shop-backend
```

### 2. Configurar la base de datos

```sql
CREATE DATABASE otaku_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Editar `src/main/resources/application.properties` con tus credenciales:

```properties
spring.datasource.username=root
spring.datasource.password=tu_contraseña
```

### 3. Compilar el proyecto

```bash
mvn clean install
```

### 4. Ejecutar la aplicación

```bash
mvn spring-boot:run
```

El servidor estará disponible en `http://localhost:8080/api`

## 📚 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Productos

- `GET /api/products` - Obtener todos los productos
- `GET /api/products/{id}` - Obtener un producto
- `GET /api/products/category/{category}` - Productos por categoría
- `GET /api/products/search?keyword=...` - Buscar productos
- `GET /api/products/filter?category=...&minPrice=...&maxPrice=...` - Filtrar productos
- `POST /api/products` - Crear producto (requiere autenticación)
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

### Órdenes

- `GET /api/orders` - Ver órdenes del usuario
- `GET /api/orders/{id}` - Detalle de una orden
- `POST /api/orders` - Crear nueva orden
- `PUT /api/orders/{id}` - Actualizar estado de orden

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens). Incluir en el header:

```
Authorization: Bearer <token>
```

## 📝 Estructura del Proyecto

```
src/main/java/com/otakushop/
├── controller/          # Controladores REST
├── service/             # Lógica de negocio
├── repository/          # Acceso a datos (JPA)
├── entity/              # Modelos de datos
├── dto/                 # Objetos de transferencia
├── security/            # Seguridad y JWT
├── config/              # Configuración
└── OtakuShopApplication.java
```

## 🔧 Variables de Entorno

- `JWT_SECRET` - Clave secreta para JWT (producción)
- `DB_URL` - URL de la base de datos
- `DB_USER` - Usuario de la base de datos
- `DB_PASS` - Contraseña de la base de datos

## 📝 Documentación

API documentada con OpenAPI/Swagger (próximamente en `/api/swagger-ui.html`)

## 🧪 Testing

```bash
mvn test
```

## 📦 Dependencias Principales

- Spring Boot 3.2
- Spring Data JPA
- Spring Security
- JWT (jjwt)
- MySQL Driver
- Lombok
- MapStruct

## 🚀 Deploy

### Docker

```bash
docker build -t otaku-shop-backend .
docker run -p 8080:8080 otaku-shop-backend
```

### Maven

```bash
mvn clean package
java -jar target/otaku-shop-backend-0.1.0.jar
```

## 📄 Licencia

MIT License

## 👨‍💻 Autor

Otaku Shop Development Team

---

**Estado:** En desarrollo  
**Versión:** 0.1.0  
**Última actualización:** 2024
