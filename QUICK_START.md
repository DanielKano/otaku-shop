# 🚀 Guía Rápida - Sistema de Reservas de Stock

## 5 Pasos para Integrar el Sistema

### 1️⃣ Agregar ReservationExpirationMonitor en App.jsx

```jsx
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import ReservationExpirationMonitor from './components/cart/ReservationExpirationMonitor'

function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <ReservationExpirationMonitor />  {/* ← Agrega esta línea */}
        {/* Tu aplicación */}
      </CartProvider>
    </NotificationProvider>
  )
}
```

**¿Por qué?** Monitorea automáticamente reservas expiradas cada minuto.

---

### 2️⃣ Actualizar tu CartPage

```jsx
import CheckoutSummary from './components/checkout/CheckoutSummary'

function CartPage() {
  const { items, updateQuantity, removeItem } = useContext(CartContext)

  const handleCheckout = async () => {
    // Tu lógica de pago aquí
    // Las validaciones ya se hacen en CheckoutSummary
  }

  return (
    <div>
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

**¿Por qué?** `CheckoutSummary` valida stock antes del pago.

---

### 3️⃣ El Resto... ¡Ya Está Hecho! ✨

Los siguientes archivos ya están actualizados:
- ✅ `CartContext.jsx` - Validaciones automáticas
- ✅ `CartItem.jsx` - Muestra info de reserva
- ✅ `useStockReservation.js` - Nuevos métodos
- ✅ `stockReservationService.js` - Duración = 14 días
- ✅ `useCartValidations.js` - Hook de validaciones (NUEVO)
- ✅ `CheckoutSummary.jsx` - Validación final (NUEVO)
- ✅ `ReservationExpirationMonitor.jsx` - Limpieza automática (NUEVO)

---

## 🎯 Flujo en Minutos

### Usuario Agrega Producto
```
1. Click "Agregar al carrito"
2. CartContext.addItem() valida:
   - ¿Cantidad total ≤ 10? ✓
   - ¿Stock disponible? ✓
3. stockReservationService.reserveStock(14 días)
4. ✅ Notificación: "Producto reservado durante 14 días..."
```

### Usuario Ve el Carrito
```
1. CartItem muestra:
   - 🔒 Reservado por 13d 18h
   - 📦 Stock disponible: 15/50
   - ⏰ ¡Vence en < 6h! (si aplica)
2. Usuario puede cambiar cantidad
3. CartContext.updateQuantity() valida nuevamente
```

### Usuario Procede al Pago
```
1. Click "Completar compra"
2. CheckoutSummary valida:
   - ¿Reservas siguen activas?
   - ¿Stock sigue disponible?
3. Si ✅: Mostrar resumen, habilitar pago
4. Si ❌: Mostrar errores, deshabilitar botón
```

### 14 Días Pasan (Automático)
```
1. ReservationExpirationMonitor detecta expiración
2. Elimina producto del carrito automáticamente
3. ⏰ Notificación: "Tu reserva expiró..."
4. Stock disponible vuelve al inventario
5. Sin intervención del usuario
```

---

## 💬 Notificaciones Clave

| Acción | Notificación |
|--------|--------------|
| Agregar producto | ✅ "Producto reservado durante 14 días" |
| Exceder 10 unidades | ⚠️ "Solo puedes reservar hasta 10 unidades" |
| Sin stock | ❌ "No hay suficiente stock disponible" |
| Aumentar cantidad | ✅ "Cantidad actualizada y reserva ampliada" |
| Reducir cantidad | ℹ️ "Cantidad reducida. Reserva liberada" |
| Eliminar | ℹ️ "Producto eliminado. Reserva liberada" |
| Reserva < 6h | ⏰ "¡Reserva vence en menos de 6 horas!" |
| Reserva expira | ⏰ "Tu reserva expiró. Volvió al inventario" |
| Pago válido | ✅ "Compra completada. Producto asegurado" |
| Pago inválido | ❌ "Error: No hay suficiente stock" |

---

## 📊 Estados del Carrito

### Item con Reserva Activa
```javascript
{
  id: 1,
  name: "Manga One Piece Vol. 15",
  quantity: 3,
  price: 15.99,
  stock: 50,
  reservedAt: Date,
  expiresAt: Date  // 14 días desde ahora
}
```

### Stock Disponible = Total - Reservado
```javascript
totalStock = 50
reservedByMe = 3
otherReservations = 10
availableStock = 50 - (3 + 10) = 37
// El usuario puede agregar hasta 7 más
```

---

## ⚙️ Configuración Personalizable

### Cambiar Duración de Reserva
En `stockReservationService.js`:
```javascript
// De 14 días a 7 días
const RESERVATION_DURATION = 7 * 24 * 60 * 60 * 1000;

// De 14 días a 30 días
const RESERVATION_DURATION = 30 * 24 * 60 * 60 * 1000;
```

### Cambiar Límite de Unidades
En `CartContext.jsx` y `useCartValidations.js`:
```javascript
// De 10 a 5 unidades máximo
const MAX_UNITS_PER_PRODUCT = 5;
```

---

## 🔍 Debugging

### Ver todas las reservas activas
```javascript
import stockReservationService from './services/stockReservationService'

const allReservations = stockReservationService.getAllReservations()
console.log(allReservations)
```

### Ver reserva específica
```javascript
const reservation = stockReservationService.getReservationInfo(productId)
console.log(reservation)  // { quantity, expiresAt, expiresIn, remainingMinutes }
```

### Ver stock disponible
```javascript
const available = stockReservationService.getAvailableStock(productId, totalStock)
console.log(`Disponible: ${available}/${totalStock}`)
```

### Limpiar todas las reservas (útil para testing)
```javascript
stockReservationService.clearAllReservations()
```

---

## ✅ Checklist Pre-Producción

- [ ] ReservationExpirationMonitor está en App.jsx
- [ ] CheckoutSummary está en CartPage
- [ ] CartItem muestra información de reserva
- [ ] Probado: Agregar producto → Notificación
- [ ] Probado: Modificar cantidad → Validación
- [ ] Probado: Eliminar producto → Stock liberado
- [ ] Probado: Checkout válido → Pago habilitado
- [ ] Probado: Checkout inválido → Pago deshabilitado
- [ ] Probado: Recarga de página → Reservas persisten
- [ ] Probado: 14 días → Producto se elimina (o simula con menos tiempo)
- [ ] Backend: Validar stock en el servidor también
- [ ] Backend: Guardar reservas en base de datos

---

## 🐛 Problemas Comunes

### Notificaciones no aparecen
```
✓ Verificar que NotificationProvider está en App.jsx
✓ Verificar que CartProvider está adentro de NotificationProvider
✓ Verificar que el componente de notificación existe (Alert)
```

### Reservas se pierden al recargar
```
✓ Verificar que localStorage está habilitado
✓ Ver console.log en stockReservationService.loadReservations()
✓ Verificar que no hay errores de JSON.parse()
```

### Stock no se actualiza
```
✓ Verificar que useCartValidations.getStockInfo() se está usando
✓ Verificar que CartItem usa useMemo() para stockInfo
✓ Verificar que stockReservationService actualiza localStorage
```

### Componente se renderiza demasiado
```
✓ Verificar que CartItem usa useMemo()
✓ Verificar que CartContext usa useCallback()
✓ Usar React DevTools Profiler para medir renders
```

---

## 🧪 Testing Rapido

### Test 1: Agregar > 10 unidades
```javascript
// Intenta agregar 11 unidades
addItem(product, 11)
// Resultado: Solo se agregan 10, notificación de error
```

### Test 2: Stock limitado
```javascript
// Producto con stock = 5
// Intenta agregar 6
addItem(product, 6)
// Resultado: Solo se agregan 5, notificación de error
```

### Test 3: Múltiples items
```javascript
// Agregar 3 items diferentes al carrito
// Modificar cantidad de cada uno
// Eliminar uno
// Resultado: Cada validación funciona independientemente
```

### Test 4: Checkout
```javascript
// Carrito con items válidos
// Click en "Completar compra"
// Resultado: Button habilitado, resumen correcto
```

### Test 5: Expiración (simulada)
```javascript
// Cambiar RESERVATION_DURATION a 1 segundo para testing
// Agregar producto
// Esperar 2 segundos
// Resultado: Producto se elimina automáticamente del carrito
```

---

## 📚 Documentación Completa

- `STOCK_RESERVATION_SYSTEM.md` - Sistema detallado
- `INTEGRATION_EXAMPLES.md` - Ejemplos de código
- `IMPLEMENTATION_SUMMARY.md` - Checklist completo
- `NOTIFICATIONS_REFERENCE.md` - Todas las notificaciones
- `PROJECT_STRUCTURE.md` - Estructura de carpetas

---

## 🎉 ¡Listo!

Tu sistema de reservas de stock está completamente implementado y listo para usar.

**Próximos pasos:**
1. Integra `ReservationExpirationMonitor` en tu App.jsx
2. Actualiza tu CartPage con `CheckoutSummary`
3. Prueba el flujo completo
4. ¡Disfruta de las notificaciones automáticas! 🚀

