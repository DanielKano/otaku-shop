# ⚡ REFERENCIA RÁPIDA - Sistema de Reservas

## 🎯 Cheat Sheet Rápido

### Integración (2 pasos - 2 minutos)

```jsx
// 1. App.jsx
import ReservationExpirationMonitor from './components/cart/ReservationExpirationMonitor'

<CartProvider>
  <ReservationExpirationMonitor />
</CartProvider>

// 2. CartPage
import CheckoutSummary from './components/checkout/CheckoutSummary'
<CheckoutSummary onCheckout={handleCheckout} />
```

---

## 📂 Dónde Está Cada Cosa

| Funcionalidad | Archivo | Línea/Método |
|---------------|---------|-------------|
| Validar agregar | CartContext.jsx | `validateAddQuantity()` |
| Agregar al carrito | CartContext.jsx | `addItem()` |
| Modificar cantidad | CartContext.jsx | `updateQuantity()` |
| Eliminar producto | CartContext.jsx | `removeItem()` |
| Validar pago | CartContext.jsx | `validateCheckout()` |
| Información de stock | useCartValidations.js | `getStockInfo()` |
| Tiempo restante | useStockReservation.js | `getTimeRemaining()` |
| Expiración auto | ReservationExpirationMonitor.jsx | useEffect |
| Resumen y pago | CheckoutSummary.jsx | Componente |
| Mostrar reserva | CartItem.jsx | Línea 30+ |

---

## 🔧 Configurar en 10 Segundos

```javascript
// Duración de reserva (línea 6 en stockReservationService.js)
14 * 24 * 60 * 60 * 1000    // 14 días
7 * 24 * 60 * 60 * 1000     // 7 días
1 * 24 * 60 * 60 * 1000     // 1 día
1 * 60 * 60 * 1000          // 1 hora (testing)
60 * 1000                    // 1 minuto (testing)

// Máximo de unidades (en 3 archivos)
const MAX_UNITS_PER_PRODUCT = 10;   // cambiar a 20, 50, etc.
```

---

## 📋 Checklist de Integración

```
□ 1. Crear CartProvider en App.jsx
□ 2. Agregar ReservationExpirationMonitor dentro de CartProvider
□ 3. Verificar que NotificationContext existe
□ 4. Copiar CheckoutSummary en CartPage
□ 5. Pasar onCheckout callback
□ 6. Probar agregar producto
□ 7. Probar modificar cantidad
□ 8. Probar eliminar producto
□ 9. Probar expiración (cambiar tiempo a 10 segundos)
□ 10. Probar checkout
□ 11. Probar persistencia (F5 recarga)
□ 12. Leer QUICK_START.md para debugging
```

---

## 💬 Notificaciones - Referencia Rápida

### Éxito (Verde - ✅)
```
"Producto reservado durante 14 días..."
"Cantidad actualizada y reserva ampliada..."
"Compra completada. Producto asegurado..."
```

### Advertencia (Amarillo - ⚠️)
```
"Solo puedes reservar hasta 10 unidades..."
"No puedes reservar más de 10 unidades..."
"¡Reserva vence en menos de 6 horas!..."
```

### Error (Rojo - ❌)
```
"No hay suficiente stock disponible..."
"No hay suficiente stock para aumentar..."
```

### Información (Azul - ℹ️)
```
"Cantidad reducida. Reserva liberada..."
"Producto eliminado. Reserva liberada..."
"Tu reserva expiró. Volvió al inventario..."
```

---

## 🧪 Testing en 5 Minutos

### Test 1: Agregar producto
```
1. Ir a producto
2. Agregar 5 unidades
3. Verificar notificación verde
4. Verificar carrito muestra producto
5. Verificar localStorage tiene entrada
```

### Test 2: Límite de 10
```
1. Carrito vacío
2. Agregar 6 unidades
3. Intentar agregar 5 más
4. Debería mostrar error: "Solo puedes reservar hasta 10"
5. Carrito sigue con 6 unidades
```

### Test 3: Stock insuficiente
```
1. Producto con 3 unidades disponibles
2. Intentar agregar 5
3. Debería mostrar error: "No hay suficiente stock"
4. Carrito permanece sin cambios
```

### Test 4: Eliminar producto
```
1. Agregar producto
2. Clic en eliminar
3. Verificar notificación: "Producto eliminado. Reserva liberada"
4. Verificar carrito vacío
5. Verificar localStorage borró entrada
```

### Test 5: Modificar cantidad (aumento)
```
1. Agregar 3 unidades
2. Cambiar a 5 unidades
3. Verificar notificación: "Cantidad actualizada"
4. Verificar stock disponible disminuyó
```

### Test 6: Modificar cantidad (disminución)
```
1. Agregar 5 unidades
2. Cambiar a 2 unidades
3. Verificar notificación: "Cantidad reducida"
4. Verificar stock disponible aumentó
```

### Test 7: Expiración automática (rápido)
```
1. Cambiar RESERVATION_DURATION a 1 minuto
2. Agregar producto
3. Esperar 1 minuto
4. Verificar producto se eliminó automáticamente
5. Verificar notificación: "Tu reserva expiró"
6. Cambiar RESERVATION_DURATION de vuelta a 14 días
```

### Test 8: Persistencia
```
1. Agregar producto (5 unidades)
2. F5 (recargar página)
3. Verificar producto sigue en carrito
4. Verificar reserva sigue activa
```

### Test 9: Checkout válido
```
1. Agregar producto
2. Ir a checkout
3. Verificar sin errores
4. Verificar botón habilitado
5. Clic en pagar
6. Verificar onCheckout se ejecutó
```

### Test 10: Checkout con errores (simulado)
```
1. Agregar producto
2. En devtools, localStorage quitar entrada
3. Ir a checkout
4. Verificar muestra error
5. Verificar botón deshabilitado
```

---

## 🔍 Debugging - Comandos Console

```javascript
// Ver todas las reservas
localStorage.getItem('stock_reservations')

// Ver carrito
localStorage.getItem('cart_data')

// Borrar reservas (para empezar de cero)
localStorage.removeItem('stock_reservations')

// Borrar carrito
localStorage.removeItem('cart_data')

// Ver tiempo restante de reserva (en producto con ID 1)
// En CartItem o componente con access a useStockReservation
const reservation = getReservationInfo(1)
console.log(new Date(reservation.expiresAt))

// Simular expiración (restar 14 días)
const reservation = JSON.parse(localStorage.getItem('stock_reservations'))[1]
reservation.expiresAt = Date.now() - 1000 // Vencido hace 1 segundo
```

---

## 📱 Estructura de Datos localStorage

```javascript
// stock_reservations
{
  "1": {
    "productId": 1,
    "quantity": 5,
    "expiresAt": 1703798400000,  // Timestamp
    "createdAt": 1703194800000
  },
  "2": {
    "productId": 2,
    "quantity": 3,
    "expiresAt": 1703798400000,
    "createdAt": 1703194800000
  }
}

// cart (ejemplo - puede variar según tu app)
[
  {
    "id": 1,
    "productId": 1,
    "quantity": 5,
    "price": 29.99
  }
]
```

---

## 🚨 Problemas Comunes

### Problema: Notificaciones no aparecen
**Causa:** NotificationContext no existe  
**Solución:** Verificar que existe en App.jsx y CartProvider está dentro

### Problema: ReservationExpirationMonitor no elimina items expirados
**Causa:** No está en App.jsx o interval está muy alto  
**Solución:** Poner dentro de CartProvider, verificar interval (default 60000 = 1 min)

### Problema: CartItem no muestra "🔒 Reservado por..."
**Causa:** useCartValidations no importado correctamente  
**Solución:** Verificar path exacto en import

### Problema: Stock no se actualiza en tiempo real
**Causa:** stockReservationService no integrado con CartContext  
**Solución:** Verificar CartContext llama a reserveStock(), releaseReservation()

### Problema: Botón de checkout siempre deshabilitado
**Causa:** validateCheckoutSummary() siempre retorna error  
**Solución:** Verificar console, revisar localStorage tiene datos válidos

### Problema: localStorage lleno (si muchas reservas)
**Causa:** cleanupExpiredReservations() no se ejecuta  
**Solución:** ReservationExpirationMonitor debe estar en App.jsx

---

## 📊 Monitoreo en Producción

```javascript
// Ver cuántas reservas activas hay
const reservations = JSON.parse(localStorage.getItem('stock_reservations') || '{}')
console.log(`Reservas activas: ${Object.keys(reservations).length}`)

// Ver cuánto tiempo hasta expiración más próxima
const expirations = Object.values(reservations).map(r => r.expiresAt)
const nearest = Math.min(...expirations)
console.log(`Próxima expiración en: ${new Date(nearest)}`)

// Ver productos más reservados
const reservationsByProduct = {}
Object.values(reservations).forEach(r => {
  reservationsByProduct[r.productId] = 
    (reservationsByProduct[r.productId] || 0) + r.quantity
})
console.table(reservationsByProduct)
```

---

## 🎯 Flujo de Usuario Típico

```
Usuario entra a producto
       ↓
Clic "Agregar al carrito"
       ↓
Validar: ¿10 unidades max? ✓
Validar: ¿Stock disponible? ✓
       ↓
Reservar stock por 14 días
       ↓
Mostrar: ✅ "Producto reservado durante 14 días"
       ↓
Usuario ve en carrito:
  🔒 Reservado por 14d 5h 30m
  📦 Stock disponible: 8/20
       ↓
Usuario puede:
  - Aumentar cantidad (si hay stock)
  - Disminuir cantidad (siempre)
  - Eliminar (libera stock)
       ↓
Usuario va a checkout
       ↓
Validar nuevamente todas las reservas
Mostrar errores o advertencias
       ↓
Clic "Confirmar Compra"
       ↓
onCheckout callback
Procesar pago (backend)
       ↓
✅ Compra completada
```

---

## 🔄 Ciclo de Vida de una Reserva

```
Minuto 0:
└─ Usuario agrega producto
  ├─ Validar cantidad (max 10)
  ├─ Validar stock disponible
  ├─ Reservar stock
  └─ Guardar expiración = ahora + 14 días

Minuto 1-10079:
├─ Usuario puede modificar cantidad
├─ Usuario puede ver "🔒 Reservado por Xd Xh"
├─ ReservationExpirationMonitor chequea cada minuto
├─ Si expiró → Eliminar + Notificar
└─ Si no expiró → Dejar estar

Minuto 10080 (14 días):
└─ Reserva vence automáticamente
  ├─ ReservationExpirationMonitor lo detecta
  ├─ Elimina item del carrito
  ├─ Libera stock
  └─ Notifica: ⏰ "Tu reserva expiró"

O antes de 14 días:
└─ Usuario va a checkout
  ├─ Validar reserva sigue activa
  ├─ Validar stock disponible
  ├─ Mostrar resumen
  └─ Procesar pago
```

---

## 💡 Tips Profesionales

### Tip 1: Testing de expiración rápida
```javascript
// Cambiar a 10 segundos para testing
const RESERVATION_DURATION = 10 * 1000;
// Cambiar de vuelta cuando termines
const RESERVATION_DURATION = 14 * 24 * 60 * 60 * 1000;
```

### Tip 2: Debug detallado
```javascript
// En CartContext, agregar logs:
console.log('📦 Stock disponible:', availableStock)
console.log('🔒 Stock reservado:', totalReserved)
console.log('📊 Total en carrito:', currentQuantity)
console.log('➕ Nuevo total sería:', newTotal)
```

### Tip 3: Monitorear localStorage
```javascript
// En ReservationExpirationMonitor, agregar:
console.log('🔍 Revisando expiración...')
Object.entries(reservations).forEach(([id, res]) => {
  const remaining = res.expiresAt - Date.now()
  console.log(`  Producto ${id}: ${Math.ceil(remaining/1000)}s`)
})
```

### Tip 4: Validar integraciones
```javascript
// Antes de deployar, verificar:
✓ NotificationContext existe en App.jsx
✓ CartProvider existe en App.jsx
✓ ReservationExpirationMonitor está en CartProvider
✓ CheckoutSummary está en CartPage
✓ useCartValidations imports correctamente
✓ stockReservationService accessible desde CartContext
```

---

## 📈 Métricas para Seguir

```
1. Tasa de conversión: (Checkout exitosos / Reservas creadas)
2. Tiempo promedio: (Reserva → Compra)
3. Abandono por expiración: (Reservas que vencieron)
4. Top 10 productos: (Más reservados)
5. Picos de reserva: (Hora/día del pico)
6. Stock crítico: (Productos con < 5 unidades)
```

---

## 🎓 Archivos a Leer Según Necesidad

| Necesidad | Archivo |
|-----------|---------|
| Integrar rápido | QUICK_START.md |
| Entender sistema | STOCK_RESERVATION_SYSTEM.md |
| Ver ejemplos | INTEGRATION_EXAMPLES.md |
| Verificar cobertura | IMPLEMENTATION_SUMMARY.md |
| Diseñar UI | NOTIFICATIONS_REFERENCE.md |
| Estructura de código | PROJECT_STRUCTURE.md |
| Diagramas visuales | VISUAL_SUMMARY.md |
| Resumen ejecutivo | EXECUTIVE_SUMMARY.md |
| Qué cambió | CHANGELOG.md |
| Esta referencia rápida | REFERENCE_GUIDE.md (este archivo) |

---

## ⚡ Comandos de Terminal Útiles

```bash
# Ver tamaño de localStorage
du -sh ~/.config/google-chrome/Default/Local\ Storage

# Limpiar cache (Chrome Dev Tools)
# Ctrl+Shift+Delete (Windows)
# Cmd+Shift+Delete (Mac)

# Ver JSONs formateados
console.log(JSON.stringify(reservation, null, 2))

# Timing de operaciones
console.time('Validación')
// ... código ...
console.timeEnd('Validación')
```

---

## 🎉 ¡Listo!

Siguiendo este documento puedes:
- ✅ Integrar en 2 minutos
- ✅ Configurar en 10 segundos
- ✅ Debuggear problemas
- ✅ Monitorear en producción
- ✅ Entender cada parte

**Próximo paso:** Seguir QUICK_START.md (5 pasos, 10 minutos)

---

**Última actualización:** Noviembre 25, 2025  
**Versión:** 1.0 (Referencia Rápida)

