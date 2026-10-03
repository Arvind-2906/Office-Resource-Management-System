# NovaStore REST API Specification

This document details all available REST endpoints exposed by the NovaStore backend service on port `5000`.

---

## 1. Response Standards

### 1.1 Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": { ... }
}
```

### 1.2 Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "success": false,
  "message": "Error description details",
  "error": "ErrorType"
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register User
* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
* **Access**: Public
* **Body**:
  ```json
  {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "password123",
    "phone": "+1 555-0199"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { "_id": "...", "name": "Alice Smith", "email": "alice@example.com", "role": "CUSTOMER" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 2.2 User Login
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Access**: Public
* **Body**:
  ```json
  {
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
* **Response `200 OK`**: Sets HTTP-only `token` cookie and returns user object with JWT token.

### 2.3 User Logout
* **Method**: `POST`
* **Endpoint**: `/api/auth/logout`
* **Access**: Public
* **Response `200 OK`**: Clears authentication cookie.

### 2.4 Current User Profile
* **Method**: `GET`
* **Endpoint**: `/api/auth/me`
* **Access**: Authenticated (Customer or Admin)
* **Headers**: `Authorization: Bearer <token>` or cookie.

---

## 3. Product Catalog Endpoints (`/api/products`)

### 3.1 List & Filter Products
* **Method**: `GET`
* **Endpoint**: `/api/products`
* **Access**: Public
* **Query Parameters**:
  * `search` / `q`: Keyword search term
  * `category`: Category name (e.g. `Audio`)
  * `brand`: Brand name (e.g. `AuraSound`)
  * `minPrice`: Minimum numeric price
  * `maxPrice`: Maximum numeric price
  * `minRating`: Minimum rating (e.g. `4`)
  * `sort`: `newest` | `price_asc` | `price_desc` | `rating_desc` | `name_asc`
  * `page`: Page index (default: `1`)
  * `limit`: Page size (default: `12`)
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Products fetched successfully",
    "data": {
      "products": [ ... ],
      "pagination": { "page": 1, "limit": 12, "total": 21, "totalPages": 2, "hasPrev": false, "hasNext": true }
    }
  }
  ```

### 3.2 Product Details
* **Method**: `GET`
* **Endpoint**: `/api/products/:id`
* **Access**: Public

### 3.3 Create Product
* **Method**: `POST`
* **Endpoint**: `/api/products`
* **Access**: Admin Only
* **Body**:
  ```json
  {
    "name": "Quantum Pro Display",
    "description": "4K Ultra-wide monitor",
    "price": 899.99,
    "category": "Electronics",
    "brand": "VisionCraft",
    "stock": 15,
    "image": "https://images.unsplash.com/..."
  }
  ```

### 3.4 Update Product
* **Method**: `PUT`
* **Endpoint**: `/api/products/:id`
* **Access**: Admin Only

### 3.5 Delete Product
* **Method**: `DELETE`
* **Endpoint**: `/api/products/:id`
* **Access**: Admin Only

---

## 4. Shopping Cart Endpoints (`/api/cart`)

### 4.1 Get User Cart
* **Method**: `GET`
* **Endpoint**: `/api/cart`
* **Access**: Authenticated

### 4.2 Add Item to Cart
* **Method**: `POST`
* **Endpoint**: `/api/cart`
* **Access**: Authenticated
* **Body**:
  ```json
  {
    "productId": "64f001122334455667788990",
    "quantity": 2
  }
  ```

### 4.3 Update Item Quantity
* **Method**: `PATCH`
* **Endpoint**: `/api/cart/:productId`
* **Access**: Authenticated
* **Body**: `{ "quantity": 3 }`

### 4.4 Remove Item from Cart
* **Method**: `DELETE`
* **Endpoint**: `/api/cart/:productId`
* **Access**: Authenticated

### 4.5 Clear Cart
* **Method**: `DELETE`
* **Endpoint**: `/api/cart`
* **Access**: Authenticated

---

## 5. Order Management Endpoints (`/api/orders`)

### 5.1 Create Order
* **Method**: `POST`
* **Endpoint**: `/api/orders`
* **Access**: Authenticated
* **Body**:
  ```json
  {
    "shippingAddress": {
      "street": "100 Innovation Way",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "country": "USA"
    },
    "paymentMethod": "CARD",
    "discountAmount": 0
  }
  ```

### 5.2 Get Customer Orders
* **Method**: `GET`
* **Endpoint**: `/api/orders`
* **Access**: Authenticated

### 5.3 Get Order Details
* **Method**: `GET`
* **Endpoint**: `/api/orders/:id`
* **Access**: Authenticated (Owner or Admin)

### 5.4 Cancel Order
* **Method**: `PATCH`
* **Endpoint**: `/api/orders/:id/cancel`
* **Access**: Authenticated (Allowed if status is `PENDING` or `CONFIRMED`)

---

## 6. Simulated Payment Endpoints (`/api/payments`)

### 6.1 Process Simulated Payment
* **Method**: `POST`
* **Endpoint**: `/api/payments`
* **Access**: Authenticated
* **Body**:
  ```json
  {
    "orderId": "64f001122334455667788990",
    "method": "CARD",
    "simulateFailure": false,
    "details": {
      "cardNumber": "4242424242424242"
    }
  }
  ```

### 6.2 Get Payment by Order ID
* **Method**: `GET`
* **Endpoint**: `/api/payments/:orderId`
* **Access**: Authenticated

---

## 7. Admin Control Endpoints (`/api/admin`)

### 7.1 Dashboard Telemetry & Stats
* **Method**: `GET`
* **Endpoint**: `/api/admin/dashboard`
* **Access**: Admin Only

### 7.2 Get All Orders (With Pagination)
* **Method**: `GET`
* **Endpoint**: `/api/admin/orders?status=PENDING&page=1&limit=20`
* **Access**: Admin Only

### 7.3 Update Order Status
* **Method**: `PATCH`
* **Endpoint**: `/api/admin/orders/:id/status`
* **Access**: Admin Only
* **Body**:
  ```json
  {
    "status": "SHIPPED",
    "message": "Package dispatched with tracking carrier"
  }
  ```

### 7.4 Get All Users
* **Method**: `GET`
* **Endpoint**: `/api/admin/users`
* **Access**: Admin Only

---

## 8. Health & Observability Endpoints

| Endpoint | Method | Access | Purpose |
|---|---|---|---|
| `/api/health` | GET | Public | General service health check (`UP`) |
| `/api/health/live` | GET | Public | Kubernetes liveness probe (uptime) |
| `/api/health/ready`| GET | Public | Kubernetes readiness probe (MongoDB connection) |
| `/metrics` | GET | Public | Prometheus text exposition format metrics |
