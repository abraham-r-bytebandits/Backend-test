# 📬 Postman API Testing Guide

**Base URL:** `https://backend-test-3-y2d6.onrender.com`

---

## 🔐 Authentication

Most protected endpoints require a **Bearer Token** in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

> **Tip:** After login, copy the `accessToken` from the response and use it in subsequent requests.

---

## 📁 API Modules Overview

| Module | Base Path |
|---|---|
| Auth | `/api/auth` |
| User | `/api/user` |
| Order | `/api/order` |
| Payment | `/api/payment` (not yet mounted — see note) |
| Products | `/api/product` (not yet mounted — see note) |
| Checkout OTP | `/api/checkout-auth` (not yet mounted — see note) |
| Guest | `/api/guest` (not yet mounted — see note) |

> ⚠️ **Note:** Only `/api/auth`, `/api/user`, and `/api/order` are currently mounted in `app.ts`. Payment, product, checkout-auth, and guest routes exist in code but need to be added to `app.ts` to be accessible.

---

## 1. 🔑 Auth Routes — `/api/auth`

---

### 1.1 Signup

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/signup`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul.sharma@example.com",
  "password": "Test@1234",
  "phone": "9876543210",
  "line1": "123 MG Road",
  "line2": "Apt 4B",
  "city": "Bangalore",
  "state": "Karnataka",
  "postalCode": "560001",
  "country": "India"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent to email"
}
```

---

### 1.2 Verify Email (OTP)

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/verify-email`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "email": "rahul.sharma@example.com",
  "otp": "123456"
}
```

> ℹ️ Use the OTP received in your email after signup.

**Success Response (200):**
```json
{
  "message": "Account verified successfully"
}
```

---

### 1.3 Login

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/login`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "email": "rahul.sharma@example.com",
  "password": "Test@1234",
  "remember": true
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

> 💾 **Save both tokens!** You'll need `accessToken` for protected routes and `refreshToken` to get new access tokens.

---

### 1.4 Forgot Password

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/forgot-password`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "email": "rahul.sharma@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent"
}
```

---

### 1.5 Reset Password

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/reset-password`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "email": "rahul.sharma@example.com",
  "otp": "654321",
  "newPassword": "NewPass@5678"
}
```

**Success Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

---

### 1.6 Refresh Token

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/refresh`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOi..."
}
```

---

### 1.7 Logout

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/logout`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**Success Response (200):**
```json
{
  "message": "Logged out"
}
```

---

### 1.8 Google Auth

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/google`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "credential": "<google_id_token_from_frontend>"
}
```

> ℹ️ The `credential` value is a Google ID token obtained from the Google Sign-In button on the frontend. Hard to test in Postman without a real Google token.

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

---

### 1.9 Guest Checkout (Auth Route)

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/guest-checkout`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "fullName": "Guest User",
  "email": "guest@example.com",
  "phone": "9000012345",
  "address": "456 Park Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "country": "India",
  "items": []
}
```

**Success Response (200):**
```json
{
  "message": "Guest checkout stored successfully"
}
```

---

### 1.10 Get Me (Current User)

- **Method:** `GET`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/auth/me`
- **Auth Required:** ✅ Yes

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Success Response (200):**
```json
{
  "publicId": "uuid-here",
  "email": "rahul.sharma@example.com",
  "profile": {
    "firstName": "Rahul",
    "lastName": "Sharma",
    "phone": "9876543210"
  },
  "addresses": [...]
}
```

---

## 2. 👤 User Routes — `/api/user`

> All user routes require `Authorization: Bearer <access_token>`

---

### 2.1 Get Profile

- **Method:** `GET`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/user/profile`
- **Auth Required:** ✅ Yes

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Success Response (200):**
```json
{
  "publicId": "uuid",
  "email": "rahul.sharma@example.com",
  "profile": {
    "firstName": "Rahul",
    "lastName": "Sharma",
    "phone": "9876543210",
    "gender": null,
    "dateOfBirth": null,
    "profileImage": null
  }
}
```

---

### 2.2 Update Profile

- **Method:** `PUT`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/user/profile`
- **Auth Required:** ✅ Yes

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Request Body (JSON):**
```json
{
  "firstName": "Rahul",
  "lastName": "Kumar",
  "phone": "9123456789",
  "dateOfBirth": "1995-08-15",
  "gender": "MALE",
  "profileImage": "https://example.com/photo.jpg"
}
```

**Success Response (200):**
```json
{
  "accountPublicId": "uuid",
  "firstName": "Rahul",
  "lastName": "Kumar",
  "phone": "9123456789",
  "gender": "MALE",
  "dateOfBirth": "1995-08-15T00:00:00.000Z",
  "profileImage": "https://example.com/photo.jpg"
}
```

---

### 2.3 Get Address

- **Method:** `GET`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/user/address`
- **Auth Required:** ✅ Yes

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Success Response (200):**
```json
{
  "email": "rahul.sharma@example.com",
  "address": {
    "fullName": "Rahul Sharma",
    "phone": "9876543210",
    "line1": "123 MG Road",
    "line2": "Apt 4B",
    "city": "Bangalore",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India",
    "isDefault": true
  }
}
```

---

### 2.4 Delete Account

- **Method:** `DELETE`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/user/account`
- **Auth Required:** ✅ Yes

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Success Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

> ⚠️ **Warning:** This soft-deletes the account (marks status as DELETED). Use with caution during testing.

---

## 3. 🛒 Order Routes — `/api/order`

> All order routes require `Authorization: Bearer <access_token>`

---

### 3.1 Checkout (Create Order)

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/order/checkout`
- **Auth Required:** ✅ Yes

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Request Body (JSON):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "price": 2999,
      "quantity": 1
    },
    {
      "id": 2,
      "name": "Phone Case",
      "price": 499,
      "quantity": 2
    }
  ],
  "address": {
    "fullName": "Rahul Sharma",
    "phone": "9876543210",
    "address": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  }
}
```

**Success Response (200):**
```json
{
  "message": "Order created successfully",
  "orderId": 1,
  "razorpayOrder": {
    "id": "order_xyz123",
    "entity": "order",
    "amount": 430985,
    "currency": "INR",
    "receipt": "ORD-1234567890"
  },
  "amount": 4309.85
}
```

> 💡 **Amount calculation:** `subtotal + 8% tax + ₹9.99 shipping fee`

---

### 3.2 Get My Orders

- **Method:** `GET`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/order/order-details`
- **Auth Required:** ✅ Yes

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-1234567890",
    "status": "PENDING",
    "subtotal": 3997,
    "tax": 319.76,
    "shippingFee": 9.99,
    "totalAmount": 4326.75,
    "items": [
      {
        "id": 1,
        "name": "Wireless Headphones",
        "price": 2999,
        "quantity": 1,
        "total": 2999
      }
    ],
    "payments": [
      {
        "id": 1,
        "status": "PENDING",
        "gateway": "RAZORPAY",
        "refunds": []
      }
    ],
    "createdAt": "2026-02-24T00:00:00.000Z"
  }
]
```

---

### 3.3 Update Order Status (Admin/Vendor Only)

- **Method:** `PATCH`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/order/status/:orderId`
- **Example URL:** `https://backend-test-3-y2d6.onrender.com/api/order/status/1`
- **Auth Required:** ✅ Yes (ADMIN or VENDOR role)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body (JSON):**
```json
{
  "status": "SHIPPED"
}
```

**Available Statuses:**
| Status | Description |
|---|---|
| `PENDING` | Order placed, awaiting payment |
| `PAID` | Payment confirmed |
| `PROCESSING` | Order being prepared |
| `SHIPPED` | Order dispatched |
| `DELIVERED` | Order delivered |
| `CANCELLED` | Order cancelled |
| `REFUNDED` | Order refunded |

**Success Response (200):**
```json
{
  "message": "Order status updated",
  "order": {
    "id": 1,
    "status": "SHIPPED"
  }
}
```

---

## 4. 💳 Payment Routes — `/api/payment`

> ⚠️ **Note:** These routes exist in code but are **not yet mounted** in `app.ts`. Add `app.use("/api/payment", paymentRoutes)` to `src/app.ts` to enable them.

---

### 4.1 Create Razorpay Order

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/payment/razor-create`
- **Auth Required:** ✅ Yes

**Request Body (JSON):**
```json
{
  "orderId": 1
}
```

**Success Response (200):**
```json
{
  "razorpayOrder": {
    "id": "order_xyz123",
    "amount": 432675,
    "currency": "INR"
  }
}
```

---

### 4.2 Verify Payment

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/payment/razor-verify`
- **Auth Required:** ✅ Yes

**Request Body (JSON):**
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "computed_hmac_signature"
}
```

> ℹ️ The signature must be a valid HMAC-SHA256 hash. This is typically generated by Razorpay's frontend SDK after payment completion.

**Success Response (200):**
```json
{
  "message": "Payment verified successfully"
}
```

---

### 4.3 Request Refund

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/payment/refund`
- **Auth Required:** ✅ Yes

**Request Body (JSON):**
```json
{
  "orderItemId": 1
}
```

> ℹ️ The order must have status `DELIVERED` before a refund can be requested.

**Success Response (200):**
```json
{
  "message": "Refund request submitted successfully",
  "refund": {
    "id": 1,
    "status": "PENDING",
    "amount": 2999
  }
}
```

---

### 4.4 Update Refund Status (Admin/Vendor Only)

- **Method:** `PATCH`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/payment/refund/:refundId`
- **Example URL:** `https://backend-test-3-y2d6.onrender.com/api/payment/refund/1`
- **Auth Required:** ✅ Yes (ADMIN or VENDOR role)

**Request Body (JSON):**
```json
{
  "status": "APPROVED"
}
```

**Success Response (200):**
```json
{
  "message": "Refund updated successfully",
  "refund": {
    "id": 1,
    "status": "APPROVED"
  }
}
```

---

## 5. 📦 Product Routes — `/api/product`

> ⚠️ **Note:** Not yet mounted in `app.ts`. Add `app.use("/api/product", productRoutes)` to enable.

---

### 5.1 Get All Products

- **Method:** `GET`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/product/all`
- **Auth Required:** ❌ No

**Success Response (200):**
```json
[
  {
    "publicId": "uuid-1",
    "name": "Wireless Headphones",
    "description": "Premium noise-cancelling headphones",
    "price": 2999,
    "category": "Electronics",
    "stock": 50,
    "imageUrl": "https://example.com/headphones.jpg",
    "isActive": true
  }
]
```

---

### 5.2 Get Product by ID

- **Method:** `GET`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/product/:publicId`
- **Example:** `https://backend-test-3-y2d6.onrender.com/api/product/uuid-1`
- **Auth Required:** ❌ No

**Success Response (200):**
```json
{
  "publicId": "uuid-1",
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones",
  "price": 2999,
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/headphones.jpg"
}
```

---

### 5.3 Create Product (Admin)

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/product/`
- **Auth Required:** ❌ No (middleware not yet added)

**Request Body (JSON):**
```json
{
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones with 30-hour battery life",
  "price": 2999,
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/headphones.jpg"
}
```

**Success Response (201):**
```json
{
  "publicId": "uuid-here",
  "name": "Wireless Headphones",
  "price": 2999,
  "category": "Electronics",
  "stock": 50
}
```

---

## 6. 🔄 Checkout Auth Routes — `/api/checkout-auth`

> ⚠️ **Note:** Not yet mounted in `app.ts`. Add `app.use("/api/checkout-auth", checkoutAuthRoutes)` to enable.

Used for guest users who want to checkout using email OTP (without full registration).

---

### 6.1 Start Checkout (Send OTP)

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/checkout-auth/start`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "email": "newuser@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent",
  "isNewUser": true
}
```

---

### 6.2 Verify Checkout OTP

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/checkout-auth/verify`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "email": "newuser@example.com",
  "otp": "789012"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

---

## 7. 👥 Guest Routes — `/api/guest`

> ⚠️ **Note:** Not yet mounted in `app.ts`. Add `app.use("/api/guest", guestRoutes)` to enable.

---

### 7.1 Guest Checkout

- **Method:** `POST`
- **URL:** `https://backend-test-3-y2d6.onrender.com/api/guest/checkout`
- **Auth Required:** ❌ No

**Request Body (JSON):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "price": 2999,
      "quantity": 1
    }
  ],
  "address": {
    "fullName": "Guest User",
    "email": "guest@example.com",
    "phone": "9000099999",
    "address": "10 Brigade Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560025",
    "country": "India"
  }
}
```

**Success Response (200):**
```json
{
  "message": "Guest checkout created",
  "guestId": 1,
  "razorpayOrder": {
    "id": "order_guestxyz",
    "amount": 335465,
    "currency": "INR"
  },
  "amount": 3354.65
}
```

---

## 🧪 Recommended Testing Flow

Follow these steps in order for a complete end-to-end test:

```
1. POST /api/auth/signup          → Create user account
2. Check email for OTP
3. POST /api/auth/verify-email    → Verify account with OTP
4. POST /api/auth/login           → Get accessToken + refreshToken
5. GET  /api/auth/me              → Confirm user is logged in
6. GET  /api/user/profile         → View profile
7. PUT  /api/user/profile         → Update profile
8. GET  /api/user/address         → View shipping address
9. POST /api/order/checkout       → Place an order (get razorpayOrder)
10. GET  /api/order/order-details → View all orders
11. POST /api/auth/refresh        → Refresh access token
12. POST /api/auth/logout         → Logout
```

---

## ❌ Common Error Responses

| Status Code | Message | Cause |
|---|---|---|
| `400` | Missing required fields | Required body fields not provided |
| `400` | Email already exists | Signup with existing email |
| `400` | Invalid or expired OTP | Wrong or timed-out OTP |
| `400` | Invalid credentials | Wrong email or password on login |
| `401` | Unauthorized | Missing or invalid Bearer token |
| `403` | Account not active | Account not verified or deleted |
| `403` | Forbidden | Insufficient role permissions |
| `404` | User not found | Account doesn't exist |
| `500` | Internal error | Server-side issue |

---

## ⚙️ Postman Setup Tips

1. **Create a Collection** named `Backend API`
2. **Create an Environment** with variable:
   - `base_url` = `https://backend-test-3-y2d6.onrender.com`
   - `access_token` = *(set after login)*
   - `refresh_token` = *(set after login)*
3. **Set Authorization** on the collection level: `Bearer Token` → `{{access_token}}`
4. **Auto-save tokens** using a Post-response Script on the Login request:
   ```javascript
   const res = pm.response.json();
   pm.environment.set("access_token", res.accessToken);
   pm.environment.set("refresh_token", res.refreshToken);
   ```

---

*Generated for: `https://backend-test-3-y2d6.onrender.com` | Date: February 2026*
