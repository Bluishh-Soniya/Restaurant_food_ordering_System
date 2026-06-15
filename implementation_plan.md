# RestroScan — Full Overhaul Plan

## Summary

Rebuild the order flow, clean the DB/code, add admin dashboard, integrate Razorpay, and polish UI — all in one pass.

---

## User Review Required

> [!IMPORTANT]
> **Razorpay credentials change**: You gave new keys (`rzp_test_T1oxnYBnlYBotP` / `0fVI49gNTYKCTbVNtDj4rtue`). I'll replace the old ones in both `.env` files and `settings.py`.

> [!WARNING]
> **Database migration reset**: Removing duplicate `Order`/`OrderItem` models from `menu/models.py` (keeping only `orders/models.py`) will require a migration. Existing data in those tables should be safe since `orders` app already has the real data.

> [!IMPORTANT]
> **Admin dashboard**: Building a full React-based admin at `/admin` in the frontend (separate from Django's `/admin/`). Login: `soniya` / `noddy1221`. This will be hardcoded for now (no Django auth). Let me know if you want Django-backed auth instead.

---

## Open Questions

1. **Table count** — How many tables does your restaurant have? I'll seed accordingly. (I'll default to 10 tables for now.)
2. **Parcel orders** — Should parcel orders show a "customer name" or "phone number" field, or just skip straight to payment?

---

## Proposed Changes

### Phase 1 — Order Flow (Dine/Parcel Prompt)

#### [MODIFY] [CartContext.js](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/context/CartContext.js)
- Remove the table number check from `addToCart` — users can browse and add items freely
- Add `orderType` and `tableNumber` state to context
- Add `setOrderType`, `setTableNumber` methods

#### [NEW] [OrderTypeModal.jsx](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/components/OrderTypeModal.jsx)
- Modal that prompts: "Dine In" or "Parcel"
- If "Dine In" → show table number input/selector
- If "Parcel" → close modal, proceed
- Appears when user first adds an item to cart (no table set yet)
- Stores choice in `CartContext` (NOT in URL, NOT in localStorage for security)

#### [NEW] [OrderTypeModal.css](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/components/OrderTypeModal.css)
- Premium glassmorphism modal with smooth animations

#### [MODIFY] [CheckoutPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/pages/CheckoutPage.jsx)
- Read `orderType` and `tableNumber` from CartContext instead of localStorage
- Show "Switch to Parcel" button if currently dine-in
- Send `order_type` and `table_number` (or null) in API call

#### [MODIFY] [CartPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/pages/CartPage.jsx)
- Show current order type badge (Dine In / Parcel) with switch option
- Remove old localStorage table badge

#### [MODIFY] [App.js](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/App.js)
- Remove old `useEffect` that sets `tableNumber = 1` in localStorage
- Remove `TableRedirect` route (old QR system)
- Add `/admin` route for admin dashboard

---

### Phase 2 — Database Cleanup

#### [MODIFY] [menu/models.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/menu/models.py)
- **Remove** `Order` and `OrderItem` classes (lines 122-146) — duplicates of `orders/models.py`
- **Remove** `qrcode` import and QR auto-generation from `Table.save()` — unnecessary complexity
- Keep: `Restaurant`, `Category`, `MenuItem`, `Offer`, `Banner`, `Table`

#### [MODIFY] [menu/serializers.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/menu/serializers.py)
- Remove `OrderSerializer` and `OrderItemSerializer` (lines 75-165) — duplicates
- Remove imports of `Order`, `OrderItem`
- Keep only `CategorySerializer` and `MenuItemSerializer`

#### [MODIFY] [orders/serializers.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/orders/serializers.py)
- Make `table_number` optional (`required=False, allow_null=True`) for parcel orders
- Skip table lookup when `order_type == 'parcel'`

#### [MODIFY] [orders/models.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/orders/models.py)
- This is the correct/canonical Order model — no changes needed

#### Run `makemigrations` + `migrate` after model cleanup

---

### Phase 3 — Dead Code Removal

#### [DELETE] [frontend/Home.js](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/Home.js)
- Orphan file in root, not used anywhere

#### [DELETE] [TableRedirect.js](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/pages/TableRedirect.js)
- Old QR-based table system, replaced by modal

#### [DELETE] [frontend/src/pages/MENU/menu.jsx](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/pages/MENU/menu.jsx)
- Likely orphan (MenuPage.jsx is the active one)

#### [MODIFY] [orders/views.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/orders/views.py)
- Remove old `create_order` view (orphan, not in any URL conf)

#### [MODIFY] [core/views.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/core/views.py)
- Fix missing import: `NewsletterSubscriber`

---

### Phase 4 — Admin Dashboard (Frontend)

#### [NEW] [AdminLogin.jsx](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/pages/admin/AdminLogin.jsx)
- Login form (username: `soniya`, password: `noddy1221`)
- Stores auth state in sessionStorage
- Premium dark UI

#### [NEW] [AdminDashboard.jsx](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/pages/admin/AdminDashboard.jsx)
- Dashboard with real data from backend APIs:
  - **Orders list** — status, type, items, total, payment status, timestamps
  - **Payment history** — razorpay IDs, amounts, status
  - **Menu management** — view items (read-only for now)
  - **Revenue stats** — today's sales, total orders, pending orders
- All connected to database via new admin APIs

#### [NEW] [AdminDashboard.css](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/pages/admin/AdminDashboard.css)
- Dark theme, modern dashboard UI

#### Backend: New Admin APIs

#### [MODIFY] [menu/views.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/menu/views.py)
- Add `AdminOrdersView` — GET all orders with filters
- Add `AdminOrderUpdateView` — PATCH order status
- Add `AdminStatsView` — revenue, order counts
- Clean up old duplicate order create view

#### [MODIFY] [menu/urls.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/menu/urls.py)
- Add admin API routes

#### [MODIFY] [api.js](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/src/services/api.js)
- Add admin API calls: `fetchOrders`, `updateOrderStatus`, `fetchStats`

---

### Phase 5 — Razorpay Integration (New Credentials)

#### [MODIFY] [backend/.env](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/.env)
- Update keys to new values

#### [MODIFY] [frontend/.env](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/frontend/.env)
- Add `REACT_APP_RAZORPAY_KEY_ID=rzp_test_T1oxnYBnlYBotP`
- Remove secret from frontend (it should only be on backend)

#### [MODIFY] [settings.py](file:///c:/Users/DELL/OneDrive/Desktop/RestroScan_Project/backend/Backendcode/Backendcode/settings.py)
- Already reads from env — no change needed

---

### Phase 6 — UI Consistency

- Ensure all pages use the same `#ff6b00` / `#ff5722` brand palette
- Consistent card styles, button styles, spacing
- Modal animations match the existing `fade-up` pattern
- Admin dashboard uses a dark theme that complements the user-facing light theme

---

## Verification Plan

### Automated Tests
```bash
cd backend/Backendcode
python manage.py makemigrations
python manage.py migrate
python manage.py check
```

### Manual Verification
1. Open `http://localhost:3000/` → browse menu → add item → modal appears (Dine/Parcel)
2. Select Dine → enter table → proceed to cart → verify badge shows table + switch option
3. Switch to Parcel → badge updates → checkout → Razorpay popup opens
4. Open `http://localhost:3000/admin` → login as soniya → see dashboard with orders
5. Verify URL never shows order type or table number
