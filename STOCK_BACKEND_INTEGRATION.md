# 🔗 Integración de Stock Frontend-Backend

**Fecha**: 25 de Noviembre de 2025
**Estado**: ✅ Implementado
**Importancia**: CRÍTICA para funcionalidad multi-usuario

## 📋 Problema Identificado

El frontend tenía un servicio `stockReservationApiService` definido pero **NUNCA SE USABA**. Todo funcionaba solo en `localStorage` local, lo que causaba:

### ❌ Problemas Críticos
1. **Sin sincronización entre usuarios**: Si Usuario A reservaba 5 unidades, Usuario B no lo veía
2. **Sin persistencia**: Si recargabas la página, perdías las reservas (solo localStorage)
3. **Sin validación real en backend**: El backend no sabía qué estaba reservado
4. **Checkout fallaba silenciosamente**: Órdenes podían procesar con stock insuficiente
5. **Sin límite temporal real**: Las reservas de 14 días eran solo locales

---

## ✅ Solución Implementada

### Arquitectura Híbrida (Mejor de ambos mundos)

```
                    ┌─────────────────────────────────┐
                    │    CLIENTE (Frontend)            │
                    │  localStorage + API Sync         │
                    └──────────────┬────────────────────┘
                                   │
                    ┌──────────────┴────────────────┐
                    │                               │
         ┌──────────▼──────────┐      ┌───────────▼──────────┐
         │  Reservas Locales   │      │   Backend API        │
         │  (UX Rápido)        │      │  (Sincronización)    │
         │  - Ultra rápido     │      │  - Multi-usuario     │
         │  - Sin latencia     │      │  - Persistente       │
         │  - Modo offline     │      │  - Confiable         │
         └──────────────────────┘      └──────────────────────┘
```

### 1️⃣ **Frontend Service Mejorado** (`stockReservationService.js`)

#### Cambios Principales:

**ANTES:**
```javascript
// Solo localStorage, sin backend
reserveStock(productId, quantity) {
  // Guardar localmente
  this.reservations.set(productId, { quantity, expiresAt })
  this.saveReservations() // Solo localStorage
}
```

**AHORA:**
```javascript
// Intenta backend, fallback a local
async reserveStock(productId, quantity) {
  // Paso 1: Guardar localmente para UX rápida
  const reservation = this.createLocalReservation(productId, quantity)
  
  // Paso 2: Sincronizar con backend en background
  try {
    const response = await api.post('/stock-reservations/reserve', {
      productId,
      quantity
    })
    // Guardar ID del backend para futura sincronización
    reservation.backendId = response.data.reservationId
  } catch (error) {
    console.warn('Backend sync failed, using local:', error)
  }
  
  return reservation
}
```

#### Métodos Nuevos:

1. **`syncWithBackend()`** - Sincroniza cada 5 minutos
   ```javascript
   // Envía estado local al backend
   await api.post('/stock-reservations/sync', {
     reservations: { ... }
   })
   ```

2. **`loadFromBackend()`** - Recarga reservas del servidor
   ```javascript
   // Obtiene reservas activas del usuario autenticado
   const response = await api.get('/stock-reservations/my-reservations')
   ```

---

### 2️⃣ **Backend Endpoints Nuevos**

#### `GET /api/stock-reservations/my-reservations`
**Obtiene todas las reservas activas del usuario autenticado**

Request:
```
GET /api/stock-reservations/my-reservations
Authorization: Bearer JWT_TOKEN
```

Response:
```json
{
  "success": true,
  "userId": 21,
  "reservations": [
    {
      "id": "res-123",
      "productId": 5,
      "quantity": 3,
      "expiresAt": 1764265209000,
      "createdAt": "2025-11-25T10:43:29"
    }
  ],
  "count": 1
}
```

#### `POST /api/stock-reservations/sync`
**Sincroniza reservas del cliente con el backend**

Request:
```json
{
  "reservations": {
    "5": {
      "quantity": 3,
      "expiresAt": 1764265209000,
      "backendId": "res-123"
    },
    "10": {
      "quantity": 2,
      "expiresAt": 1764265209000,
      "backendId": null
    }
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Sincronización completada",
  "reservations": [
    {
      "productId": 5,
      "backendId": "res-123"
    },
    {
      "productId": 10,
      "backendId": "res-456"
    }
  ]
}
```

---

## 🔄 Flujo de Sincronización

### Cuando Agregas un Producto al Carrito

```
1. Usuario hace clic "Agregar"
   ↓
2. Frontend: Reserva localmente INMEDIATAMENTE
   - Actualiza UI al instante ✅
   - Guarda en localStorage
   ↓
3. Frontend: Sincroniza con backend en background
   - POST /stock-reservations/reserve
   - Obtiene backendId
   ↓
4. Backend: Crea reserva real en DB
   - Valida contra BD de productos
   - Crea registro StockReservation
   - Devuelve reservationId
   ↓
5. Frontend: Actualiza localmente con backendId
   - Próximos sync usarán backendId
```

### Cada 5 Minutos (Sincronización Periódica)

```
1. Frontend: POST /stock-reservations/sync
   - Envía todas las reservas locales
   - Incluye sus backendIds si existen
   ↓
2. Backend: Valida y actualiza
   - Crea nuevas si no existen
   - Actualiza existentes
   ↓
3. Resultado: Estado completamente sincronizado
   - Frontend y Backend = mismo estado
```

### Al Login (Cargar desde Backend)

```
1. Usuario inicia sesión
   ↓
2. Frontend: GET /stock-reservations/my-reservations
   ↓
3. Backend: Retorna todas las reservas activas del usuario
   ↓
4. Frontend: Carga en localStorage
   - Restaura estado del carrito
   - Sincroniza con UI
```

---

## 🛡️ Casos de Uso Cubiertos

### ✅ Caso 1: Usuario Agrega al Carrito (Online)
```
Usuario A:  Agrega 5 unidades
    ↓
Backend: Stock se reduce en BD
    ↓
Usuario B: Refresca página → Ve stock actualizado
```

### ✅ Caso 2: Usuario Agrega Offline
```
Usuario A:  Sin internet → Agrega al carrito
    ↓
Frontend: Guarda en localStorage
    ↓
Usuario A: Vuelve online
    ↓
Frontend: Sincroniza automáticamente cada 5 min
    ↓
Backend: Procesa la reserva
```

### ✅ Caso 3: Checkout con Stock Cambiado
```
Usuario A:  Agrega 10 unidades
    ↓
Usuario B:  Compra ese mismo producto
    ↓
Backend: Stock total reducido
    ↓
Usuario A:  Intenta checkout
    ↓
Frontend: Valida contra backend
    ↓
"Solo hay 5 disponibles" ✅ (Error correcto)
```

### ✅ Caso 4: Múltiples Pestañas Mismo Usuario
```
Pestaña 1:  Agrega producto X
    ↓
localStorage: Se actualiza
    ↓
Pestaña 2:  Ve cambio en localStorage
    ↓
Ambas sincronizadas automáticamente
```

---

## 📊 Arquitectura de Datos

### Base de Datos (Backend)
```
StockReservation (Tabla)
├── id (String UUID)
├── product_id (FK → Products)
├── user_id (FK → Users)
├── session_id (String)
├── quantity (Integer)
├── expires_at (Timestamp)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

### Local Storage (Frontend)
```json
{
  "stock_reservations": {
    "5": {
      "quantity": 3,
      "expiresAt": 1764265209000,
      "backendId": "res-123",
      "timerId": 12345
    }
  }
}
```

---

## 🔐 Seguridad

1. **Validación en Backend**: El frontend puede mentir, pero el backend valida todo
2. **JWT Authentication**: Solo usuarios autenticados pueden hacer reservas
3. **Límites por Usuario**: No se puede reservar más de 10 unidades (validado en backend)
4. **Expiración Real**: Después de 14 días, la BD limpia automáticamente
5. **Transacciones ACID**: La creación de órdenes valida stock en tiempo real

---

## 🚀 Mejoras Implementadas

### Stock Sync Service
- ✅ Sincronización bidireccional
- ✅ Resolución de conflictos (backend gana)
- ✅ Manejo de errores robusto
- ✅ Reintentos automáticos
- ✅ Fallback a local

### UI/UX
- ✅ Actualización instantánea local
- ✅ Sin latencia aparente
- ✅ Funciona offline
- ✅ Se sincroniza cuando hay conexión
- ✅ Errores claros si stock insuficiente

### Backend
- ✅ Endpoints de sincronización
- ✅ Validación de stock real
- ✅ Persistencia en BD
- ✅ Multi-usuario soportado
- ✅ Limpieza de expirados

---

## 📋 Checklist de Integración

- [x] `stockReservationService.js` mejorado con sincronización
- [x] Frontend intenta sincronizar con backend
- [x] Endpoint `/api/stock-reservations/my-reservations` agregado
- [x] Endpoint `/api/stock-reservations/sync` agregado
- [x] Manejo de errores y fallback a local
- [x] Sincronización periódica cada 5 minutos
- [x] Carga desde backend al login
- [ ] Tests unitarios para sincronización
- [ ] Tests de integración frontend-backend
- [ ] Monitoreo de sincronización fallida

---

## 🧪 Cómo Probar

### Test 1: Sincronización Básica
1. Abrir DevTools → Application → Storage
2. Agregar producto al carrito
3. Ver en `stock_reservations` que se guardó
4. Esperar 5 segundos
5. Verificar en Network que se envió POST a `/stock-reservations/sync`

### Test 2: Multi-Usuario
1. Abrir aplicación en 2 navegadores
2. Usuario A: Agregar producto
3. Usuario B: Refrescar página
4. Usuario B debe ver stock actualizado

### Test 3: Offline Mode
1. Abrir DevTools → Network → Offline
2. Agregar producto
3. Debe guardarse localmente ✅
4. Volver a Online
5. Debe sincronizar automáticamente

### Test 4: Checkout Validado
1. Usuario A: Agregar 10 unidades
2. Usuario B: Comprar todas las unidades
3. Usuario A: Intentar checkout
4. Debe mostrar error de stock ✅

---

## 🔮 Futuro

- [ ] WebSocket para sync en tiempo real
- [ ] Notificaciones de cambios de stock
- [ ] Carrito persistente en backend
- [ ] Recomendaciones basadas en historial
- [ ] Analytics de productos más vendidos
