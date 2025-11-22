# 🚀 Siguiente Paso: GitHub

## 1️⃣ Crear Repositorio en GitHub

```bash
# Ve a https://github.com/new
# Nombre: otaku-shop-fullstack
# Descripción: Full-stack e-commerce app with React 18 + Spring Boot 3.2
# NO inicialices con README (ya lo tenemos)
# Crear repositorio
```

## 2️⃣ Conectar Repositorio Local a GitHub

```bash
cd C:\Users\polon\OneDrive\Documentos\Programacion\otaku-shop-fullstack

# Agregar remote (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/otaku-shop-fullstack.git

# Cambiar rama a main (recomendado)
git branch -M main

# Hacer push
git push -u origin main
```

## 3️⃣ Conectar a Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio GitHub
4. Sigue los pasos en `RENDER_DEPLOYMENT.md`

## ✅ Comandos Rápidos

```bash
# Verificar status
git status

# Ver commits
git log --oneline

# Ver remote
git remote -v
```

## 📝 Notas

- El commit inicial incluye todo el código
- No olvides crear variables de entorno en Render
- Las tablas de BD se crean automáticamente
- El frontend y backend están en el mismo repositorio

¡Listo para producción! 🎉
