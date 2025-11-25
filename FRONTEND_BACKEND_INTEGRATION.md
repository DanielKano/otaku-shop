# Frontend-Backend Integration Guide

## Overview

This document describes how the frontend React application integrates with the backend Java Spring Boot API to deliver the stock reservation system.

## Architecture Diagram

```
Frontend (React)                          Backend (Spring Boot)
================                          ====================

User Actions
    ↓
CartContext
    ↓
useStockReservation Hook
    ├─ validateCart()
    ├─ updateReservations()
    └─ checkExpiringReservations()
    ↓
CartItem Component
    ├─ Displays quantity with reservation info
    └─ Manages add/remove/update actions
    ↓
useApiCall Hook
    ↓
API Calls (axios)
    ├─ POST /api/cart/add
    ├─ PUT /api/cart/{id}
    ├─ DELETE /api/cart/{id}
    ├─ DELETE /api/cart
    ├─ GET /api/cart
    └─ GET /api/cart/reservations
    ↓
                                    CartController
                                         ↓
                                    CartService
                                         ├─ addItem() → validates + reserves
                                         ├─ updateItem() → updates + reserves
                                         ├─ removeItem() → releases reservation
                                         └─ clearCart() → releases all
                                         ↓
                                    StockReservationService
                                         ├─ reserveStock()
                                         ├─ validateReservation()
                                         ├─ reduceUserReservation()
                                         └─ getUserReservations()
                                         ↓
                                    In-Memory Storage (ConcurrentHashMap)
```

## API Contract

### 1. Add to Cart

**Frontend**:
```javascript
// services/stockReservationService.js
const response = await axios.post('/api/cart/add', {
  productId: product.id,
  quantity: quantityToAdd
});
```

**Backend**:
```java
// CartController.java
@PostMapping("/add")
public ResponseEntity<Map<String, Object>> addToCart(
    @Valid @RequestBody CartItemRequest request)
```

**Request**:
```json
{
  "productId": 100,
  "quantity": 5
}
```

**Success Response (201)**:
```json
{
  "cartItem": {
    "id": 1,
    "productId": 100,
    "productName": "Anime Figure",
    "quantity": 5,
    "price": 50000
  },
  "total": 250000,
  "itemCount": 1,
  "message": "Producto agregado al carrito exitosamente"
}
```

**Error Response (400)**:
```json
{
  "error": "Solo puedes reservar hasta 10 unidades. Ya tienes 3, intentas agregar 5"
}
```

**Frontend Handling**:
```javascript
try {
  const result = await api.addToCart(product.id, quantity);
  // Update CartContext with new item
  // Show success notification
} catch (error) {
  // Display error message to user
  // Show toast: "Solo puedes reservar hasta 10 unidades..."
}
```

### 2. Update Cart Item

**Frontend**:
```javascript
const response = await axios.put(`/api/cart/${itemId}`, {
  quantity: newQuantity
});
```

**Backend**:
```java
@PutMapping("/{id}")
public ResponseEntity<Map<String, Object>> updateCartItem(
    @PathVariable Long id,
    @Valid @RequestBody CartItemUpdateRequest request)
```

**Request**:
```json
{
  "quantity": 7
}
```

**Response (200)**:
```json
{
  "cartItem": {
    "id": 1,
    "productId": 100,
    "quantity": 7,
    "price": 50000
  },
  "total": 350000,
  "itemCount": 1,
  "message": "Cantidad actualizada exitosamente"
}
```

**Frontend Handling**:
```javascript
const { updateReservations } = useStockReservation();

const handleQuantityChange = async (itemId, newQty) => {
  try {
    await api.updateCartItem(itemId, newQty);
    await updateReservations(); // Refresh reservation state
    showSuccess("Cantidad actualizada");
  } catch (error) {
    showError(error.response?.data?.error || "Error al actualizar");
  }
};
```

### 3. Remove from Cart

**Frontend**:
```javascript
const response = await axios.delete(`/api/cart/${itemId}`);
```

**Backend**:
```java
@DeleteMapping("/{id}")
public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id)
```

**Response (200)**:
```json
{
  "total": 0,
  "itemCount": 0,
  "message": "Item eliminado del carrito exitosamente"
}
```

**Frontend Handling**:
```javascript
const handleRemoveItem = async (itemId) => {
  await api.removeCartItem(itemId);
  // Backend automatically releases reservation
  // Update local CartContext
};
```

### 4. Get User's Reservations

**Frontend**:
```javascript
// hooks/useStockReservation.js
const updateReservations = async () => {
  const response = await axios.get('/api/cart/reservations');
  setReservations(response.data.reservations);
};
```

**Backend**:
```java
@GetMapping("/reservations")
public ResponseEntity<Map<String, Object>> getReservations()
```

**Response (200)**:
```json
{
  "reservations": [
    {
      "reservationId": "uuid-1234",
      "productId": 100,
      "quantity": 5,
      "userId": 1,
      "expiresAt": "2024-12-25T10:30:00"
    },
    {
      "reservationId": "uuid-5678",
      "productId": 101,
      "quantity": 3,
      "userId": 1,
      "expiresAt": "2024-12-25T11:45:00"
    }
  ],
  "count": 2,
  "message": "Reservas de stock obtenidas exitosamente"
}
```

**Frontend Usage**:
```javascript
const { reservations } = useStockReservation();

// Check if item is reserved
const isReserved = reservations?.some(
  r => r.productId === product.id
);

// Display reservation expiration time
const expiresAt = reservations?.find(
  r => r.productId === product.id
)?.expiresAt;
```

### 5. Get Cart

**Frontend**:
```javascript
const response = await axios.get('/api/cart');
```

**Backend**:
```java
@GetMapping
public ResponseEntity<Map<String, Object>> getCart()
```

**Response (200)**:
```json
{
  "items": [
    {
      "id": 1,
      "productId": 100,
      "productName": "Anime Figure",
      "quantity": 5,
      "price": 50000
    },
    {
      "id": 2,
      "productId": 101,
      "productName": "Manga Set",
      "quantity": 3,
      "price": 35000
    }
  ],
  "total": 355000,
  "itemCount": 2,
  "message": "Carrito obtenido exitosamente"
}
```

## Data Flow Scenarios

### Scenario 1: User Adds Product to Cart

```
Frontend                          Backend
========                          =======

User clicks "Add to Cart"
  ↓
CartContext.addItem(product, 5)
  ↓
useApiCall → POST /api/cart/add
  ├─ productId: 100
  └─ quantity: 5
                                    CartService.addItem()
                                      ├─ Validate quantity > 0 ✓
                                      ├─ Get user's current qty (0)
                                      ├─ Check: 0 + 5 <= 10 ✓
                                      ├─ Get available stock (50 total, 10 reserved)
                                      ├─ Check: 40 >= 5 ✓
                                      ├─ StockReservationService.reserveStock()
                                      │  └─ Return reservationId: "uuid-123"
                                      ├─ Save CartItem to DB
                                      └─ Return CartItemDTO
  ↓
Display success notification
  "Producto agregado al carrito"
  ↓
Update CartContext with new item
  ↓
useStockReservation.updateReservations()
  └─ GET /api/cart/reservations
                                    StockReservationService.getUserReservations()
                                      └─ Return list of 1 reservation
  ↓
Update local reservation state
  ↓
Re-render CartItem showing:
  - Quantity: 5
  - Reserved: Yes (uuid-123)
  - Expires: Dec 25 10:30
```

### Scenario 2: User Updates Quantity in Cart

```
Frontend                          Backend
========                          =======

User changes quantity: 5 → 3
  ↓
CartContext.updateItem(cartItemId, 3)
  ↓
useApiCall → PUT /api/cart/{itemId}
  └─ quantity: 3
                                    CartService.updateItem()
                                      ├─ Get CartItem (qty=5)
                                      ├─ Validate: 3 > 0 ✓
                                      ├─ Current: 5, New: 3
                                      ├─ 3 < 5, so reduce
                                      ├─ quantityToReduce = 5 - 3 = 2
                                      ├─ StockReservationService.reduceUserReservation()
                                      │  ├─ Find user's reservation (5 units)
                                      │  ├─ Reduce by 2 → 3 units
                                      │  └─ Return true
                                      ├─ Update CartItem.quantity = 3
                                      └─ Return CartItemDTO
  ↓
Update CartContext
  ↓
useStockReservation.updateReservations()
  └─ GET /api/cart/reservations
                                    Return: [{ productId: 100, quantity: 3 }]
  ↓
Update reservation quantity in UI
  ↓
Re-render CartItem with new quantity
```

### Scenario 3: User Checkout

```
Frontend                          Backend
========                          =======

User clicks "Proceder al Pago"
  ↓
CheckoutForm.validateCheckout()
  ├─ Validate form fields
  └─ Call backend validation
                                    CheckoutService.validateCheckout()
                                      ├─ Check: User exists ✓
                                      ├─ Check: All products exist ✓
                                      ├─ Check: Stock available ✓
                                      ├─ For each item:
                                      │  ├─ Get user's reservation qty
                                      │  ├─ Compare with order qty
                                      │  └─ Warn if mismatch
                                      ├─ Validate totals
                                      └─ Return { isValid: true }
  ↓
If valid:
  Call CheckoutService.processCheckout()
                                    ├─ Create Order
                                    ├─ Create OrderItems
                                    ├─ Deduct from Product.stock
                                    ├─ Release reservations
                                    └─ Return Order
  ↓
Show success: "Orden creada"
  ↓
Clear CartContext
```

### Scenario 4: Reservation Expiration Monitoring

```
Frontend (Every 5 seconds)        Backend
==============================    =======

ReservationExpirationMonitor
  └─ useEffect(interval: 5s)
    ├─ GET /api/cart/reservations
    ├─ Check each reservation:
    │  ├─ expiresAt vs now
    │  ├─ If < 2 days: show warning
    │  └─ If < 10 min: show urgent
    └─ Update UI state
                                    StockReservationService
                                      ├─ In-memory check (no DB call)
                                      └─ Return current reservations
```

### Scenario 5: Auto-Cleanup (Backend Only)

```
Backend Background Task
=======================

@Scheduled(fixedRate = 60000) // Every 60 seconds
cleanupExpiredReservations()
  ├─ For all reservations:
  │  ├─ Check: expiresAt < now?
  │  └─ If yes: remove from storage
  ├─ Log: "X reservations removed"
  └─ Empty lists removed from map

Frontend doesn't need to know:
- Next updateReservations() call will reflect cleanup
- Expired reservations simply won't be in list
```

## Error Handling

### Frontend Error Scenarios

```javascript
// Maximum Units Error
try {
  await api.addToCart(product.id, 7); // User already has 5
} catch (error) {
  // error.response.data.error:
  // "Solo puedes reservar hasta 10 unidades. Ya tienes 5, intentas agregar 7"
  
  showNotification({
    type: 'error',
    message: error.response.data.error,
    duration: 5000
  });
}

// Stock Insufficient Error
try {
  await api.addToCart(product.id, 5); // Only 2 available
} catch (error) {
  // error.response.data.error:
  // "Stock insuficiente. Disponible: 2, Solicitado: 5"
  
  showNotification({
    type: 'error',
    message: error.response.data.error,
    duration: 5000
  });
}

// Unauthorized Error
try {
  await api.updateCartItem(othersItemId, 5);
} catch (error) {
  // error.response.status: 403
  // error.response.data.error: "No autorizado para modificar este item"
  
  showNotification({
    type: 'error',
    message: "No tienes permiso para modificar este item",
    duration: 5000
  });
}
```

### Status Codes

| Code | Scenario | Frontend Action |
|------|----------|-----------------|
| 200 | Success | Update state, show success notification |
| 201 | Created | Update state, show success notification |
| 400 | Validation error | Show error message from backend |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show "Not authorized" error |
| 404 | Not found | Show "Item not found" error |
| 500 | Server error | Show "Something went wrong" error |

## State Management

### CartContext Structure

```javascript
{
  items: [
    {
      id: 1,
      productId: 100,
      productName: "Anime Figure",
      quantity: 5,
      price: 50000,
      reserved: true,
      reservationId: "uuid-123",
      expiresAt: "2024-12-25T10:30:00"
    }
  ],
  total: 250000,
  itemCount: 1,
  loading: false,
  error: null
}
```

### useStockReservation Hook

```javascript
const {
  reservations,        // List of active reservations
  loading,            // Loading state
  error,              // Any error message
  validateCart,       // Validate current cart
  updateReservations, // Fetch latest from backend
  checkExpiringReservations, // Check expiration warnings
  isItemReserved      // Check if specific product reserved
} = useStockReservation();
```

## Authentication Flow

### Token Handling

```javascript
// Before API call
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};

// Backend validates with @PreAuthorize("isAuthenticated()")
// Extracts userId from JWT token
// Passes to service methods
```

### User Context

```java
// Backend
Long userId = securityutil.getCurrentUserId();

// Used in every service method
CartService.addItem(userId, request);
StockReservationService.getUserReservations(userId);
```

## Performance Optimizations

### Frontend

1. **Debouncing Quantity Updates** (500ms)
   ```javascript
   const debouncedUpdate = useDebounce(
     (qty) => updateQuantity(itemId, qty),
     500
   );
   ```

2. **Memoized Components**
   ```javascript
   const CartItem = React.memo(({ item, onUpdate }) => {
     // Only re-renders if item prop changes
   });
   ```

3. **Batch Reservation Checks** (5-second intervals)
   ```javascript
   useEffect(() => {
     const interval = setInterval(updateReservations, 5000);
     return () => clearInterval(interval);
   }, []);
   ```

### Backend

1. **In-Memory Cache** (ConcurrentHashMap)
   - No database hits for reservation checks
   - O(1) lookups

2. **Scheduled Cleanup** (60-second intervals)
   - Runs in background thread
   - Doesn't block user requests

3. **Transaction Management**
   - Atomic operations
   - No race conditions

## Debugging Tips

### Frontend Debugging

```javascript
// Check current cart
console.log('CartContext:', cartState);

// Check reservations
console.log('Reservations:', reservations);

// Check API response
api.addToCart(product.id, qty)
  .then(res => console.log('Success:', res.data))
  .catch(err => console.log('Error:', err.response.data));
```

### Backend Debugging

```java
// Enable logging
logging.level.com.otakushop.service=DEBUG

// Check reservation state
List<StockReservation> reservations = 
  stockReservationService.getUserReservations(userId);
logger.info("User reservations: {}", reservations);

// Check database state
List<CartItem> items = 
  cartItemRepository.findByUserId(userId);
logger.info("Cart items: {}", items);
```

### Network Debugging

```javascript
// Monitor all API calls
window.addEventListener('fetch', (event) => {
  console.log('API Request:', event.request);
});

// Check response details
fetch('/api/cart/reservations')
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    return res.json();
  })
  .then(data => console.log('Data:', data));
```

## Testing the Integration

### Test Case 1: Add Product
```
1. User is logged in
2. User navigates to product detail page
3. User enters quantity: 5
4. User clicks "Add to Cart"
5. ✓ POST /api/cart/add succeeds
6. ✓ CartContext updated with new item
7. ✓ useStockReservation.updateReservations() called
8. ✓ Reservation appears in list
9. ✓ Expiration time displayed
```

### Test Case 2: Checkout
```
1. User has items in cart with active reservations
2. User navigates to checkout
3. User fills checkout form
4. User clicks "Complete Purchase"
5. ✓ POST /api/checkout/validate succeeds
6. ✓ Reservations verified (quantity matches)
7. ✓ POST /api/checkout/process succeeds
8. ✓ Order created
9. ✓ Reservations released
10. ✓ CartContext cleared
11. ✓ Success message displayed
```

### Test Case 3: Expiration Warning
```
1. User adds product to cart
2. Reservation created for 14 days out
3. System advances time to 13 days in
4. Frontend checks expiration (checkExpiringReservations)
5. ✓ Warning triggered (< 24 hours remaining)
6. ✓ User sees notification
7. ✓ Encourage to checkout
```

## Deployment Checklist

Frontend:
- [ ] API base URL configured correctly
- [ ] Error handling for all scenarios
- [ ] Loading states implemented
- [ ] Success notifications functional
- [ ] Mobile responsive
- [ ] Browser compatibility tested

Backend:
- [ ] All endpoints tested with Postman
- [ ] Error messages clear and helpful
- [ ] Logging configured
- [ ] Database connection verified
- [ ] Cleanup task running
- [ ] Security headers set

Integration:
- [ ] Authentication flow works
- [ ] Cart operations synchronized
- [ ] Reservations persist correctly
- [ ] Expiration cleanup functional
- [ ] Checkout validation complete
- [ ] End-to-end flow tested

---

**Version**: 1.0
**Last Updated**: November 25, 2024
**Status**: ✅ Ready for Testing
