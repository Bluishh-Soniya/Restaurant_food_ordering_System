# IMPLEMENT.md

# RestroScan - QR Based Restaurant Ordering System

## Project Information

### Project Name

RestroScan

### Project Type

QR-Based Restaurant Menu Ordering System

### Tech Stack

#### Frontend

* React JS
* Axios
* React Router DOM

#### Backend

* Django
* Django REST Framework

#### Database

* PostgreSQL

#### Payment Gateway

* Razorpay (Test Mode → Production)

#### QR Generation

* QR Code Generator
* qrcode.react (Optional)

---

# Current Project Status

## Completed Features

### Frontend

* Landing Page
* Hero Banner
* Categories Section
* Trending Section
* Offers Section
* Menu Section
* Cart Functionality
* Responsive UI

### Backend

* Restaurant Model
* Category Model
* MenuItem Model
* Offer Model
* Banner Model
* Order Model
* OrderItem Model

### Database

* PostgreSQL Integration
* Order Storage
* Discount Calculation

---

# Missing Core Feature

Current Problem:

```text
Customer orders food

↓

Order stored

↓

Restaurant doesn't know
which table ordered
```

RestroScan's main concept is:

```text
Scan QR

↓

Website Opens

↓

Table Identified

↓

Customer Orders

↓

Order Saved With Table Number
```

Therefore:

Table Identification is the highest priority feature.

---

# Final System Architecture

```text
Customer
   │
   ▼
Scan QR Code
   │
   ▼
React Website
   │
Axios
   │
   ▼
Django REST API
   │
   ▼
PostgreSQL
```

---

# Phase 1 - Table Management

## Objective

Create restaurant tables that can be identified using QR codes.

## New Model

```python
class Table(models.Model):

    table_number = models.IntegerField(
        unique=True
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"Table {self.table_number}"
```

---

## Django Admin

Register Table model.

Restaurant can manage:

* Table 1
* Table 2
* Table 3
* Table 4
* Table 5

Future:

* Table 10
* Table 20
* Table 50

without changing code.

---

# Phase 2 - QR Architecture

## Concept

Every table gets a unique QR code.

Example:

```text
Table 1

QR
↓

restaurant/1/table/1
```

---

## URL Structure

```text
/restaurant/1/table/1

/restaurant/1/table/2

/restaurant/1/table/3

/restaurant/1/table/4

/restaurant/1/table/5
```

---

## QR Mapping

```text
Table 1
→ QR 1

Table 2
→ QR 2

Table 3
→ QR 3

Table 4
→ QR 4

Table 5
→ QR 5
```

Each QR opens a different URL.

---

# Phase 3 - Frontend Routing

## Install

```bash
npm install react-router-dom
```

---

## Route Structure

```jsx
<Route
 path="/restaurant/:restaurantId/table/:tableNumber"
 element={<Home />}
/>
```

---

## Read Parameters

```javascript
const {
  restaurantId,
  tableNumber
} = useParams();
```

Example:

```text
restaurantId = 1

tableNumber = 3
```

---

## Store Table Number

Store inside Local Storage.

```javascript
localStorage.setItem(
   "tableNumber",
   tableNumber
);
```

Purpose:

Customer can navigate through pages without losing table information.

---

# Phase 4 - Cart Integration

## Current Situation

```text
Cart

↓

Items only
```

---

## Required Change

Attach table number.

Example:

```json
{
  "table_number": 3,
  "items": [
    {
      "menu_item": 1,
      "quantity": 2
    }
  ]
}
```

---

# Phase 5 - Order Model Enhancement

## Current Model

```text
Order
 ├─ total_price
 └─ created_at
```

---

## New Model

```python
class Order(models.Model):

    table = models.ForeignKey(
        Table,
        on_delete=models.CASCADE
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    payment_id = models.CharField(
        max_length=200
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
```

---

# Order Status Tracking

## Status Values

```text
Pending
Preparing
Ready
Delivered
```

Default:

```text
Pending
```

Purpose:

Track order progress.

---

# Phase 6 - Razorpay Integration

## Objective

Accept online payments.

---

## Install

```bash
pip install razorpay
```

---

## Frontend Package

```html
https://checkout.razorpay.com/v1/checkout.js
```

---

# Payment Flow

```text
Customer

↓

Add To Cart

↓

Checkout

↓

Razorpay

↓

Payment Success

↓

Verify Signature

↓

Save Order
```

---

# Important Rule

DO NOT save order before payment.

Wrong:

```text
Cart

↓

Order Saved

↓

Payment
```

Correct:

```text
Cart

↓

Payment

↓

Verification

↓

Save Order
```

---

# Phase 7 - Payment APIs

## API 1

Create Razorpay Order

```http
POST /api/create-payment/
```

Responsibilities:

* Calculate amount
* Create Razorpay Order
* Return order_id

---

## API 2

Verify Payment

```http
POST /api/verify-payment/
```

Responsibilities:

* Verify signature
* Confirm payment

---

## API 3

Create Order

Only after verification.

Responsibilities:

* Save Order
* Save Order Items
* Save Table Number

---

# Phase 8 - Invoice Generation

## Objective

Generate invoice after successful payment.

---

## Invoice Contains

```text
Invoice Number

Order ID

Table Number

Items

Quantity

Total Amount

Payment Status

Date & Time
```

---

# Database Flow

```text
Customer

↓

Scan QR

↓

Open Website

↓

Store Table Number

↓

Browse Menu

↓

Add To Cart

↓

Checkout

↓

Razorpay Payment

↓

Payment Verification

↓

Create Order

↓

Save Order Items

↓

Generate Invoice
```

---

# Project Folder Impact

## Backend Changes

### models.py

Add:

* Table Model
* Order Status
* Payment ID

---

### serializers.py

Update:

* Order Serializer
* Table Serializer

---

### views.py

Create:

* Create Payment API
* Verify Payment API

---

### urls.py

Add:

* Payment Routes
* Table Routes

---

# Frontend Changes

## React Router

Add:

```text
/restaurant/:restaurantId/table/:tableNumber
```

---

## Axios

Add:

```text
Create Payment Request

Verify Payment Request

Create Order Request
```

---

## Cart

Attach:

```text
tableNumber
```

to checkout payload.

---

# Tools Required

## Backend

* Django
* DRF
* PostgreSQL
* Razorpay SDK

## Frontend

* React
* Axios
* React Router DOM

## Optional

* qrcode.react
* react-qr-code

---

# Final Features

✅ QR-Based Ordering

✅ Dynamic Tables

✅ Table-wise Orders

✅ Discount Management

✅ Razorpay Payment

✅ Order Status Tracking

✅ PostgreSQL Storage

✅ Django Admin Management

✅ Invoice Generation

✅ Responsive UI

---

# Recommended Implementation Order

##  1

* Create Table Model
* Register Admin
* Create Table APIs

## 2

* React Router Integration
* QR Architecture
* Store Table Number

##  3

* Cart Integration
* Order Model Enhancement
* Status Tracking

##  4

* Razorpay Integration
* Payment Verification

##  5

* Invoice Generation
* Testing
* Bug Fixing

---

# Success Criteria

A customer should be able to:

```text
Scan QR

↓

Open Restaurant Website

↓

Browse Menu

↓

Add Items To Cart

↓

Pay Online

↓

Place Order

↓

Order Saved With Table Number

↓

Invoice Generated
```

This completes the core RestroScan concept.
