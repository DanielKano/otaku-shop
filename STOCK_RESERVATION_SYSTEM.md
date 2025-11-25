# 🛒 Sistema de Gestión de Stock Reservado

## 📋 Resumen

Sistema completo de reservas de stock en el carrito con validaciones, expiración automática después de 14 días, y notificaciones en tiempo real.

---

## 🎯 Requisitos Implementados

### ✅ 1. Cuando un usuario agrega un producto al carrito
- ✓ Verificar si el usuario ya tiene ese producto en el carrito
- ✓ Sumar la cantidad actual más la nueva cantidad solicitada
- ✓ Validar máximo 10 unidades por producto
- ✓ Validar stock disponible (total - reservado)
- ✓ Registrar en stockReservationService
- ✓ Guardar fecha de expiración (14 días)
- ✓ Mostrar notificación de éxito

### ✅ 2. Cuando el usuario modifica la cantidad en el carrito
- ✓ Validar que no exceda 10 unidades
- ✓ Validar stock disponible para aumentos
- ✓ Liberar stock automáticamente si reduce cantidad
- ✓ Mostrar notificaciones contextuales

### ✅ 3. Cuando el usuario elimina un producto del carrito
- ✓ Restar del stock reservado
- ✓ Devolver stock al inventario
- ✓ Mostrar notificación de eliminación

### ✅ 4. Cuando llega la fecha de expiración (14 días)
- ✓ Revisar items con reserva vencida
- ✓ Eliminar automáticamente del carrito
- ✓ Restar del stock reservado
- ✓ Notificar al usuario

### ✅ 5. Cuando el usuario procede al pago
- ✓ Validar nuevamente stock reservado
- ✓ Verificar que las reservas sigan activas
- ✓ Mostrar mensaje de confirmación

---

## 🏗️ Estructura de Archivos

### Contextos
```
CartContext.jsx
├── addItem()           - Agrega producto con validaciones
├── removeItem()        - Elimina producto y libera reserva
├── updateQuantity()    - Actualiza cantidad con validaciones
├── validateCheckout()  - Valida stock antes del pago
└── clearCart()         - Limpia todas las reservas
```

### Hooks
```
useCartValidations.js
├── validateAddQuantity()          - Valida adición de productos
├── validateUpdateQuantity()       - Valida cambios de cantidad
├── getStockInfo()                 - Obtiene info de stock
├── getReservationTimeRemaining()  - Obtiene tiempo restante
└── validateCheckoutSummary()      - Valida resumen de compra

useStockReservation.js
├── validateReservation()          - Valida nueva reserva
├── getTimeRemaining()             - Obtiene tiempo restante
└── cleanupExpiredReservations()   - Limpia expiradas
```

### Servicios
```
stockReservationService.js
├── reserveStock()                 - Crea reserva (14 días)
├── updateReservation()            - Actualiza cantidad
├── releaseReservation()           - Libera reserva
├── getReservationInfo()           - Obtiene info de reserva
├── getAvailableStock()            - Calcula stock disponible
└── getReservedQuantity()          - Obtiene cantidad reservada
```

### Componentes
```
CartItem.jsx
├── Muestra tiempo restante de reserva
├── Muestra stock disponible
├── Valida límite de 10 unidades
└── Muestra advertencias de expiración

CheckoutSummary.jsx
├── Valida stock antes del pago
├── Muestra resumen de compra
├── Notifica errores y advertencias
└── Maneja confirmación de compra

ReservationExpirationMonitor.jsx
├── Monitorea reservas activas
├── Elimina automáticamente las expiradas
└── Notifica al usuario de expiración
```

---

## 📖 Ejemplo de Integración

### 1. En tu Layout Principal
```jsx
import ReservationExpirationMonitor from './components/cart/ReservationExpirationMonitor'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <ReservationExpirationMonitor />
      {/* Tu contenido */}
    </CartProvider>
  )
}
```

### 2. En tu Página de Carrito
```jsx
import CartList from './components/cart/CartList'
import CartItem from './components/cart/CartItem'
import CheckoutSummary from './components/checkout/CheckoutSummary'
import { useContext } from 'react'
import { CartContext } from './context/CartContext'

function CartPage() {
  const { items, updateQuantity, removeItem } = useContext(CartContext)

  const handleCheckout = async () => {
    // Procesar pago
    console.log('Procesando pago...')
  }

  return (
    <div>
      <h1>Mi Carrito</h1>
      
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onQuantityChange={updateQuantity}
          onRemove={removeItem}
        />
      ))}

      <CheckoutSummary onCheckout={handleCheckout} />
    </div>
  )
}
```

### 3. En Componentes de Productos
```jsx
import { useContext } from 'react'
import { CartContext } from './context/CartContext'
import useCartValidations from './hooks/useCartValidations'

function ProductCard({ product }) {
  const { addItem } = useContext(CartContext)
  const { validateAddQuantity } = useCartValidations()

  const handleAddToCart = (quantity = 1) => {
    const validation = validateAddQuantity(product, quantity)
    
    if (!validation.valid) {
      // El error ya se mostrará como notificación en CartContext
      return
    }

    addItem(product, quantity)
  }

  return (
    <button onClick={() => handleAddToCart(1)}>
      Agregar al carrito
    </button>
  )
}
```

---

## 🔄 Flujo de Datos

### Agregar Producto
```
ProductCard
  ↓ handleAddToCart()
  ↓ CartContext.addItem()
  ├─→ Validar (máx 10, stock disponible)
  ├─→ stockReservationService.reserveStock()
  ├─→ Guardar en localStorage
  └─→ Notificación al usuario
```

### Modificar Cantidad
```
CartItem
  ↓ onQuantityChange()
  ↓ CartContext.updateQuantity()
  ├─→ Validar límite y stock
  ├─→ stockReservationService.updateReservation()
  ├─→ Actualizar localStorage
  └─→ Notificación contexual
```

### Eliminar Producto
```
CartItem
  ↓ onRemove()
  ↓ CartContext.removeItem()
  ├─→ stockReservationService.releaseReservation()
  ├─→ Actualizar localStorage
  └─→ Notificación de liberación
```

### Checkout
```
CheckoutSummary
  ↓ handleCheckout()
  ├─→ CartContext.validateCheckout()
  ├─→ useCartValidations.validateCheckoutSummary()
  ├─→ Verificar todas las reservas
  ├─→ onCheckout() - Procesar pago
  └─→ Notificación de éxito/error
```

### Expiración (Automático)
```
ReservationExpirationMonitor
  ↓ useEffect (chequea cada minuto)
  ├─→ stockReservationService.getReservationInfo()
  ├─→ Si expiró:
  │   ├─→ CartContext.removeItem()
  │   └─→ Notificación de expiración
  └─→ window.addEventListener('reservation_expired')
```

---

## 🎨 Notificaciones

### Éxito - Agregación
```
✅ Producto reservado durante 14 días. Completa la compra para asegurar tu unidad.
```

### Éxito - Cantidad aumentada
```
✅ Cantidad actualizada y reserva ampliada. Nueva cantidad: 5 unidades.
```

### Información - Cantidad reducida
```
ℹ️ Cantidad reducida. La reserva liberada vuelve al inventario.
```

### Información - Eliminación
```
ℹ️ Producto eliminado del carrito. La reserva fue liberada y el stock volvió al inventario.
```

### Advertencia - Límite de 10 unidades
```
⚠️ Solo puedes reservar hasta 10 unidades de este producto.
```

### Error - Stock insuficiente
```
❌ No hay suficiente stock disponible en este momento.
```

### Advertencia - Expiración inminente
```
⏰ ¡Reserva vence en menos de 6 horas!
```

### Advertencia - Expiración ocurrida
```
⏰ Tu reserva de "Producto X" ha expirado. El producto volvió al inventario público.
```

### Éxito - Compra completada
```
✅ Compra completada. Tu producto ahora está totalmente asegurado.
```

---

## ⚙️ Configuración

### Duración de Reserva
Archivo: `stockReservationService.js`
```javascript
const RESERVATION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 días
```

Para cambiar a otro valor:
```javascript
// 7 días
const RESERVATION_DURATION = 7 * 24 * 60 * 60 * 1000;

// 30 días
const RESERVATION_DURATION = 30 * 24 * 60 * 60 * 1000;
```

### Máximo de Unidades
Archivo: `CartContext.jsx` y `useCartValidations.js`
```javascript
const MAX_UNITS_PER_PRODUCT = 10
```

---

## 🧪 Testing

### Test: Agregar producto
```javascript
test('debería agregar un producto reservando stock por 14 días', () => {
  // El producto se agrega al carrito
  // Se crea una reserva en stockReservationService
  // Se muestra notificación de éxito
})
```

### Test: Validar máximo de unidades
```javascript
test('no debería permitir agregar más de 10 unidades', () => {
  // Intenta agregar 11 unidades
  // Recibe notificación de error
  // El producto se agrega con máximo 10
})
```

### Test: Validar stock disponible
```javascript
test('no debería permitir agregar si no hay stock disponible', () => {
  // Intenta agregar más unidades de las disponibles
  // Recibe error: "No hay suficiente stock disponible"
})
```

---

## 🔐 Seguridad

- Las reservas se guardan en localStorage para persistencia
- Se valida stock disponible en cada operación
- Se verifica nuevamente antes del checkout
- Las reservas expiran automáticamente después de 14 días
- El sistema es resiliente a refrescos de página

---

## 📱 Responsive

Todos los componentes son 100% responsivos:
- `CartItem` - Adaptable a móvil
- `CheckoutSummary` - Boton full-width en móvil
- `ReservationExpirationMonitor` - Sin UI, solo lógica

---

## 🚀 Próximas Mejoras

- [ ] Integración con backend para persistencia real
- [ ] Email de recordatorio antes de expiración
- [ ] Renovación automática de reservas
- [ ] Analytics de abandonos de carrito
- [ ] Sistema de espera (waitlist) si hay stock limitado

