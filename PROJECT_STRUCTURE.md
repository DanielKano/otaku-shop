# 📁 Estructura del Proyecto - Sistema de Reservas

## Directorios Relevantes

```
frontend/
├── src/
│   ├── components/
│   │   ├── cart/
│   │   │   ├── CartItem.jsx              ✨ ACTUALIZADO
│   │   │   ├── CartList.jsx
│   │   │   ├── CartSummary.jsx
│   │   │   └── ReservationExpirationMonitor.jsx  🆕 NUEVO
│   │   │
│   │   ├── checkout/
│   │   │   └── CheckoutSummary.jsx       🆕 NUEVO
│   │   │
│   │   └── ui/
│   │       └── Alert.jsx                 (asumido existente)
│   │
│   ├── context/
│   │   ├── CartContext.jsx               ✨ ACTUALIZADO
│   │   ├── NotificationContext.jsx       (asumido existente)
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useCartValidations.js         🆕 NUEVO
│   │   ├── useStockReservation.js        ✨ ACTUALIZADO
│   │   └── ...
│   │
│   ├── services/
│   │   ├── stockReservationService.js    ✨ ACTUALIZADO
│   │   └── ...
│   │
│   ├── pages/
│   │   └── CartPage.jsx                  (ver INTEGRATION_EXAMPLES.md)
│   │
│   └── App.jsx                            (necesita ReservationExpirationMonitor)
│
└── Documentación
    ├── STOCK_RESERVATION_SYSTEM.md       🆕 NUEVO
    ├── INTEGRATION_EXAMPLES.md            🆕 NUEVO
    ├── IMPLEMENTATION_SUMMARY.md          🆕 NUEVO
    └── NOTIFICATIONS_REFERENCE.md         🆕 NUEVO
```

---

## Archivos Modificados Detallados

### 1. `context/CartContext.jsx` ✨

**Cambios:**
- Agregada validación de máximo 10 unidades
- Agregada validación de stock disponible
- Integración completa con `stockReservationService`
- Métodos mejorados: `addItem()`, `updateQuantity()`, `removeItem()`
- Nuevo método: `validateCheckout()`
- Notificaciones contextuales

**Nuevas funciones:**
```javascript
const validateAddQuantity = () {}      // Valida antes de agregar
const addItem = () {}                  // Mejorado con validaciones
const removeItem = () {}               // Libera reservas
const updateQuantity = () {}           // Valida aumentos/reducciones
const validateCheckout = () {}         // Valida para pago
```

---

### 2. `services/stockReservationService.js` ✨

**Cambios:**
- Duración de reserva: `15 minutos` → `14 días`
  ```javascript
  // Antes
  const RESERVATION_DURATION = 15 * 60 * 1000;
  
  // Ahora
  const RESERVATION_DURATION = 14 * 24 * 60 * 60 * 1000;
  ```

**Funciones existentes (sin cambios):**
- `reserveStock()`, `updateReservation()`, `releaseReservation()`
- `getReservationInfo()`, `getAvailableStock()`, etc.

---

### 3. `hooks/useStockReservation.js` ✨

**Cambios:**
- Agregada constante `MAX_UNITS_PER_PRODUCT = 10`
- Nuevo método: `validateReservation(quantity, currentQuantity)`
- Nuevo método: `getTimeRemaining()`
- Mejorado: `useAllReservations` con `cleanupExpiredReservations()`

**Nuevas funciones:**
```javascript
const validateReservation = (quantity, currentQuantity) => {}
const getTimeRemaining = () => {}
const cleanupExpiredReservations = () => {}
```

---

### 4. `components/cart/CartItem.jsx` ✨

**Cambios:**
- Importación de `useCartValidations` hook
- Muestra tiempo restante de reserva: `🔒 Reservado por 13d 18h`
- Muestra stock disponible: `📦 Stock disponible: 15/50 unidades`
- Advertencia de límite 10 unidades
- Advertencia si vence en < 6 horas: `⏰ ¡Reserva vence en menos de 6 horas!`
- Botón de cantidad con lógica mejorada

**Nuevos indicadores:**
```jsx
{timeRemaining && (
  <p>🔒 Reservado por {timeRemaining.days}d {timeRemaining.hours}h</p>
)}
{stockInfo && (
  <p>📦 Stock disponible: {stockInfo.available}/{stockInfo.totalStock}</p>
)}
```

---

## Archivos Nuevos Creados

### 1. `hooks/useCartValidations.js` 🆕

**Propósito:** Hook centralizado para validaciones del carrito

**Exporta:**
```javascript
useCartValidations() → {
  validateAddQuantity(),
  validateUpdateQuantity(),
  getStockInfo(),
  isReservationExpired(),
  getReservationTimeRemaining(),
  validateCheckoutSummary(),
  MAX_UNITS_PER_PRODUCT,
  RESERVATION_DURATION_DAYS
}
```

**Uso:**
```jsx
const { validateAddQuantity } = useCartValidations()
const validation = validateAddQuantity(product, quantity)
```

---

### 2. `components/checkout/CheckoutSummary.jsx` 🆕

**Propósito:** Componente de resumen y validación antes del pago

**Props:**
```javascript
{
  onCheckout: async () => void,  // Callback para procesar pago
  isLoading?: boolean             // Estado de carga
}
```

**Features:**
- ✓ Validación final de stock
- ✓ Muestra resumen de compra
- ✓ Muestra errores y advertencias
- ✓ Botón de pago (habilitado/deshabilitado)
- ✓ Información de protección

**Uso:**
```jsx
<CheckoutSummary 
  onCheckout={async () => {
    // Procesar pago
  }}
/>
```

---

### 3. `components/cart/ReservationExpirationMonitor.jsx` 🆕

**Propósito:** Monitorea y limpia automáticamente reservas expiradas

**Features:**
- ✓ Sin UI (componente invisible)
- ✓ Monitoreo cada minuto
- ✓ Evento global `reservation_expired`
- ✓ Notificación automática al usuario
- ✓ Limpieza de carrito

**Uso (en App.jsx):**
```jsx
<CartProvider>
  <ReservationExpirationMonitor />
  {/* Tu app */}
</CartProvider>
```

---

### 4. Documentación 🆕

| Archivo | Propósito |
|---------|-----------|
| `STOCK_RESERVATION_SYSTEM.md` | Sistema completo documentado con flujos y ejemplos |
| `INTEGRATION_EXAMPLES.md` | Ejemplos de código listos para copiar-pegar |
| `IMPLEMENTATION_SUMMARY.md` | Resumen de lo implementado con checklist |
| `NOTIFICATIONS_REFERENCE.md` | Todas las notificaciones con diseño visual |

---

## Imports Necesarios

### En `App.jsx`
```javascript
import { CartProvider } from './context/CartContext'
import ReservationExpirationMonitor from './components/cart/ReservationExpirationMonitor'
```

### En CartPage
```javascript
import CartItem from './components/cart/CartItem'
import CheckoutSummary from './components/checkout/CheckoutSummary'
import { useContext } from 'react'
import { CartContext } from './context/CartContext'
```

### En Componentes de Producto
```javascript
import { useContext } from 'react'
import { CartContext } from './context/CartContext'
import useCartValidations from './hooks/useCartValidations'
```

---

## localStorage Schema

### Clave: `stock_reservations`

```json
{
  "1": {
    "quantity": 3,
    "expiresAt": 1735689600000
  },
  "5": {
    "quantity": 1,
    "expiresAt": 1735776000000
  }
}
```

- **productId** (key): número de identificación del producto
- **quantity**: unidades reservadas
- **expiresAt**: timestamp de expiración en milisegundos

---

## Context API Schema

### CartContext Value

```javascript
{
  items: Array<{
    id: number,
    name: string,
    quantity: number,
    price: number,
    stock: number,
    category: string,
    image?: string,
    reservedAt?: Date,     // Nueva
    expiresAt?: Date       // Nueva
  }>,
  total: number,           // Suma de (price * quantity)
  itemCount: number,       // Cantidad de items en carrito
  
  // Métodos
  addItem: (product, quantity) => void,
  removeItem: (productId) => void,
  updateQuantity: (productId, quantity) => void,
  clearCart: () => void,
  validateCheckout: () => {
    allValid: boolean,
    details: Array<{
      id, name, hasEnoughStock,
      reserved, requested, available
    }>
  }
}
```

---

## Hook Validations Schema

### useCartValidations

```javascript
{
  validateAddQuantity: (product, quantity) => {
    valid: boolean,
    error?: string,
    type?: 'warning' | 'error'
  },
  
  validateUpdateQuantity: (productId, newQuantity) => {
    valid: boolean,
    message?: string,
    type?: 'success' | 'info' | 'warning' | 'error'
  },
  
  getStockInfo: (productId) => {
    totalStock: number,
    reserved: number,
    available: number,
    isLowStock: boolean
  },
  
  validateCheckoutSummary: () => {
    isValid: boolean,
    errors: string[],
    warnings: string[],
    totalItems: number
  },
  
  MAX_UNITS_PER_PRODUCT: 10,
  RESERVATION_DURATION_DAYS: 14
}
```

---

## Notificación Service Schema

Asumiendo que existe `NotificationContext`:

```javascript
addNotification?.({
  message: string,        // Texto de la notificación
  type: 'success' | 'warning' | 'error' | 'info',
  duration?: number,      // Milisegundos antes de auto-cerrar
  dismissible?: boolean   // Permite cerrar manualmente
})
```

---

## Configuración Recomendada

### En `App.jsx`
```javascript
// ✅ Correcto
<NotificationProvider>
  <CartProvider>
    <ReservationExpirationMonitor />
    <Router />
  </CartProvider>
</NotificationProvider>

// ❌ Incorrecto
<CartProvider>
  <ReservationExpirationMonitor />  // Necesita CartContext
  <NotificationProvider>
    <Router />
  </NotificationProvider>
</CartProvider>
```

---

## Requerimientos Externos

Estos componentes asumen que existen:

```javascript
// UI Components
import Alert from '../ui/Alert'        // Componente de alerta
import Button from '../ui/Button'      // Componente de botón
import Modal from '../ui/Modal'        // (para otros usos)

// Context
import { NotificationContext } from '../context/NotificationContext'  // Notificaciones

// Services
import stockReservationService from '../services/stockReservationService'
```

---

## Testing Checklist

- [ ] `CartContext` - Validaciones de cantidad
- [ ] `CartContext` - Validaciones de stock
- [ ] `CartContext` - Integración con stockReservationService
- [ ] `useCartValidations` - Todas las validaciones
- [ ] `CheckoutSummary` - Validación final
- [ ] `ReservationExpirationMonitor` - Limpieza automática
- [ ] `CartItem` - Mostrar información de reserva
- [ ] Notificaciones - Todos los casos

---

## Performance Considerations

1. **useMemo** en `CartItem` para cálculos costosos
2. **useCallback** en contexto para evitar re-renders
3. **localStorage** para persistencia sin servidor
4. **setInterval** cada minuto (no demasiado frecuente)
5. **Cleanup** de timers en useEffect

---

## Roadmap para Producción

1. [ ] Validar en backend también
2. [ ] Persistir reservas en base de datos
3. [ ] Email de recordatorio
4. [ ] Renovación automática de reservas
5. [ ] Analytics de abandonos
6. [ ] Sistema de espera (waitlist)
7. [ ] Notificaciones push

