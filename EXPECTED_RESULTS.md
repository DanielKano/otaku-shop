# ✅ What You Should See (Validation Checklist)

## If Everything Works Correctly, You'll See:

### 1. **Open Frontend (http://localhost:5174)**
```
✅ Page loads without errors
✅ Navigation bar visible
✅ Login form or dashboard appears
✅ No red errors in browser console
✅ No 404 or 500 errors in Network tab
```

### 2. **Login**
```
✅ Click "Login" or "Sign In"
✅ Enter credentials
✅ Page redirects to dashboard/products
✅ Network tab shows: GET /api/stock-reservations/my-reservations ← IMPORTANT!
✅ Response status: 200 OK
✅ Response body includes: { "success": true, "reservations": [...] }
```
**Meaning**: Your cart was restored from backend database! ✅

---

### 3. **View Products Page**
```
✅ Products load with images
✅ Each product shows: Name, Price, Stock count
✅ Example: "Stock: 50" or similar
✅ No JavaScript errors in console
```

### 4. **Add Item to Cart**
```
BEFORE clicking "Add to Cart":
├─ Product shows: "Stock: 50"
│
CLICK "Add to Cart" (quantity = 1)
│
IMMEDIATELY AFTER:
├─ ✅ Item appears in cart sidebar
├─ ✅ Cart counter increases: "(1)" 
├─ ✅ Stock decreases: "Stock: 49"  ← INSTANT (from localStorage)
│
THEN (within 5 seconds):
├─ ✅ Network tab shows: POST /api/stock-reservations/sync
├─ ✅ Request payload: { "reservations": { "productId": { ... } } }
├─ ✅ Response: { "success": true, "backendIds": { "productId": "uuid-123..." } }
└─ ✅ Console shows no errors
```
**What this means**:
- Immediate UI update from localStorage ✅
- Background sync to backend happening ✅
- Backend assigned backendId ✅

---

### 5. **Multi-User Test (Open 2nd Browser/Tab)**

#### Browser 1:
```
✅ Logged in as User A
✅ Product X shows: Stock: 50
✅ Add 5 units to cart
✅ Cart shows 5 items
✅ Stock now shows: Stock: 45
```

#### Browser 2 (Open new private/incognito window):
```
✅ Login as User B (different user)
✅ Navigate to Products
✅ Check Product X stock
```

**EXPECTED in Browser 2**:
```
Product X should show: "Stock: 45" (NOT 50!)

This is the magic! ✨
User B sees that User A reserved 5 units,
so only 45 units are available for User B.
```

**If you see 50 instead of 45**:
- Either sync didn't complete
- Or backend isn't responding
- Refresh Browser 2 and check again

---

### 6. **Checkout Process**

#### If stock is available:
```
✅ Click "Checkout" button
✅ Review order page appears
✅ Your items are listed
✅ Total price calculated
✅ Click "Place Order"
✅ Network shows: POST /api/orders
✅ Response: { "orderId": 123, "status": "success" }
✅ Success message appears
```

#### If stock is NOT available:
```
✅ Click "Checkout" button
✅ Error message appears:
   "Not enough stock available for product X"
✅ Order is NOT created
✅ Network tab shows NO POST to /api/orders
   (validateCheckout prevented it) ✅
```

**Meaning**: The system prevented overbooking! ✅

---

### 7. **Stock Refresh After Order**

After successful order:
```
TIMELINE:
├─ 0s: Order created
├─ 0s: order_created event dispatched
├─ <1s: ProductsPage refreshes
├─ ✅ Stock counts update automatically
│
EXAMPLE:
Before: Product X "Stock: 44"
Order placed: 3 units
After: Product X "Stock: 41"  ← Automatic!
```

**Check**: If stock doesn't update, refresh page manually (Ctrl+R)

---

### 8. **Console Logs (F12 → Console)**

You should see:
```javascript
// On login:
"Loading reservations from backend..."
"Loaded 3 reservations"

// When adding to cart:
"Stock reserved locally: productId=123, quantity=1"
"Attempting to sync with backend"

// After sync:
"Stock sync successful"
"backendId: uuid-12345"

// No errors like:
"❌ Uncaught SyntaxError"
"❌ Cannot read property of undefined"
"❌ Failed to fetch"
```

**If you see errors**, take a screenshot and share them.

---

### 9. **Network Tab (F12 → Network)**

Filter by "stock" or "reservations":
```
✅ GET /api/stock-reservations/my-reservations
   Status: 200
   Time: 100-500ms
   Response: { "success": true, ... }

✅ POST /api/stock-reservations/sync
   Status: 200
   Time: 100-500ms
   Response: { "success": true, "backendIds": {...} }
```

**If you see 401 (Unauthorized)**:
- Check localStorage has "authToken" key
- Make sure you're logged in
- Try logging out and back in

**If you see 404 (Not Found)**:
- Backend might not be running
- Check http://localhost:8080/api is accessible
- Restart backend if needed

---

### 10. **Cart Display**

When you add items:
```
CART SIDEBAR SHOWS:
├─ Product 1 × 3      $15.00
├─ Product 2 × 1      $30.00
├─ Stock: 7 available  ← Shows available stock
├─ Subtotal: $45.00
├─ [Proceed to Checkout]
└─ [Clear Cart]

✅ Cart persists if you refresh page
✅ Cart items loaded from backend on login
✅ Stock count updates when you change quantity
```

---

### 11. **Loading Reservations on Login**

When you login:
```
SEQUENCE:
1. Login page → Input credentials
2. Click "Login"
3. Backend authenticates
4. Frontend gets JWT token
5. Frontend calls: GET /api/stock-reservations/my-reservations
6. Backend returns your saved cart
7. Your items appear in cart sidebar
8. Products show reduced stock

✅ This all happens AUTOMATICALLY
✅ No user action needed
✅ Your cart is restored from database
```

---

### 12. **Periodic Sync (5 minutes)**

Even if you don't interact:
```
TIMER: 0:00   (you add item to cart)
       ↓
TIMER: 5:00   (background sync runs)
       ↓
✅ POST to /api/stock-reservations/sync
✅ All cart items synced to backend
✅ No user action needed
✅ Happens in background

TIMER: 10:00  (sync runs again)
...
TIMER: every 5 minutes automatically
```

**To verify**: Keep Network tab open for 5+ minutes and watch for periodic POSTs.

---

## 📋 Complete Success Checklist

Print this and mark as you test:

```
TESTING CHECKLIST
Date: ________________

BASIC FUNCTIONALITY:
☐ Frontend loads without errors
☐ Backend is responding (Network tab shows requests)
☐ Can login successfully
☐ Dashboard/Products page displays

STOCK SYSTEM:
☐ Products show stock count
☐ Adding to cart updates stock immediately
☐ Network shows POST /stock-reservations/sync
☐ Response includes backendId

MULTI-USER:
☐ Browser 1: Add item, cart updates
☐ Browser 2: Can login as different user
☐ Browser 2: Sees reduced stock from Browser 1
☐ Refresh Browser 2: Still sees reduced stock

CHECKOUT:
☐ Can proceed to checkout
☐ validateCheckout is called
☐ Order created on valid stock
☐ Error shown on insufficient stock
☐ Stock updates after order

SYNC:
☐ Network shows GET /my-reservations on login
☐ Cart restored from backend
☐ Periodic sync runs (check after 5+ minutes)
☐ No errors in console or network

EDGE CASES:
☐ Refresh page: Cart is still there
☐ Multiple products: Stock updates for each
☐ Update quantity: Stock recalculates correctly
☐ Clear cart: Stock goes back to original

OVERALL: ☐ PASS ☐ FAIL

Notes:
_________________________________
_________________________________
```

---

## 🎯 Most Important Things to Look For

1. **Network Tab POST to `/stock-reservations/sync`** ← This is the key!
   - Should appear when you add to cart
   - Should show status 200
   - Should include backendId in response

2. **Multi-User Stock Visibility**
   - Browser 1 adds item
   - Browser 2 refreshes
   - Browser 2 should see reduced stock
   - If this works, the whole system works!

3. **No Error Messages**
   - Console should be clean
   - Network tab should show 200s (not 400s or 500s)
   - No "Failed to fetch" messages

4. **Stock Persists**
   - Refresh page → cart is still there
   - Close/reopen → cart is still there
   - Different browser → cart is still there (if same user)
   - This means backend is working!

---

## 🚨 Common Issues & What They Mean

### Issue: "Network shows 404 on sync request"
**Meaning**: Backend endpoint doesn't exist or isn't running
**Solution**: Restart backend server

### Issue: "Network shows 401 on sync request"
**Meaning**: JWT token is missing or invalid
**Solution**: Login again, make sure token is in localStorage

### Issue: "Stock doesn't update in Browser 2"
**Meaning**: Either sync didn't complete or not enough time passed
**Solution**: Wait 5+ seconds, then refresh Browser 2

### Issue: "Console shows 'Cannot read property of undefined'"
**Meaning**: Code is trying to access something that doesn't exist
**Solution**: Check browser console for which line, share screenshot

### Issue: "Checkout keeps saying 'not enough stock' even though there's stock"
**Meaning**: Either reserved count is wrong or validation is wrong
**Solution**: Check what validateCheckout is calculating (add console.log)

---

## ✅ Expected Outcomes

### Best Case (Everything Works):
```
✅ Add item → instant update
✅ Network shows sync request → backend stored it
✅ Browser 2 refresh → sees reduced stock
✅ Checkout → validates stock → creates order
✅ Product stock updates → order appears in order history
✅ No errors → console is clean
✅ All tests pass → system is ready
```

### Acceptable (Minor Issues):
```
⚠️ Add item → updates (maybe after 1-2 seconds) 
⚠️ Stock doesn't show immediately in other browser
  → Acceptable, refresh works
⚠️ One sync request fails
  → Retries after 5 minutes, acceptable
```

### Unacceptable (Critical Issues):
```
❌ Add item → nothing happens
❌ No network requests at all
❌ 404 or 500 errors in network
❌ JavaScript errors in console
❌ Crash when trying to checkout
```

---

## 🎬 Demo Scenario (Follow Step-by-Step)

If you want to demo the system working:

1. **Open 2 browser windows side-by-side**
2. **Both login as different users**
3. **Window 1**: Add 5 units of Product X
   - Show stock decreased in Window 1
   - Show Network POST to sync
4. **Window 2**: Refresh page
   - Show that stock is 5 less (from User 1's reservation)
   - This proves multi-user is working!
5. **Window 1**: Proceed to checkout
   - Show stock validation passes
   - Show order is created
6. **Window 2**: Refresh again
   - Show stock decreased again (order was placed)
7. **Talk about**: "This all works in real-time with multiple users!"

This 2-minute demo proves the system is working.

---

## 📸 Screenshots to Capture

For documentation, capture:
1. Products page with stock counts
2. Network tab showing POST /sync
3. Response showing backendId
4. Two browsers with different stock views
5. Checkout validation working
6. Success message after order

These screenshots prove the system is working.

---

**Go ahead and test!** 🚀

You should see all the expected behaviors above. If something doesn't match, check the debugging section in `STOCK_SYNC_TEST_GUIDE.md`.

