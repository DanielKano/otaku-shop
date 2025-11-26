# Cart Double-Deletion Fix - Session Date: 2025-11-26

## Problem Summary

When deleting cart items, the system was throwing a `StaleObjectStateException` (HTTP 500 error) when:
- The same cart item was deleted twice
- Two concurrent DELETE requests hit the backend for the same item
- The frontend made duplicate DELETE requests

The error was: `Row was updated or deleted by another transaction`

## Root Cause

1. **Frontend Issue**: `removeItem()` was making async DELETE requests without idempotency handling
2. **Backend Issue**: 
   - The `removeFromCart()` controller and `removeItem()` service method didn't handle the case where an item was already deleted
   - Hibernate's optimistic locking detected that the row no longer existed
   - This threw `StaleObjectStateException` which resulted in HTTP 500

## Solutions Applied

### 1. Backend: CartService.java

**File**: `backend/src/main/java/com/otakushop/service/CartService.java`

**Changes**:
- Added try-catch for `StaleObjectStateException` in `removeItem()` method
- Returns gracefully when item doesn't exist (idempotent behavior)
- Added null check before attempting to delete

```java
public void removeItem(Long userId, Long cartItemId) {
    log.debug("🔵 removeItem() STARTED - userId={}, cartItemId={}", userId, cartItemId);
    
    CartItem cartItem;
    try {
        cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException(...));
    } catch (ResourceNotFoundException e) {
        // If not found, return successfully (idempotent)
        log.warn("⚠️ Cart item {} not found, returning successfully (idempotent)", cartItemId);
        return;
    }
    
    // ... validation and processing ...
    
    try {
        // ... stock restoration ...
        cartItemRepository.deleteById(cartItemId);
        log.info("🟢 Cart item removed: cartItemId={}", cartItemId);
    } catch (org.hibernate.StaleObjectStateException | 
             org.springframework.orm.ObjectOptimisticLockingFailureException e) {
        // Already deleted by another transaction - this is OK
        log.warn("⚠️ StaleObjectState when removing cartItem {}: item was already deleted", cartItemId, e);
        // Do not rethrow - idempotent operation succeeded
    }
}
```

### 2. Backend: CartController.java

**File**: `backend/src/main/java/com/otakushop/controller/CartController.java`

**Changes**:
- Added specific exception handler for `ObjectOptimisticLockingFailureException` in `removeFromCart()` endpoint
- Returns HTTP 200 OK instead of 500 when item was already deleted
- Maintains proper REST semantics (DELETE is idempotent)

```java
@DeleteMapping("/{id}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id) {
    try {
        // ... deletion logic ...
        return ResponseEntity.ok(response);
    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
        // Item was already deleted by another transaction
        log.warn("⚠️ Item {} already deleted (StaleObjectState)", id);
        // Return 200 OK (idempotent DELETE succeeded)
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Item already deleted");
        return ResponseEntity.ok(response);
    }
}
```

### 3. Frontend: CartContext.jsx

**File**: `frontend/src/context/CartContext.jsx`

**Changes**:
- Improved error handling in `removeItem()` callback
- Added better documentation of async behavior
- Made the flow clearer for anonymous vs authenticated users

```javascript
const removeItem = useCallback((productId) => {
    setItems((prevItems) => {
        const item = prevItems.find((i) => i.id === productId)

        if (item) {
            // Authenticated: call backend (no waiting)
            if (user?.id && item.cartItemId) {
                console.debug('[CartContext] calling DELETE /cart/' + item.cartItemId)
                api.delete(`/cart/${item.cartItemId}`)
                    .then(res => console.debug('[CartContext] DELETE /cart response', res?.data))
                    .catch(error => {
                        console.warn('Error removing item from backend cart:', error)
                        // Still remove locally since backend will handle stock restoration
                    })
            } else if (!user?.id) {
                // Anonymous cart: no backend call needed
                console.debug('[CartContext] Removing from anonymous cart')
            }

            addNotification?.({
                message: 'Stock volvió al inventario.',
                type: 'info'
            })
        }

        // Remove from local state immediately
        const updatedItems = prevItems.filter((item) => item.id !== productId)
        saveCartToStorage(updatedItems)
        return updatedItems
    })
}, [addNotification, user?.id, saveCartToStorage])
```

## Testing

To verify the fixes work:

1. **Single Delete**: Add item to cart, then delete it → Should work (HTTP 200)
2. **Double Delete**: Try deleting the same item twice → Should work both times (HTTP 200)
3. **Rapid Deletes**: Quickly delete multiple items → All should succeed (HTTP 200)
4. **Stock Verification**: After deletion, check that stock is properly restored

## Build & Deploy

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/otaku-shop-backend-0.1.0.jar

# Frontend (already hot-reloaded)
cd frontend
npm run build
```

## Key Principles Applied

✅ **Idempotency**: DELETE operations can be safely retried
✅ **Graceful Degradation**: Backend handles concurrency issues gracefully  
✅ **Error Recovery**: 500 errors converted to 200 OK for idempotent operations
✅ **Stock Integrity**: Stock is restored even if item deletion fails
✅ **User Experience**: Users see consistent state even with network delays

## Remaining Considerations

- Frontend could add debouncing on rapid clicks to prevent duplicate requests
- Could implement request deduplication using request IDs
- Could add optimistic UI updates with rollback on error

