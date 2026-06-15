# RestroScan - Complete Setup Guide

## Backend Setup

### 1. Navigate to Backend
```bash
cd backend/Backendcode
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Check Database Connection
Make sure PostgreSQL is running with:
- Database: `Restroscan_db`
- User: `postgres`
- Password: `rootroot`
- Host: `localhost`
- Port: `5432`

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional - for Admin Panel)
```bash
python manage.py createsuperuser
```

### 6. Create Sample Tables in Admin Panel
After starting the server, go to http://localhost:8000/admin/
- Create tables 1-5 (Table model will auto-generate QR codes)

### 7. Start Backend Server
```bash
python manage.py runserver
```

Backend runs on: http://127.0.0.1:8000/

---

## Frontend Setup

### 1. Navigate to Frontend
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend Server
```bash
npm start
```

Frontend runs on: http://localhost:3000/

---

## API Endpoints

- `GET /api/home/` - Get menu, categories, offers, banners
- `GET /api/trending/` - Get trending items
- `GET /api/menu/filter/` - Filter by category
- `GET /api/tables/` - Get all tables with QR codes
- `POST /api/orders/` - Create order
- `POST /api/verify-payment/` - Verify Razorpay payment
- `GET /api/invoice/<order_id>/` - Get invoice

---

## Complete Order Flow

1. **Scan QR** → Customer scans table QR code
2. **Auto Redirect** → Lands on `/table/<number>` → Table stored in localStorage
3. **Browse Menu** → View categories, items, offers
4. **Add to Cart** → Must have table number
5. **Checkout** → Review order + tax calculation
6. **Payment** → Razorpay payment modal opens
7. **Invoice** → Generated after successful payment
8. **Order Tracking** → View in admin panel

---

## Test Mode Razorpay Credentials
- Key ID: `rzp_test_1DP5MM47F0sJbb`
- Key Secret: Provided in `.env`

Use test card: `4111 1111 1111 1111` (Expiry: Any future date, CVV: Any 3 digits)

---

## Database Schema

- **Table** - Restaurant tables with QR codes
- **MenuItem** - Food items with price & offers
- **Order** - Customer orders with payment status
- **OrderItem** - Items in each order
- **Invoice** - Generated after payment success
- **Offer** - Discounts for menu items
- **Category** - Menu categories
- **Banner** - Homepage banner

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL connection
- Run: `python manage.py migrate`
- Clear migrations and retry

### Frontend won't load tables
- Check backend running on `http://127.0.0.1:8000`
- Check CORS settings in Django
- Check browser console for errors

### Razorpay errors
- Verify keys in `.env` file
- Internet connection required
- Test mode only - no actual payment

---

**Status**: ✅ All 8 Phases Implemented & Ready to Run
