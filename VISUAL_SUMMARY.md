# 🎨 Visual Summary - Stock Reservation System

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     APLICACIÓN PRINCIPAL                    │
│                        (App.jsx)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼──┐   ┌────▼──┐   ┌────▼──────┐
   │Provider│   │Provider│   │ReservationMonitor
   │Notif   │   │Cart    │   │(Expiración)
   └─────────   └────────┘   └──────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼────┐  ┌───▼────┐  ┌───▼────┐
    │CartPage│  │Product │  │Checkout│
    │        │  │ Card   │  │Summary │
    └────────┘  └────────┘  └────────┘
        │
    ┌───▼─────────────────────┐
    │   CartItem + Storage    │
    │ (Muestra info reserva)  │
    └─────────────────────────┘
```

---

## 🔄 Flujo de Datos - Agregar Producto

```
USER                CARTCONTEXT          STOCKSERVICE        LOCALSTORAGE
 │                      │                      │                   │
 ├─ Click "Agregar" ────>│                      │                   │
 │                       │                      │                   │
 │                       ├─ validateAdd() ─────>│                   │
 │                       │  (10 units? stock?)  │                   │
 │                       │<─ return {valid} ────│                   │
 │                       │                      │                   │
 │                       ├─ reserveStock() ────>│                   │
 │                       │                      ├─ create entry ────>│
 │                       │                      │   (14 days exp)    │
 │                       │<─ reservation ───────│                   │
 │                       │                      │                   │
 │<─ ✅ Notification ────│                      │                   │
 │                       │                      │                   │
 │ [CartItem shows]      │                      │                   │
 │  🔒 Reservado 14d     │                      │                   │
 │  📦 Stock: 15/50      │                      │                   │
 │                       │                      │                   │
```

---

## ⏰ Flujo de Datos - Expiración Automática

```
MONITOR            CARTCONTEXT          STOCKSERVICE        LOCALSTORAGE
   │                    │                      │                   │
   │ (cada minuto)      │                      │                   │
   ├─ chequear ────────>│                      │                   │
   │   reservas         │                      │                   │
   │                    ├─ getInfo() ─────────>│                   │
   │                    │                      ├─ leer localStorage>│
   │                    │<─ expired? ──────────│<─ verificar ───────│
   │                    │                      │                   │
   │                    ├─ removeItem() ──────>│                   │
   │                    │  (if expired)        ├─ release() ───────>│
   │                    │                      │  (delete entry)    │
   │                    │                      │                   │
   │<─ ⏰ Notification──│                      │                   │
   │   "Reserva expiró" │                      │                   │
   │                    │                      │                   │
```

---

## 🏗️ Componentes Principales

### 1. CartContext.jsx
```
┌──────────────────────────────────────────┐
│ CARTCONTEXT                              │
├──────────────────────────────────────────┤
│                                          │
│ State:                                   │
│  - items[]                               │
│                                          │
│ Methods:                                 │
│  ├─ addItem(product, qty)               │
│  │   ├─ validateAddQuantity()            │
│  │   ├─ stockReservationService         │
│  │   └─ notification                    │
│  │                                      │
│  ├─ removeItem(id)                      │
│  │   ├─ releaseReservation()            │
│  │   └─ notification                    │
│  │                                      │
│  ├─ updateQuantity(id, qty)             │
│  │   ├─ validate (10 units, stock)      │
│  │   ├─ updateReservation()             │
│  │   └─ notification                    │
│  │                                      │
│  └─ validateCheckout()                  │
│      └─ return {allValid, details}      │
│                                          │
└──────────────────────────────────────────┘
```

### 2. stockReservationService.js
```
┌──────────────────────────────────────────┐
│ STOCKRESERVATIONSERVICE                  │
├──────────────────────────────────────────┤
│                                          │
│ Data:                                    │
│  - reservations Map                      │
│  - localStorage persistence              │
│                                          │
│ Methods:                                 │
│  ├─ reserveStock(id, qty)               │
│  │   └─ schedule expiration (14d)       │
│  │                                      │
│  ├─ updateReservation(id, qty)          │
│  │   └─ maintain expiration time        │
│  │                                      │
│  ├─ releaseReservation(id)              │
│  │   └─ cleanup timer + delete          │
│  │                                      │
│  ├─ getReservationInfo(id)              │
│  │   └─ return {qty, expiresIn, ...}   │
│  │                                      │
│  ├─ getAvailableStock(id, total)        │
│  │   └─ return total - reserved         │
│  │                                      │
│  └─ getAllReservations()                │
│      └─ return active reservations      │
│                                          │
└──────────────────────────────────────────┘
```

### 3. useCartValidations.js
```
┌──────────────────────────────────────────┐
│ USECARTVALIDATIONS HOOK                  │
├──────────────────────────────────────────┤
│                                          │
│ Returns:                                 │
│  ├─ validateAddQuantity()                │
│  │   └─ {valid, error, type}            │
│  │                                      │
│  ├─ validateUpdateQuantity()             │
│  │   └─ {valid, message, type}          │
│  │                                      │
│  ├─ getStockInfo()                      │
│  │   └─ {total, reserved, available}    │
│  │                                      │
│  ├─ validateCheckoutSummary()            │
│  │   └─ {isValid, errors[], warnings[]} │
│  │                                      │
│  ├─ getReservationTimeRemaining()       │
│  │   └─ {days, hours, minutes, fmt}     │
│  │                                      │
│  └─ Constants:                           │
│      ├─ MAX_UNITS_PER_PRODUCT: 10       │
│      └─ RESERVATION_DURATION_DAYS: 14   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📱 Vista del Usuario

### CartItem Component
```
┌────────────────────────────────────┐
│ [IMG] Manga One Piece Vol. 15      │
│                                    │
│ 🔒 Reservado por 13d 18h          │  ← Información de reserva
│ 📦 Stock disponible: 15/50 unidades│  ← Stock en tiempo real
│ ⏰ ¡Reserva vence en < 6h!        │  ← Advertencia (si aplica)
│                                    │
│ Precio: $15.99                     │
│                                    │
│ Cantidad: [−] 3 [+]               │  ← Controles
│ Subtotal: $47.97                  │
│                          [✕ Eliminar] │
│                                    │
└────────────────────────────────────┘
```

### CheckoutSummary Component
```
┌──────────────────────────────────────────┐
│ ✅ ÉXITO / ❌ ERROR / ⚠️ ADVERTENCIAS    │
│                                          │
│ Resumen de compra (3 productos)         │
│ ├─ Manga One Piece × 2       $31.98     │
│ ├─ Figuras Dragon Ball × 1   $24.99     │
│ └─ Ropa Otaku Hoodie × 3     $89.97     │
│                                          │
│ ✅ Todos reservados por 14 días         │
│ 💳 Información protegida                │
│ 🔒 Producto asegurado al completar      │
│                                          │
│ [     COMPLETAR COMPRA (✓ / ✗)    ]    │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔐 Validación en Capas

```
CAPA 1: VALIDACIÓN INMEDIATA
┌─────────────────────────────────┐
│ Al escribir/cambiar cantidad    │
│ - Máximo 10 unidades?           │
│ - Stock disponible?             │
│ Resultado: Error inline si falla│
└─────────────────────────────────┘
                ↓
CAPA 2: VALIDACIÓN EN CONTEXTO
┌─────────────────────────────────┐
│ Antes de agregar al carrito     │
│ - Revisar stock reservado       │
│ - Revisar otros usuarios        │
│ - Guardar en localStorage       │
│ Resultado: Notificación al usuario
└─────────────────────────────────┘
                ↓
CAPA 3: VALIDACIÓN PRE-PAGO
┌─────────────────────────────────┐
│ Justo antes del checkout        │
│ - ¿Reservas siguen activas?     │
│ - ¿Stock disponible?            │
│ - ¿Errores/Advertencias?        │
│ Resultado: Botón habilitado/deshabilitado
└─────────────────────────────────┘
                ↓
CAPA 4: VALIDACIÓN BACKEND (RECOMENDADO)
┌─────────────────────────────────┐
│ En el servidor                  │
│ - Revisar stock final           │
│ - Procesar pago                 │
│ - Guardar orden                 │
│ Resultado: Confirmación de pago │
└─────────────────────────────────┘
```

---

## 📊 Estados Posibles de un Item

```
ESTADO 1: NUEVO (Agregar)
  ├─ Sin reserva
  ├─ Stock: 50/50
  └─ Acción: Agregar al carrito

         ↓

ESTADO 2: RESERVADO (En carrito)
  ├─ 🔒 Reservado por 14d
  ├─ Stock: 15/50 (yo reservé 3)
  └─ Acciones: Aumentar, Reducir, Eliminar

         ↓ (Reducción de tiempo)

ESTADO 3: POR EXPIRAR (< 6 horas)
  ├─ ⏰ ¡Vence en < 6h!
  ├─ Stock: 15/50
  └─ Acciones: Urgente - Completar compra

         ↓ (14 días completos)

ESTADO 4: EXPIRADO (Eliminado automáticamente)
  ├─ Notificación: "Tu reserva expiró"
  ├─ Stock vuelve: 50/50
  └─ Acción: Volver a agregar si desea

         ↓

O ESTADO 4b: COMPRADO (Checkout exitoso)
  ├─ Notificación: "Compra completada"
  ├─ Reserva se convierte en compra
  └─ Stock: Deducido del inventario
```

---

## 🎯 Matriz de Validación

```
┌─────────────────────┬──────────────┬────────────────────┐
│ Cantidad Solicitada │ Stock Total  │ Resultado          │
├─────────────────────┼──────────────┼────────────────────┤
│ 5 unidades          │ 50 (10 rese) │ ✅ OK (35 avail)   │
│ 50 unidades         │ 50 (10 rese) │ ❌ ERROR (35 avail)│
│ 11 unidades         │ 50 (0 rese)  │ ⚠️ WARNING (max 10)│
│ 10 unidades         │ 5 (0 rese)   │ ⚠️ WARNING (max 5) │
└─────────────────────┴──────────────┴────────────────────┘
```

---

## ⏱️ Timeline de 14 Días

```
DÍA 0 (Hoy)
├─ 00:00 - Usuario agrega producto
├─ ✓ Stock se reserva
├─ ✓ localStorage guardado
└─ ✓ Notificación mostrada
   
DÍA 7
├─ Monitor chequea cada minuto
└─ Notificación: "Falta 1 semana"

DÍA 13
├─ Reserva aún activa
├─ CartItem muestra: "1d 00h restante"
└─ Sin advertencias

DÍA 13 (18:00)
├─ < 6 horas para expiración
├─ CartItem muestra: "⏰ ¡Vence en < 6h!"
└─ Notificación importante

DÍA 14 (00:00 - EXPIRACIÓN)
├─ Monitor detecta expiración
├─ ❌ Producto removido del carrito
├─ Stock devuelto al inventario
├─ Notificación: "Tu reserva expiró"
└─ Usuario puede volver a intentar
```

---

## 🔔 Notificación Toast - Lifecycle

```
ANTES                    DURANTE                  DESPUÉS
(No existe)              (Visible)                (Desaparece)

                    ┌─────────────────┐
                    │ ✅ ÉXITO        │
                    │ Producto agregado
                    │                 │ ← Auto-cierra
                    │ [4 segundos]    │   después de 4s
                    └─────────────────┘

O

                    ┌─────────────────┐
                    │ ❌ ERROR        │
                    │ Sin stock       │ ← Manual dismiss
                    │ [X para cerrar] │   o timeout
                    └─────────────────┘
```

---

## 🏆 Ventajas del Sistema

```
USUARIO                              NEGOCIO
├─ Tiempo límite claro              ├─ Evita overselling
├─ Información en tiempo real       ├─ Presión para compra
├─ No pierde compra por expiración  ├─ Datos de conversión
├─ Notificaciones claras            ├─ Stock más controlado
└─ Compra segura                    └─ Experiencia confiable
```

---

## 📈 Metrics Disponibles

```
┌─────────────────────────────────────────┐
│ ANALYTICS POSIBLES                      │
├─────────────────────────────────────────┤
│ • Tiempo promedio: Reserva → Compra    │
│ • Tasa de abandono por expiración      │
│ • Productos más reservados             │
│ • Productos sin compra completada      │
│ • Promedio de unidades por reserva     │
│ • Picos de reserva por hora/día        │
│ • Tasa de renovación de reservas       │
│ • Correlación: Precio vs conversión    │
└─────────────────────────────────────────┘
```

---

## ✨ Conclusión Visual

```
SIN SISTEMA                    CON SISTEMA
┌──────────────────┐          ┌──────────────────┐
│ Usuario agrega   │          │ Usuario agrega   │
│ Stock insuficiente│          │ ✅ Reserva activa │
│ Carrito vacío    │          │ 📦 Stock visible │
│ Experiencia pobre│          │ ⏰ Cuenta atrás  │
│ Sin urgencia     │          │ 🎯 Urgencia 14d │
│ Abandono alto    │          │ Conversión ↑    │
└──────────────────┘          └──────────────────┘
```

