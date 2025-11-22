# 🚀 Instrucciones de Migración al Monorepo

## Paso 1: Copiar Frontend Existente

```bash
# Desde PowerShell
Copy-Item -Path "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop\*" `
          -Destination "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\frontend\" `
          -Recurse -Force

# Excluir node_modules y dist
Remove-Item "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\frontend\dist" -Recurse -Force -ErrorAction SilentlyContinue
```

## Paso 2: Copiar Backend Existente

```bash
# Copiar estructura src
Copy-Item -Path "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-backend\src" `
          -Destination "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\backend\" `
          -Recurse -Force

# Copiar archivos de configuración
Copy-Item -Path "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-backend\pom.xml" `
          -Destination "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\backend\" `
          -Force
```

## Paso 3: Limpiar Archivos Temporales (Backend)

```bash
Remove-Item "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\backend\target" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\backend\.classpath" -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack\backend\.project" -Force -ErrorAction SilentlyContinue
```

## Paso 4: Crear Repository en GitHub

1. Ve a [GitHub New Repository](https://github.com/new)
2. Nombre: `otaku-shop-fullstack`
3. Descripción: `E-commerce fullstack React + Spring Boot`
4. Inicializar con README: ✅ (pero no lo necesitas, ya lo creamos)
5. Crear repositorio

## Paso 5: Inicializar Git y Hacer Push

```bash
cd C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack

# Inicializar repositorio local
git init
git add .
git commit -m "feat: initial monorepo structure with frontend and backend

- React 18 frontend with 43 components and 15 pages
- Spring Boot 3.2 backend with JWT authentication
- MySQL database configuration
- Docker Compose for local development
- Render.yaml for production deployment"

# Agregar remote (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/otaku-shop-fullstack.git
git branch -M main
git push -u origin main
```

## Paso 6: Actualizar URLs de API (Si es necesario)

En `frontend/src/services/api.js`, asegúrate que:

```javascript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

## Paso 7: Verificar Estructura

```bash
# Ver la estructura final
tree -L 3 C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack

# O lista con PowerShell
Get-ChildItem -Path "C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack" -Recurse -Depth 2
```

## ✅ Estructura Final Esperada

```
otaku-shop-fullstack/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/otakushop/
│   │   │   │       ├── entity/
│   │   │   │       ├── dto/
│   │   │   │       ├── repository/
│   │   │   │       ├── service/
│   │   │   │       ├── controller/
│   │   │   │       ├── security/
│   │   │   │       ├── config/
│   │   │   │       └── OtakuShopApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── Dockerfile
│   └── .gitignore
├── docker-compose.yml
├── render.yaml
├── README.md
├── RENDER_DEPLOYMENT.md
├── MIGRATION.md (este archivo)
└── .gitignore
```

## 🔄 Próximos Pasos

1. [x] Crear estructura de monorepo
2. [ ] Copiar frontend y backend
3. [ ] Crear repositorio GitHub
4. [ ] Hacer commit inicial
5. [ ] Compilar y testear localmente
6. [ ] Desplegar en Render
7. [ ] Configurar dominio personalizado

## 📝 Notas Importantes

- **No commits** `node_modules/` ni `target/`
- El `.gitignore` ya está configurado
- Usa variables de entorno para secretos
- En producción, asegúrate que `VITE_API_BASE_URL` apunta al backend de Render

## 🆘 Si Algo Sale Mal

Si necesitas rollback:

```bash
# Ir a la carpeta anterior
cd C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop
git status

# Los proyectos originales siguen intactos en sus carpetas
```

El monorepo es una copia, tus proyectos originales siguen seguros en sus carpetas.
