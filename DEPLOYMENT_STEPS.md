# 🎯 PASO A PASO: DEL DESARROLLO A RENDER

## ✅ LO QUE YA HICIMOS

Tu monorepo está completamente listo con:
- ✅ Frontend React 18 (43 componentes)
- ✅ Backend Spring Boot 3.2 (27 clases)
- ✅ Docker Compose para desarrollo local
- ✅ Configuración Render automática
- ✅ Documentación completa
- ✅ 2 commits Git iniciales

**Carpeta:** `C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack`

---

## 🚀 SIGUIENTES PASOS (Debes hacer esto)

### Paso 1: Crear Repositorio en GitHub ⭐

1. Ve a https://github.com/new
2. Rellena:
   - **Repository name:** `otaku-shop-fullstack`
   - **Description:** `Full-stack e-commerce for anime products - React 18 + Spring Boot 3.2`
   - **Public:** Elige según prefieras
3. **IMPORTANTE:** NO marques "Initialize this repository with..."
4. Click **"Create repository"**

### Paso 2: Conectar tu repositorio local a GitHub

En PowerShell, en la carpeta del monorepo:

```powershell
cd C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack

# Agregar el remote (reemplaza TUUSUARIO)
git remote add origin https://github.com/TUUSUARIO/otaku-shop-fullstack.git

# Cambiar a rama main (recomendado)
git branch -M main

# Hacer push
git push -u origin main
```

**Resultado esperado:**
```
Enumerating objects: 35, done.
Counting objects: 100% (35/35), done.
...
To github.com:TUUSUARIO/otaku-shop-fullstack.git
 * [new branch]      main -> main
Branch 'main' set to track remote branch 'main' from 'origin'.
```

### Paso 3: Verificar en GitHub

- Ve a https://github.com/TUUSUARIO/otaku-shop-fullstack
- Deberías ver:
  - Frontend folder ✅
  - Backend folder ✅
  - docker-compose.yml ✅
  - render.yaml ✅
  - README.md ✅
  - Otros archivos ✅

### Paso 4: Conectar a Render

1. Ve a https://dashboard.render.com
2. Haz login/signup
3. Click **"New +"** → **"Web Service"**
4. **"Connect a repository"** → Selecciona `otaku-shop-fullstack`
5. Siguiente
6. Rellena:
   - **Name:** `otaku-shop-backend`
   - **Build Command:** `cd backend && mvn clean install -DskipTests`
   - **Start Command:** `cd backend && java -jar target/otaku-shop-*.jar`
   - **Plan:** Free (para empezar)
7. Click **"Advanced"** y agrega variables de entorno:

```
SPRING_DATASOURCE_URL=mysql://user:password@host:3306/otaku_shop
SPRING_DATASOURCE_USERNAME=otaku_user
SPRING_DATASOURCE_PASSWORD=(genera una contraseña)
JWT_SECRET=(genera una clave: openssl rand -hex 32)
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

8. Click **"Create Web Service"**

### Paso 5: Crear Base de Datos MySQL en Render

1. En el dashboard, click **"New +"** → **"MySQL"**
2. Rellena:
   - **Name:** `otaku-shop-db`
   - **Database Name:** `otaku_shop`
   - **Username:** `otaku_user`
   - **Password:** (genera una segura)
3. Click **"Create"**
4. Espera a que esté "Available"
5. Copia el `External Database URL`
6. Actualiza `SPRING_DATASOURCE_URL` en el backend service con este URL

### Paso 6: Crear Frontend Static Site en Render

1. Click **"New +"** → **"Static Site"**
2. Selecciona `otaku-shop-fullstack` nuevamente
3. Rellena:
   - **Name:** `otaku-shop-frontend`
   - **Build Command:** `cd frontend && npm ci && npm run build`
   - **Publish Directory:** `frontend/dist`
4. Click **"Advanced"** y agrega variable:

```
VITE_API_BASE_URL=https://otaku-shop-backend.onrender.com
```

5. Click **"Create Static Site"**

### Paso 7: Esperar a que Render despliegue

- El backend tardará ~5-10 minutos
- El frontend tardará ~2-5 minutos
- Verás "Live" cuando esté listo

### Paso 8: Probar

1. **Frontend:** `https://otaku-shop-frontend.onrender.com`
2. **Backend API:** `https://otaku-shop-backend.onrender.com/api/products`
3. **Auth:** Intenta registrarte en el frontend

---

## 📚 ARCHIVOS IMPORTANTES

Léelos en este orden:

1. **README.md** - Descripción general
2. **GITHUB_SETUP.md** - Instrucciones GitHub (puedes saltarte esto)
3. **RENDER_DEPLOYMENT.md** - Detalles de Render (si necesitas ayuda)
4. **docker-compose.yml** - Para development local
5. **.env.example** - Variables necesarias

---

## 🆘 PROBLEMAS COMUNES

### El backend no inicia
- Verifica que las variables de entorno están correctas
- Abre la pestaña "Logs" en Render para ver errores
- MySQL debe estar creada primero

### El frontend no se ve
- Limpia caché: Ctrl+Shift+Delete
- Verifica que `VITE_API_BASE_URL` en Render apunta al backend correcto
- Abre la consola (F12) para ver errores

### Errores CORS
- El backend tiene CORS configurado para producción
- Si aún hay problemas, edita `backend/src/main/java/com/otakushop/config/WebConfig.java`

### La base de datos no conecta
- Verifica credenciales en SPRING_DATASOURCE_URL
- Las tablas se crearán automáticamente (ddl-auto=update)

---

## ✨ DEPLOYMENT AUTOMÁTICO

Después del primer deployment:

- **Cada push a `main`** dispara un deployment automático
- Render detecta cambios en:
  - Frontend → redeploy del static site
  - Backend → redeploy del web service
- No necesitas hacer nada más, ¡es automático! 🎉

---

## 🔐 SEGURIDAD EN PRODUCCIÓN

Checklist:
- ✅ JWT_SECRET: Cambia a una clave segura (usa `openssl rand -hex 32`)
- ✅ Contraseña MySQL: Usa una contraseña fuerte
- ✅ CORS: Configurado solo para tu dominio
- ✅ HTTPS: Automático en Render
- ✅ Variables "Secret": Marcarlas en Render (opcional)

---

## 🎯 RESULTADO FINAL

Tu aplicación estará en:

```
Frontend:  https://otaku-shop-frontend.onrender.com
Backend:   https://otaku-shop-backend.onrender.com
API Docs:  https://otaku-shop-backend.onrender.com/api/products
```

¡Y todo synced automáticamente cuando haces push a GitHub! 🚀

---

## 📞 ¿Preguntas?

Lee los archivos .md si necesitas más detalles:
- `RENDER_DEPLOYMENT.md` - Guía completa Render
- `README.md` - Stack y comandos
- `.env.example` - Variables necesarias

¡Éxito con tu deployment! 🎉
