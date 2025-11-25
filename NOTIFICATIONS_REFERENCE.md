# 📢 Notificaciones del Sistema - Referencia Visual

## 🎯 Clasificación por Tipo y Momento

---

## 1️⃣ AGREGAR PRODUCTO AL CARRITO

### ✅ Éxito
```
┌─────────────────────────────────────────────────────┐
│ ✅ ÉXITO                                            │
├─────────────────────────────────────────────────────┤
│ Producto reservado durante 14 días. Completa la    │
│ compra para asegurar tu unidad.                     │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** success
- **Contexto:** Cuando se agrega correctamente un producto
- **Código:**
```javascript
addNotification?.({
  message: `✅ ${product.name} - Cantidad: ${newQuantity} unidades. Reservado durante ${RESERVATION_DURATION_DAYS} días. Completa la compra para asegurar tu unidad.`,
  type: 'success'
})
```

### ⚠️ Advertencia - Límite Máximo
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  ADVERTENCIA                                      │
├─────────────────────────────────────────────────────┤
│ Solo puedes reservar hasta 10 unidades de este      │
│ producto.                                           │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** warning
- **Contexto:** Cuando intenta agregar más de 10 unidades
- **Causa:** `totalQuantity > MAX_UNITS_PER_PRODUCT`

### ❌ Error - Stock Insuficiente
```
┌─────────────────────────────────────────────────────┐
│ ❌ ERROR                                            │
├─────────────────────────────────────────────────────┤
│ No hay suficiente stock disponible en este          │
│ momento.                                            │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** error
- **Contexto:** Stock disponible (total - reservado) es menor que lo solicitado
- **Causa:** `requestedQuantity > availableStock`

---

## 2️⃣ MODIFICAR CANTIDAD EN EL CARRITO

### ✅ Éxito - Cantidad Aumentada
```
┌─────────────────────────────────────────────────────┐
│ ✅ ÉXITO                                            │
├─────────────────────────────────────────────────────┤
│ Cantidad actualizada y reserva ampliada. Nueva      │
│ cantidad: 5 unidades.                              │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** success
- **Contexto:** Cuando se aumenta la cantidad exitosamente
- **Validaciones:** ✓ Dentro de 10 unidades ✓ Stock disponible

### ℹ️ Información - Cantidad Reducida
```
┌─────────────────────────────────────────────────────┐
│ ℹ️  INFORMACIÓN                                     │
├─────────────────────────────────────────────────────┤
│ Cantidad reducida. La reserva liberada vuelve al    │
│ inventario.                                         │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** info
- **Contexto:** Cuando se reduce la cantidad
- **Efecto:** Stock reservado disminuye, stock disponible aumenta

### ⚠️ Advertencia - Excede Límite
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  ADVERTENCIA                                      │
├─────────────────────────────────────────────────────┤
│ No puedes reservar más de 10 unidades.              │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** warning
- **Contexto:** Al intentar aumentar por encima de 10
- **Causa:** `newQuantity > MAX_UNITS_PER_PRODUCT`

### ❌ Error - Sin Stock para Aumento
```
┌─────────────────────────────────────────────────────┐
│ ❌ ERROR                                            │
├─────────────────────────────────────────────────────┤
│ No hay suficiente stock para aumentar la cantidad.  │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** error
- **Contexto:** Cuando la diferencia de cantidad excede stock disponible
- **Causa:** `quantityDifference > availableStock`

---

## 3️⃣ ELIMINAR PRODUCTO DEL CARRITO

### ℹ️ Información - Eliminación
```
┌─────────────────────────────────────────────────────┐
│ ℹ️  INFORMACIÓN                                     │
├─────────────────────────────────────────────────────┤
│ Producto eliminado del carrito. La reserva fue      │
│ liberada y el stock volvió al inventario.           │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** info
- **Contexto:** Cuando el usuario elimina un producto
- **Efecto:** 
  - ✓ Se libera la reserva
  - ✓ Stock vuelve al inventario
  - ✓ Producto se quita del carrito

---

## 4️⃣ EXPIRACIÓN DE RESERVA (14 DÍAS)

### ⏰ Advertencia - Expiración Inminente
```
┌─────────────────────────────────────────────────────┐
│ ⏰ ADVERTENCIA                                       │
├─────────────────────────────────────────────────────┤
│ ¡Reserva vence en menos de 6 horas!                 │
│                                                     │
│ Producto: Manga One Piece Vol. 15                  │
│ Cantidad: 3 unidades                               │
│ Vence en: 5h 45m                                   │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** warning
- **Contexto:** Aparece en `CartItem` si quedan < 6 horas
- **Ubicación:** En cada producto del carrito
- **Actualización:** Cada minuto

### ⏰ Advertencia - Expiración Completada
```
┌─────────────────────────────────────────────────────┐
│ ⏰ ADVERTENCIA                                       │
├─────────────────────────────────────────────────────┤
│ Tu reserva de "Manga One Piece Vol. 15" ha expirado.│
│ El producto volvió al inventario público.           │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** warning
- **Contexto:** Cuando la reserva expira (14 días)
- **Automatización:** No requiere intervención del usuario
- **Efecto:**
  - ✓ Producto eliminado del carrito
  - ✓ Stock reservado se libera
  - ✓ Stock disponible aumenta
  - ✓ Notificación inmediata

---

## 5️⃣ VISUALIZACIÓN EN CartItem.jsx

### Stock Information Display
```
┌────────────────────────────────────┐
│ 🔒 Reservado por 13d 18h          │
│ 📦 Stock disponible: 15/50 unidades│
│ ⏰ ¡Reserva vence en menos de 6h!  │
└────────────────────────────────────┘
```

**Componentes mostrados:**
- 🔒 Reserva activa (días + horas restantes)
- 📦 Stock actualizado en vivo (disponible/total)
- ⏰ Alerta si vence pronto (< 6 horas)
- ⚠️ Límite de 10 unidades alcanzado

---

## 6️⃣ VALIDACIONES EN CheckoutSummary

### ✅ Checkout Válido
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│ Resumen de compra (3 productos)                    │
│ ├─ Manga One Piece × 2          $31.98             │
│ ├─ Figuras Dragon Ball × 1      $24.99             │
│ └─ Ropa Otaku Hoodie × 3        $89.97             │
│                                                     │
│ ✅ Todos los productos están reservados por 14 días│
│ 💳 Al completar la compra, los productos quedarán  │
│    asegurados                                       │
│ 🔒 Tu información de pago está protegida           │
│                                                     │
│ [            Completar compra            ]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Botón:** Habilitado (verde)
- **Estado:** Listo para procesar

### ❌ Checkout Inválido
```
┌─────────────────────────────────────────────────────┐
│ ❌ ERROR                                            │
├─────────────────────────────────────────────────────┤
│ • Manga One Piece - La reserva ha expirado.        │
│ • Figuras Dragon Ball - Stock insuficiente.        │
│                                                     │
│ Resumen de compra (3 productos)                    │
│ [         Completar compra (deshabilitado)    ]    │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Botón:** Deshabilitado (gris)
- **Errores:** Listados arriba
- **Acción:** El usuario debe resolver antes de proceder

### ⚠️ Checkout con Advertencias
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  ADVERTENCIAS                                     │
├─────────────────────────────────────────────────────┤
│ • Manga One Piece - La reserva vence en menos de   │
│   6 horas.                                          │
│                                                     │
│ [          Completar compra (habilitado)       ]    │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Botón:** Habilitado (puede proceder)
- **Advertencias:** Se muestra pero permite continuar
- **Urgencia:** Usuario debe apurarse

---

## 7️⃣ NOTIFICACIONES DE PAGO

### ✅ Éxito
```
┌─────────────────────────────────────────────────────┐
│ ✅ ÉXITO                                            │
├─────────────────────────────────────────────────────┤
│ Compra completada. Tu producto ahora está          │
│ totalmente asegurado.                              │
│                                                     │
│ Orden #12345 - Recibiste un email de confirmación  │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** success
- **Contexto:** Después de procesar pago exitoso
- **Redirección:** A página de confirmación

### ❌ Error de Pago
```
┌─────────────────────────────────────────────────────┐
│ ❌ ERROR                                            │
├─────────────────────────────────────────────────────┤
│ Error al procesar la compra: Tarjeta rechazada     │
│                                                     │
│ Por favor, intenta con otro método de pago.        │
└─────────────────────────────────────────────────────┘
```
- **Tipo:** error
- **Contexto:** Si algo falla durante el pago
- **Acción:** Usuario puede intentar nuevamente

---

## 🎨 Estilos de Notificación

### Success (Verde)
```
Fondo: rgba(220, 252, 231) / dark:rgba(6, 78, 59)
Texto: #059669 / dark:#10b981
Borde: #34d399
```

### Warning (Amarillo)
```
Fondo: rgba(254, 243, 199) / dark:rgba(78, 65, 0)
Texto: #b45309 / dark:#fbbf24
Borde: #fcd34d
```

### Error (Rojo)
```
Fondo: rgba(254, 226, 226) / dark:rgba(127, 29, 29)
Texto: #dc2626 / dark:#f87171
Borde: #fca5a5
```

### Info (Azul)
```
Fondo: rgba(219, 234, 254) / dark:rgba(30, 58, 138)
Texto: #0284c7 / dark:#38bdf8
Borde: #7dd3fc
```

---

## 📊 Matriz de Eventos

| Evento | Notificación | Tipo | Auto-cerrar |
|--------|--------------|------|-----------|
| Agregar producto | ✅ Éxito | success | 4s |
| Agregar > 10 | ⚠️ Límite | warning | 5s |
| Sin stock | ❌ Error | error | Manual |
| Aumentar cantidad | ✅ Éxito | success | 4s |
| Aumentar sin stock | ❌ Error | error | Manual |
| Reducir cantidad | ℹ️ Info | info | 3s |
| Eliminar | ℹ️ Info | info | 3s |
| Reserva < 6h | ⏰ Alerta | warning | Manual |
| Reserva expira | ⏰ Alerta | warning | 5s |
| Checkout inválido | ❌ Error | error | Manual |
| Pago exitoso | ✅ Éxito | success | 5s |
| Pago fallido | ❌ Error | error | Manual |

---

## 🔔 Ubicación de Notificaciones en UI

```
┌─────────────────────────────────────────────────┐
│ Header                                          │
├─────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐   │
│ │ 🔔 Notificación Toast (esquina superior) │   │ ← Aquí aparecen
│ └───────────────────────────────────────────┘   │
│                                                 │
│ Main Content                                    │
│ ├─ [Producto 1]                                │
│ │  ├─ 🔒 Reservado por 13d 18h  ← Info inline │
│ │  └─ 📦 Stock disponible: 15/50             │
│ │                                              │
│ ├─ [Producto 2]                                │
│ │  ├─ ⏰ ¡Reserva vence en < 6h! ← Alerta   │
│ │  └─ 📦 Stock disponible: 5/10              │
│ │                                              │
│ └─ Checkout Summary                            │
│    ├─ [✅ Éxito / ❌ Error / ⚠️ Advertencia] ← Aquí también
│    ├─ Resumen de compra                       │
│    └─ [Completar compra]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✨ Animaciones

### Toast Notification
- **Entrada:** Slide in + Fade in (300ms)
- **Salida:** Fade out + Slide out (200ms)
- **Duración típica:** 3-5 segundos
- **Posición:** Top-right o customizable

### Inline Alerts
- **Aparición:** Instant (sin animación)
- **Actualización:** Color change smooth (200ms)
- **Desaparición:** Fade out (200ms)

---

## 📱 Mobile Responsive

En móvil:
- Notificaciones toman ancho completo
- Texto se ajusta (max-width: 100%)
- Padding aumenta para targets más grandes
- Toast posicionado mejor (no sobre elementos)

---

## 🎯 UX Principles Aplicados

1. **Feedback Inmediato:** Toda acción tiene respuesta visual
2. **Claridad:** Mensajes claros y directos
3. **Accionable:** El usuario sabe qué hacer
4. **No-Intrusivo:** Info sin bloquear UI
5. **Contextual:** Ubicación y tipo relevante al evento
6. **Accesibilidad:** Colores + Iconos + Texto

