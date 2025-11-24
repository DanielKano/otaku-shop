# 🔐 Configuración OAuth2 - Login Social

## Guía para configurar Google y Facebook Login

---

## 🔵 Google OAuth2 Setup

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en "Select a project" → "New Project"
3. Nombre: `Otaku Shop` → Create

### 2. Habilitar Google+ API

1. En el menú lateral: APIs & Services → Library
2. Buscar: "Google+ API"
3. Click en "Enable"

### 3. Configurar OAuth Consent Screen

1. APIs & Services → OAuth consent screen
2. User Type: **External** → Create
3. Llenar información:
   - App name: `Otaku Shop`
   - User support email: tu email
   - Developer contact: tu email
4. Scopes → Add or Remove Scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
5. Test users: Agregar tu email
6. Save and Continue

### 4. Crear Credenciales OAuth 2.0

1. APIs & Services → Credentials
2. Click "Create Credentials" → OAuth client ID
3. Application type: **Web application**
4. Name: `Otaku Shop Web Client`
5. Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:8080
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:8080/api/login/oauth2/code/google
   ```
7. Click **Create**
8. 📋 **Copiar Client ID y Client Secret**

### 5. Configurar en application.properties

```properties
spring.security.oauth2.client.registration.google.client-id=TU_GOOGLE_CLIENT_ID_AQUI
spring.security.oauth2.client.registration.google.client-secret=TU_GOOGLE_CLIENT_SECRET_AQUI
```

---

## 🔷 Facebook OAuth2 Setup

### 1. Crear App en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. My Apps → Create App
3. Use case: **None** → Next
4. App type: **Business** → Next
5. Display name: `Otaku Shop`
6. App contact email: tu email
7. Create App

### 2. Configurar Facebook Login

1. En Dashboard → Add Product
2. Buscar "Facebook Login" → Set Up
3. Quickstart → **Web**
4. Site URL: `http://localhost:5174`
5. Save → Continue

### 3. Configurar OAuth Redirect

1. Facebook Login → Settings
2. Valid OAuth Redirect URIs:
   ```
   http://localhost:8080/api/login/oauth2/code/facebook
   ```
3. Save Changes

### 4. Obtener Credenciales

1. Settings → Basic
2. 📋 **Copiar:**
   - App ID
   - App Secret (click "Show")

### 5. Configurar App Domains

1. Settings → Basic
2. App Domains:
   ```
   localhost
   ```
3. Save Changes

### 6. Configurar en application.properties

```properties
spring.security.oauth2.client.registration.facebook.client-id=TU_FACEBOOK_APP_ID_AQUI
spring.security.oauth2.client.registration.facebook.client-secret=TU_FACEBOOK_APP_SECRET_AQUI
```

---

## ⚙️ Configuración Completa

### application.properties

```properties
# OAuth2 Configuration
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=123456789-abcdefghijklmnop.apps.googleusercontent.com
spring.security.oauth2.client.registration.google.client-secret=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}

# Facebook OAuth2
spring.security.oauth2.client.registration.facebook.client-id=1234567890123456
spring.security.oauth2.client.registration.facebook.client-secret=abcdef1234567890abcdef1234567890
spring.security.oauth2.client.registration.facebook.scope=email,public_profile
spring.security.oauth2.client.registration.facebook.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}

# OAuth2 Redirect URI (frontend)
app.oauth2.redirectUri=http://localhost:5174/oauth2/redirect
```

---

## 🧪 Testing

### 1. Iniciar Backend
```bash
cd backend
mvn spring-boot:run
```

### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
```

### 3. Probar Login Social

1. Ir a `http://localhost:5174/login`
2. Click en "Continuar con Google" o "Continuar con Facebook"
3. Autorizar permisos
4. Debería redirigir a `/oauth2/redirect` con token
5. Usuario creado automáticamente en DB

---

## 🔍 Verificación en Base de Datos

```sql
-- Ver usuarios creados vía OAuth2
SELECT id, email, name, provider, provider_id, created_at 
FROM users 
WHERE provider IN ('GOOGLE', 'FACEBOOK');
```

---

## 🚨 Troubleshooting

### Error: "Redirect URI mismatch"

**Solución:** Verificar que las URIs en Google/Facebook coincidan exactamente:
```
http://localhost:8080/api/login/oauth2/code/google
http://localhost:8080/api/login/oauth2/code/facebook
```

### Error: "Email not provided"

**Solución Facebook:** 
1. App Review → Permissions and Features
2. Request "email" permission
3. Para desarrollo, agregar usuario en Roles → Test Users

### Error: CORS

**Solución:** Verificar `application.properties`:
```properties
cors.allowedOrigins=http://localhost:5173,http://localhost:5174
```

### Backend no redirige al frontend

**Solución:** Verificar `OAuth2AuthenticationSuccessHandler`:
```java
@Value("${app.oauth2.redirectUri:http://localhost:5174/oauth2/redirect}")
private String redirectUri;
```

---

## 📱 Producción

### Cambios necesarios:

1. **Google Console:**
   - Authorized redirect URIs: `https://tudominio.com/api/login/oauth2/code/google`
   - JavaScript origins: `https://tudominio.com`

2. **Facebook App:**
   - Valid OAuth Redirect URIs: `https://tudominio.com/api/login/oauth2/code/facebook`
   - App Domains: `tudominio.com`

3. **application.properties:**
```properties
app.oauth2.redirectUri=https://tudominio.com/oauth2/redirect
```

---

## 🎯 Flujo Completo

```
1. Usuario click "Login con Google/Facebook"
   ↓
2. Redirige a /oauth2/authorization/{provider}
   ↓
3. Spring Security inicia OAuth2 flow
   ↓
4. Usuario autoriza en Google/Facebook
   ↓
5. Callback a /login/oauth2/code/{provider}
   ↓
6. CustomOAuth2UserService procesa datos
   ↓
7. Crea/actualiza usuario en DB
   ↓
8. OAuth2AuthenticationSuccessHandler genera JWT
   ↓
9. Redirige a /oauth2/redirect?token=XXX
   ↓
10. Frontend guarda token y redirige a dashboard
```

---

## ✅ Checklist Final

- [ ] Google Cloud Console configurado
- [ ] Facebook App creada y configurada
- [ ] Client IDs y Secrets en application.properties
- [ ] Redirect URIs coinciden exactamente
- [ ] Backend corriendo en puerto 8080
- [ ] Frontend corriendo en puerto 5174
- [ ] CORS configurado correctamente
- [ ] Base de datos PostgreSQL activa
- [ ] Tabla `users` tiene campos `provider` y `provider_id`

---

**¡Listo para usar OAuth2 login! 🚀**
