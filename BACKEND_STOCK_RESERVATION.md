# Backend Stock Reservation System Implementation

## Overview

This document details the backend implementation of the stock reservation system for Otaku Shop. The system manages product reservations with a 14-day expiration period, enforcing a maximum of 10 units per user, and ensuring proper stock validation across all cart and checkout operations.

## Architecture

### Key Components

#### 1. **StockReservationService** (`com.otakushop.service.StockReservationService`)
- **Purpose**: Central service for managing all stock reservations
- **Storage**: Thread-safe ConcurrentHashMap for in-memory reservation tracking
- **Automatic Cleanup**: Scheduled task that removes expired reservations every 60 seconds

#### 2. **CartService** (`com.otakushop.service.CartService`)
- **Purpose**: Manages shopping cart operations with integrated stock validation
- **Key Enhancement**: Now validates reservations and manages stock lifecycle
- **Methods Enhanced**:
  - `addItem()` - Creates stock reservations when items added
  - `updateItem()` - Manages reservation updates when quantities change
  - `removeItem()` - Releases reservations when items removed
  - `clearCart()` - Releases all reservations when cart cleared

#### 3. **CheckoutService** (`com.otakushop.service.CheckoutService`)
- **Purpose**: Validates and processes checkout orders
- **Key Enhancement**: Verifies active stock reservations during checkout
- **Method Enhanced**:
  - `validateCheckout()` - Now checks that user has valid reservations for all items

#### 4. **CartController** (`com.otakushop.controller.CartController`)
- **Purpose**: REST API endpoints for cart operations
- **New Endpoint**: `GET /api/cart/reservations` - Returns user's active reservations

## Database Design

### Reservation Storage Structure

```
Map<Long, List<StockReservation>> reservations
    ↓
    productId → [
        StockReservation {
            reservationId: String (UUID)
            productId: Long
            quantity: Integer
            userId: Long (optional, null for anonymous)
            sessionId: String (optional, for anonymous users)
            expiresAt: LocalDateTime (14 days from creation)
        },
        ...
    ]
```

## Implementation Details

### Reservation Constants

```java
// StockReservationService.java
private static final int RESERVATION_DURATION_MINUTES = 14 * 24 * 60; // 20160 minutes = 14 days
private static final int MAX_UNITS_PER_USER = 10; // Maximum units per user

// CartService.java
private static final int MAX_UNITS_PER_USER = 10;
```

### Key Methods

#### StockReservationService

**1. reserveStock()**
```java
public String reserveStock(Long productId, Integer quantity, Long userId, String sessionId)
```
- Creates a new stock reservation
- Returns unique reservation ID
- Supports both authenticated (userId) and anonymous (sessionId) users

**2. getUserProductReservation()**
```java
public Integer getUserProductReservation(Long userId, Long productId)
```
- Returns the quantity a user has reserved for a specific product
- Returns null if no reservation exists

**3. validateReservation()**
```java
public boolean validateReservation(Long userId, Long productId, 
                                   Integer currentQuantity, 
                                   Integer requestedQuantity, 
                                   Integer totalStock)
```
- Validates if a user can reserve additional quantity
- Checks: Max 10 units total + stock availability
- Returns false if validation fails

**4. reduceUserReservation()**
```java
public boolean reduceUserReservation(Long productId, Long userId, Integer quantityToReduce)
```
- Reduces or completely releases a user's reservation
- Automatically cleans up empty reservation lists

**5. getReservedQuantity()**
```java
public Integer getReservedQuantity(Long productId)
```
- Returns total quantity reserved for a product (active reservations only)

**6. getAvailableStock()**
```java
public Integer getAvailableStock(Long productId, Integer totalStock)
```
- Calculates stock available for new reservations
- Formula: `totalStock - reservedQuantity`

**7. getUserReservations()**
```java
public List<StockReservation> getUserReservations(Long userId)
```
- Returns all active (non-expired) reservations for a user
- Returns empty list if user has no reservations

**8. cleanupExpiredReservations()**
```java
@Scheduled(fixedRate = 60000) // Every 60 seconds
public void cleanupExpiredReservations()
```
- Automatic scheduled task
- Removes expired reservations every minute
- Logs count of removed reservations

### CartService Integration

#### addItem() - Add Product to Cart
```java
public CartItemDTO addItem(Long userId, CartItemRequest request)
```

**Validations**:
1. ✅ Maximum 10 units per user
2. ✅ Stock availability (considering existing reservations)
3. ✅ Create/update stock reservation

**Process**:
```
Request: AddProductRequest
    ↓
Validate quantity > 0
    ↓
Get current user quantity in cart
    ↓
Check: newTotal <= 10 units
    ↓
Check: stock available after existing reservations
    ↓
Reserve stock via StockReservationService
    ↓
Save CartItem to database
    ↓
Return CartItemDTO
```

**Example**:
```json
// Request
{
  "productId": 1,
  "quantity": 5
}

// Response (Success)
{
  "cartItem": {
    "id": 123,
    "productId": 1,
    "quantity": 5,
    "price": 50000
  },
  "total": 250000,
  "itemCount": 1,
  "message": "Producto agregado al carrito exitosamente"
}

// Response (Error - Max 10 units)
{
  "error": "Solo puedes reservar hasta 10 unidades. Ya tienes 8, intentas agregar 5"
}
```

#### updateItem() - Update Quantity in Cart
```java
public CartItemDTO updateItem(Long userId, Long cartItemId, Integer quantity)
```

**Validations**:
1. ✅ Item belongs to user
2. ✅ Quantity > 0
3. ✅ Quantity <= 10 units
4. ✅ Stock available (if increasing)

**Process**:
```
Request: New quantity
    ↓
Validate item ownership
    ↓
If quantity increases:
    Check max 10 units
    Check available stock
    Create/update reservation
    ↓
If quantity decreases:
    Reduce existing reservation
    ↓
Update CartItem
    ↓
Return CartItemDTO
```

**Example**:
```json
// Request: Increase from 3 to 5 units
{
  "quantity": 5
}

// Response (Success)
{
  "cartItem": {
    "id": 123,
    "quantity": 5
  },
  "total": 250000,
  "message": "Cantidad actualizada exitosamente"
}
```

#### removeItem() - Remove from Cart
```java
public void removeItem(Long userId, Long cartItemId)
```

**Process**:
```
Get CartItem
    ↓
Validate ownership
    ↓
Release stock reservation
    ↓
Delete CartItem from database
```

#### clearCart() - Clear All Items
```java
public void clearCart(Long userId)
```

**Process**:
```
Get all user's CartItems
    ↓
For each item:
    Release stock reservation
    ↓
Delete all CartItems for user
```

### CheckoutService Integration

#### validateCheckout() - Validate Order
```java
public Map<String, Object> validateCheckout(CheckoutRequest request)
```

**Validations** (in order):
1. User exists
2. All products exist
3. Stock available for each item
4. ✅ User has active reservations for all items (NEW)
5. Totals calculation correct
6. Minimum order amount ($10,000 COP)

**Example**:
```json
// Request
{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 3,
      "price": 50000
    }
  ],
  "subtotal": 150000,
  "shipping": 10000,
  "discount": 0,
  "tax": 17550,
  "total": 177550
}

// Response (Success)
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "calculatedSubtotal": 150000,
  "expectedTotal": 177550
}

// Response (Reservation Warning)
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Advertencia: No hay reserva completa para Product Name. Reservado: 2, Solicitado: 3"
  ]
}
```

## API Endpoints

### Cart Management

#### 1. Get Cart
```
GET /api/cart
Authorization: Bearer {token}
```

**Response**:
```json
{
  "items": [
    {
      "id": 1,
      "productId": 100,
      "productName": "Anime Figure",
      "quantity": 5,
      "price": 50000
    }
  ],
  "total": 250000,
  "itemCount": 1,
  "message": "Carrito obtenido exitosamente"
}
```

#### 2. Add to Cart
```
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 100,
  "quantity": 5
}
```

**Success Response** (201):
```json
{
  "cartItem": {
    "id": 1,
    "productId": 100,
    "quantity": 5,
    "price": 50000
  },
  "total": 250000,
  "itemCount": 1,
  "message": "Producto agregado al carrito exitosamente"
}
```

**Error Response** (400):
```json
{
  "error": "Solo puedes reservar hasta 10 unidades. Ya tienes 8, intentas agregar 5"
}
```

#### 3. Update Cart Item
```
PUT /api/cart/{itemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 7
}
```

**Response**:
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

#### 4. Remove from Cart
```
DELETE /api/cart/{itemId}
Authorization: Bearer {token}
```

**Response**:
```json
{
  "total": 0,
  "itemCount": 0,
  "message": "Item eliminado del carrito exitosamente"
}
```

#### 5. Get Stock Reservations
```
GET /api/cart/reservations
Authorization: Bearer {token}
```

**Response**:
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

#### 6. Clear Cart
```
DELETE /api/cart
Authorization: Bearer {token}
```

**Response**:
```json
{
  "message": "Carrito limpiado exitosamente"
}
```

## Validation Rules

### Maximum Units Per User

**Rule**: No user can reserve more than 10 units of any single product

**Enforcement Points**:
1. `CartService.addItem()` - Checks total quantity before adding
2. `CartService.updateItem()` - Validates update doesn't exceed 10
3. `StockReservationService.validateReservation()` - Utility validation method

**Error Message**:
```
"Solo puedes reservar hasta 10 unidades. Ya tienes {current}, intentas agregar {requested}"
```

### Reservation Duration

**Rule**: Reservations expire after 14 days (20160 minutes)

**Implementation**:
- Set at creation: `expiresAt = now + 14 days`
- Cleaned up automatically every 60 seconds
- Checked when retrieving user reservations

**Formula**:
```
RESERVATION_DURATION_MINUTES = 14 × 24 × 60 = 20,160 minutes
```

### Stock Availability

**Rule**: Cannot reserve more stock than available after considering all active reservations

**Calculation**:
```
availableStock = totalStock - sum(allActiveReservations)
canReserve = availableStock >= requestedQuantity
```

**Error Message**:
```
"Stock insuficiente. Disponible: {available}, Solicitado: {requested}"
```

## Transaction Management

All critical operations are wrapped in `@Transactional` annotations:

```java
@Transactional
public Order processCheckout(CheckoutRequest request) {
    // 1. Validate
    // 2. Create order
    // 3. Create order items
    // 4. Update product stock
    // 5. Release reservations
    // ...
}
```

**Benefits**:
- Atomicity: All operations succeed or all fail
- Consistency: Database always in valid state
- Isolation: Concurrent requests don't interfere
- Durability: Changes are persistent

## Error Handling

### Common Error Scenarios

#### 1. Max Units Exceeded
```java
if (newTotalQuantity > MAX_UNITS_PER_USER) {
    throw new IllegalArgumentException(
        String.format("Solo puedes reservar hasta %d unidades. Ya tienes %d, intentas agregar %d",
            MAX_UNITS_PER_USER, currentQuantity, request.getQuantity())
    );
}
```

#### 2. Stock Insufficient
```java
if (!stockReservationService.isStockAvailable(productId, quantity, stock)) {
    Integer available = stockReservationService.getAvailableStock(productId, stock);
    throw new IllegalArgumentException(
        String.format("Stock insuficiente. Disponible: %d, Solicitado: %d",
            available, quantity)
    );
}
```

#### 3. Unauthorized Item Modification
```java
if (!cartItem.getUser().getId().equals(userId)) {
    throw new SecurityException("No autorizado para modificar este item");
}
```

## Testing Scenarios

### Scenario 1: Basic Reservation (Happy Path)
```
User adds 5 units of Product A
    ✓ Quantity validation: 5 <= 10
    ✓ Stock validation: 5 available
    ✓ Reservation created
    ✓ CartItem saved
```

### Scenario 2: Maximum Units Exceeded
```
User has 8 units in cart
User tries to add 5 more units
    ✗ Validation: 8 + 5 = 13 > 10
    ✗ Error thrown
    ✓ No reservation created
    ✓ No CartItem saved
```

### Scenario 3: Stock Exhausted
```
Product has 3 units available
User tries to add 5 units
    ✗ Stock validation: 3 < 5
    ✗ Error thrown
    ✓ No reservation created
```

### Scenario 4: Update Increases Quantity
```
User updates from 5 to 8 units
    ✓ Max units check: 8 <= 10
    ✓ Stock check: 3 more units available
    ✓ Reservation updated
    ✓ CartItem updated
```

### Scenario 5: Checkout Validates Reservations
```
User adds 5 units, then initiates checkout
    ✓ validateCheckout() called
    ✓ Checks: user has 5 units reserved
    ✓ Validation passes
    ✓ Order processed
```

### Scenario 6: Cart Cleared (Release All Reservations)
```
User has 5 items in cart with reservations
User clears cart
    ✓ For each CartItem:
        ✓ Release reservation
        ✓ Delete CartItem
    ✓ All reservations released
```

### Scenario 7: Auto-Expiration
```
User creates reservation at time T
Reservation expires at T + 14 days
Cleanup task runs (every 60 seconds)
    ✓ Finds expired reservations
    ✓ Removes from storage
    ✓ Logs cleanup event
```

## Database Queries

### User Cart Items
```java
// Find all items in user's cart
List<CartItem> items = cartItemRepository.findByUserId(userId);

// Find specific item
Optional<CartItem> item = cartItemRepository.findByUserIdAndProductId(userId, productId);

// Clear cart
cartItemRepository.deleteByUserId(userId);
```

### Product Stock
```java
// Get product
Optional<Product> product = productRepository.findById(productId);

// Check stock
Integer stock = product.getStock();
```

### User Verification
```java
// Check user exists
boolean exists = userRepository.existsById(userId);

// Get user
Optional<User> user = userRepository.findById(userId);
```

## Performance Considerations

### 1. In-Memory Storage
- **Pro**: Fast O(1) lookups and updates
- **Con**: Lost on server restart (consider persistence layer upgrade)
- **Solution**: Implement database persistence for prod

### 2. Scheduled Cleanup
- **Frequency**: Every 60 seconds
- **Scope**: All products all users
- **Performance**: O(total_reservations)

### 3. Concurrent Access
- **Thread Safety**: `ConcurrentHashMap` used
- **No Locking**: No explicit locks needed
- **Scalability**: Better for high-concurrency scenarios

## Future Enhancements

### 1. Persistent Storage
```java
@Entity
public class StockReservation {
    @Id
    private String reservationId;
    private Long productId;
    private Integer quantity;
    private Long userId;
    private String sessionId;
    private LocalDateTime expiresAt;
}
```

### 2. Reservation Renewal
- Allow users to extend 14-day reservation
- Prevents auto-expiration during checkout

### 3. Overbooking Prevention
- Hard limit on total inventory
- Queue system for high-demand items

### 4. Analytics
- Track reservation patterns
- Monitor expiration rates
- Identify abandoned carts

### 5. Notifications
- Notify users before reservation expires (2 days before)
- Alert when stock runs low
- Confirm successful checkout

## Dependencies

```xml
<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

## Deployment Checklist

- [ ] Review all code changes
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Load test concurrent reservations
- [ ] Verify cleanup task runs correctly
- [ ] Test checkout with various reservation states
- [ ] Verify error messages are user-friendly
- [ ] Update API documentation
- [ ] Brief QA team on new flows
- [ ] Monitor logs after deployment
- [ ] Track reservation metrics

## Conclusion

The backend stock reservation system provides robust, production-ready management of product reservations with automatic expiration, maximum quantity enforcement, and seamless integration with existing cart and checkout workflows.
