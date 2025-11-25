# Stock Synchronization Test Guide

## System Status ✅

Both frontend and backend are running:
- **Backend**: http://localhost:8080/api (Spring Boot, Tomcat)
- **Frontend**: http://localhost:5174 (Vite dev server)
- **Database**: PostgreSQL (Connected and running)

## Test Scenarios

### Test 1: Verify Endpoints Are Responding
```bash
# Check if backend is alive
curl http://localhost:8080/api/products

# Check if frontend is being served
curl http://localhost:5174
```

### Test 2: Stock Synchronization Flow

#### 2a. Login Flow
1. Open http://localhost:5174 in browser
2. Login with existing account
3. **Expected**: Frontend calls `GET /stock-reservations/my-reservations` to load user's reservations from backend
4. **Check**: Open DevTools → Network tab → Filter by "my-reservations"

#### 2b. Add Item to Cart
1. Navigate to Products page
2. Add a product to cart (e.g., quantity 3)
3. **Expected Events**:
   - Item added to localStorage immediately (instant UX)
   - `reserveStock()` is called which:
     - Saves to localStorage first
     - Makes async call to `POST /stock-reservations/sync` in background
4. **Check**: Open DevTools → Network tab → Look for POST to `/stock-reservations/sync`
   - Payload should include the product reservation
   - Response should include `backendId` for the reservation

#### 2c. Periodic Sync (5 minutes)
1. Add items to cart
2. **Wait 5 minutes** OR manually trigger sync
3. **Expected**: `syncWithBackend()` runs automatically and syncs all reservations to backend
4. **Check**: Network tab for periodic POST calls to `/stock-reservations/sync`

### Test 3: Multi-User Stock Visibility

#### 3a. Single Window Test
1. Browser 1: Login
2. Browser 1: Add product X (quantity 2)
3. **Expected in Browser 1**: Stock decreases and shows in ProductCard
4. **Check**: ProductCard stock display updates

#### 3b. Two Browser Windows Test  
1. **Browser 1**: Login as User A
   - Navigate to Products
   - Note the stock for Product X (e.g., 50)
2. **Browser 2**: Login as User B (different user)
   - Navigate to Products
   - Note the stock for Product X (should be 50)
   - Add 5 units to cart
3. **Back to Browser 1**: Refresh page
   - **Expected**: Stock for Product X should now be 45 (50 - 5 reserved by User B)
4. **Check**: DevTools Network tab in Browser 1 shows:
   - `fetchProducts()` was called
   - Products have updated `reserved` counts

### Test 4: Checkout Validation

#### 4a. Insufficient Stock
1. Add product to cart (quantity = 10)
2. Another user reserves remaining stock
3. Try to checkout
4. **Expected**: 
   - `validateCheckout()` is called
   - Error message shows: "Not enough stock available"
   - Order is NOT created
5. **Check**: Network tab shows NO POST to `/api/orders`

#### 4b. Successful Checkout
1. Add product (quantity = 2)
2. Proceed to checkout
3. **Expected**:
   - `validateCheckout()` passes
   - Order is created via `POST /api/orders`
   - After success: `order_created` event is dispatched
   - ProductsPage listens and calls `fetchProducts()` to refresh stock
4. **Check** Network tab for:
   - POST to `/api/orders` (SUCCESS status)
   - ProductCard stock is refreshed

### Test 5: Order Completion Event

1. User A: Add product to cart
2. User A: Complete checkout and place order
3. **Expected Events**:
   - Backend creates order
   - Calls `releaseReservation()` (stock should be released)
   - Calls `POST /api/orders` which returns with order ID
   - Frontend dispatches `window.dispatchEvent(new CustomEvent('order_created'))`
4. **Check**:
   - Network tab shows order creation
   - ProductsPage receives event and refreshes products
   - Other users see updated stock

### Test 6: Offline Sync Capability

1. **Prerequisites**: Open application and make some cart changes
2. Open DevTools → Application tab → Local Storage
3. **Expected**: Should see entries like:
   ```
   reservation_<productId>: {productId, quantity, reserved, backendId}
   ```
4. Close frontend (keep it offline for a moment)
5. **Expected**: If backend unavailable, cart still works locally
6. Restart backend
7. **Expected**: Next sync will push all reservations to backend

### Test 7: Stock Calculation Correctness

1. Product has 10 units in stock
2. User A reserves 3 units
3. User B opens products page
4. **Expected in User B's cart**: Available stock = 10 - 3 = 7
5. **Verification**:
   - CartItem component calculates: `availableStock = stockInfo.available`
   - Where `stockInfo.available = totalStock - reserved`
   - Math is correct: 10 - 3 = 7 ✅

## Key API Endpoints to Monitor

### Frontend Calls These:
- `GET /api/products` - Fetch product list (with stock info)
- `GET /api/products/{id}` - Get product details
- `GET /stock-reservations/my-reservations` - Load user's reservations
- `POST /stock-reservations/sync` - Sync local reservations with backend
- `POST /api/orders` - Create order
- `POST /api/cart/add` - Add to cart
- `POST /api/cart/update` - Update cart item
- `DELETE /api/cart/{itemId}` - Remove from cart

### Backend Updates Stock:
- When reservation is created → `productStock.reserved += quantity`
- When order is placed → `productStock.stock -= quantity` AND releases reservation
- When user removes from cart → `productStock.reserved -= quantity`

## Expected Console Logs

Check browser console for:
```javascript
// When adding to cart
"Stock reserved locally: productId, quantity"
"Attempting to sync with backend"

// When sync completes
"Stock sync successful"
"backendId: <id>" 

// When order is placed
"Order created: orderId"
"Releasing reservations"

// When loading reservations
"Loaded X reservations from backend"
```

## Debugging Commands

### In Browser Console:

```javascript
// Check local reservations
JSON.parse(localStorage.getItem('reservations'))

// Check all reservations
Object.keys(localStorage).filter(k => k.startsWith('reservation_'))

// Manually trigger sync
// (Find the stockReservationService in network and call: syncWithBackend())

// Check cart context
// (Will depend on how you expose it)
```

### In Backend Logs:

```
POST /stock-reservations/sync - User X syncing reservations
GET /stock-reservations/my-reservations - Loading User X's reservations
POST /orders - Creating order for User X
```

## Success Criteria ✅

- [ ] Frontend builds without Vite syntax errors
- [ ] Backend compiles and runs on port 8080
- [ ] Products page loads and displays correct stock
- [ ] Adding item to cart saves to localStorage
- [ ] Sync POST request appears in Network tab within 5 seconds
- [ ] Multi-user test shows stock updates across browsers
- [ ] Checkout validation prevents insufficient stock
- [ ] Order creation dispatches `order_created` event
- [ ] ProductsPage refreshes stock after order
- [ ] No console errors in browser DevTools
- [ ] No stack traces in backend logs (warnings about index OK)

## Common Issues & Solutions

### Issue: Sync endpoint returns 401 Unauthorized
**Solution**: Check that JWT token is being sent in Authorization header
- DevTools → Network → POST to sync endpoint → Headers → Authorization should exist
- Token should be in localStorage under `authToken` or similar

### Issue: Stock shows incorrect after adding to cart
**Solution**: Check if `stockInfo.available` is being calculated correctly
- Product must have `reserved` field in response
- CartItem must use: `availableStock = stockInfo.available` NOT `stockInfo.available + item.quantity`

### Issue: Order checkout fails silently  
**Solution**: Check validateCheckout is being called
- Open CheckoutPage component
- Verify `validateCheckout()` is destructured from useCart
- Check console for validation error messages

### Issue: Stock not syncing to backend
**Solution**: Verify sync endpoint exists
- Check StockReservationController has `POST /stock-reservations/sync`
- Verify endpoint is not returning 404
- Check request body includes `reservations` map

## Next Steps After Testing

1. ✅ Verify all tests pass
2. Run integration tests (if you create them)
3. Load test with multiple users
4. Test in production environment
5. Monitor logs for any errors
6. Gather performance metrics

---

## Test Execution Checklist

```
Date: ________________
Tester: ________________
Environment: Development ☐  Staging ☐  Production ☐

Test 1 - Endpoints: ☐ PASS ☐ FAIL
Test 2a - Login Flow: ☐ PASS ☐ FAIL  
Test 2b - Add to Cart: ☐ PASS ☐ FAIL
Test 2c - Periodic Sync: ☐ PASS ☐ FAIL
Test 3a - Single Window: ☐ PASS ☐ FAIL
Test 3b - Multi-User: ☐ PASS ☐ FAIL
Test 4a - Insufficient Stock: ☐ PASS ☐ FAIL
Test 4b - Successful Checkout: ☐ PASS ☐ FAIL
Test 5 - Order Event: ☐ PASS ☐ FAIL
Test 6 - Offline Sync: ☐ PASS ☐ FAIL
Test 7 - Stock Calculation: ☐ PASS ☐ FAIL

Overall Status: ☐ ALL PASS ☐ FAILURES FOUND

Issues Found:
- ________________________
- ________________________
```

