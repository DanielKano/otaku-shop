# Guía de Deployment en Render

## 📋 Prerrequisitos

- [ ] Cuenta en [Render.com](https://render.com)
- [ ] Repositorio GitHub/GitLab con el código
- [ ] Variables de entorno configuradas

## 🚀 Pasos de Deployment

### 1. Conectar Repositorio a Render

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com)
2. Haz clic en "New +"
3. Selecciona "Web Service" para el backend
4. Conecta tu repositorio GitHub/GitLab
5. Selecciona la rama `main` o `master`

### 2. Configurar el Backend

**Nombre del servicio:** `otaku-shop-backend`

**Configuración Build:**
```
Build Command: cd backend && mvn clean install -DskipTests
Start Command: cd backend && java -jar target/otaku-shop-*.jar
```

**Environment Variables:**
```
SPRING_DATASOURCE_URL=mysql://user:password@host:3306/otaku_shop
SPRING_DATASOURCE_USERNAME=otaku_user
SPRING_DATASOURCE_PASSWORD=<tu_password>
JWT_SECRET=<genera_una_clave_segura>
SPRING_JPA_HIBERNATE_DDL_AUTO=update
PORT=8080
```

**Plan:** Free o Starter según necesidad

### 3. Crear Base de Datos MySQL

1. En Render Dashboard, haz clic en "New +"
2. Selecciona "MySQL"
3. **Nombre:** `otaku-shop-db`
4. **Database Name:** `otaku_shop`
5. **Username:** `otaku_user`
6. **Password:** (copia la contraseña generada)

Copia el `External Database URL` y úsalo en `SPRING_DATASOURCE_URL` del backend.

### 4. Configurar el Frontend

1. Crea otro Web Service
2. **Nombre:** `otaku-shop-frontend`
3. **Build Command:** `cd frontend && npm ci && npm run build`
4. **Start Command:** `serve -s dist -l 3000`
5. **Publish Directory:** `frontend/dist`

**Environment Variables:**
```
VITE_API_BASE_URL=https://otaku-shop-backend.onrender.com
```

### 5. Configuración CORS (Backend)

En `application.properties` (Render):
```properties
server.servlet.context-path=/api
cors.allowed.origins=https://otaku-shop-frontend.onrender.com
```

O actualiza `SecurityConfig.java`:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://otaku-shop-frontend.onrender.com")
            .allowedMethods("*")
            .allowCredentials(true);
    }
}
```

## 🔄 Deployment Automático

Para activar CI/CD automático:

1. Renderiza los servicios desde `render.yaml`:
   ```bash
   # Opción manual en Dashboard
   # O usar Render CLI (si está disponible)
   ```

2. Cada push a la rama principal dispara un deployment automático

## 🛠️ Troubleshooting

### Backend no inicia
- Verifica que las variables de entorno están correctas
- Revisa los logs: `Logs` tab en Render Dashboard
- Asegúrate de que la base de datos está disponible

### Frontend no se ve
- Verifica que `VITE_API_BASE_URL` es correcto
- Limpia el caché del navegador (Ctrl+Shift+Delete)
- Revisa la consola del navegador (F12)

### Error de CORS
- Asegúrate de que el backend tiene configurado el CORS correcto
- La URL del frontend debe incluir el protocolo (https://)
- No uses localhost en producción

### Base de datos
- Verifica la conexión con MySQL Workbench
- Asegúrate de que las credenciales son correctas
- Las tablas se crearán automáticamente con Hibernate

## 📊 Monitoreo

En el Dashboard de Render puedes:
- Ver logs en tiempo real
- Monitorear uso de recursos
- Ver estadísticas de deployment
- Configurar alertas

## 🔐 Seguridad

- Nunca commits `JWT_SECRET` en el código
- Usa variables de entorno para todos los secretos
- En Render Dashboard, marca como "Secret" las variables sensibles
- Cambia las contraseñas por defecto

## 📚 Links Útiles

- [Documentación Render](https://render.com/docs)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Spring Boot on Render](https://render.com/docs/deploy-spring-boot)
- [React on Render](https://render.com/docs/deploy-react)

## 🎯 Próximos Pasos

1. [ ] Configurar el backend en Render
2. [ ] Crear la base de datos MySQL
3. [ ] Configurar el frontend en Render
4. [ ] Probar la conexión entre servicios
5. [ ] Configurar dominio personalizado (opcional)
6. [ ] Configurar HTTPS/SSL (automático en Render)
