# MongoDB Database Schema Specification

This document details the MongoDB data models, schemas, relationships, and indexing strategies implemented in NovaStore via Mongoose ODM.

---

## 1. Entity-Relationship Overview

```
 ┌──────────────┐          1:N          ┌──────────────┐
 │     User     │───────────────────────│    Order     │
 └──────┬───────┘                       └──────┬───────┘
        │ 1:1                                  │ 1:N
        ▼                                      ▼
 ┌──────────────┐                       ┌──────────────┐
 │     Cart     │                       │   Payment    │
 └──────┬───────┘                       └──────────────┘
        │ N:M (items)
        ▼
 ┌──────────────┐          N:1          ┌──────────────┐
 │   Product    │───────────────────────│   Category   │
 └──────────────┘                       └──────────────┘
```

---

## 2. Collections & Schema Definitions

### 2.1 User (`users`)
Stores registered customer accounts and administrator credentials.

| Field | Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated document ID |
| `name` | String | - | Full customer name (max 60 chars) |
| `email` | String | Unique Index | Normalized lowercase email address |
| `password` | String | - | Salted bcrypt hash (`select: false` by default) |
| `phone` | String | - | Optional telephone contact |
| `role` | String | Index | `CUSTOMER` (default) or `ADMIN` |
| `addresses` | Array | - | Subdocuments: `{ street, city, state, postalCode, country, isDefault }` |
| `createdAt` | Date | - | Document creation timestamp |
| `updatedAt` | Date | - | Document modification timestamp |

---

### 2.2 Product (`products`)
Stores retail inventory catalog items with full-text search capability.

| Field | Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique product ID |
| `name` | String | Index (Text) | Product title |
| `description` | String | Text | Comprehensive technical specification |
| `price` | Number | Index (Asc) | Retail price in USD (min 0) |
| `category` | String | Index | Department category string |
| `brand` | String | Index (Text) | Manufacturer / brand |
| `rating` | Number | Index (Desc) | Average score (0 to 5.0, default 4.5) |
| `numReviews` | Number | - | Total review count |
| `stock` | Number | - | Available warehouse units |
| `image` | String | - | Product hero image URL |

**Indexes**:
* Compound text index on: `{ name: 'text', brand: 'text', description: 'text' }`
* Single indexes: `{ price: 1 }`, `{ rating: -1 }`, `{ category: 1 }`

---

### 2.3 Category (`categories`)
Product grouping classifications.

| Field | Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Category ID |
| `name` | String | Unique Index | Unique name (e.g. `Audio`, `Computing`) |
| `description`| String | - | Short departmental description |

---

### 2.4 Cart (`carts`)
Persistent shopping basket for authenticated users.

| Field | Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Cart ID |
| `user` | ObjectId | Unique Index | Reference to `User._id` |
| `items` | Array | - | Subdocuments: `{ product (ref: Product), quantity, price }` |
| `total` | Number | - | Sum total calculated from items |

---

### 2.5 Order (`orders`)
Records confirmed customer purchases, immutable financial totals, and lifecycle tracking.

| Field | Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Order ID |
| `user` | ObjectId | Index | Reference to purchasing `User._id` |
| `items` | Array | - | Subdocuments: `{ product, name, image, price, quantity }` |
| `shippingAddress` | Object | - | Embedded `{ street, city, state, postalCode, country }` |
| `subtotal` | Number | - | Server-verified sum of products |
| `tax` | Number | - | 8% standard tax rate |
| `deliveryCharge` | Number | - | $12 flat fee, or $0 if subtotal >= $100 |
| `discount` | Number | - | Applied promotion deduction |
| `total` | Number | - | Subtotal + Tax + Delivery - Discount |
| `paymentMethod` | String | - | `UPI`, `CARD`, `NET_BANKING`, `COD` |
| `paymentStatus` | String | Index | `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED` |
| `orderStatus` | String | Index | `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED` |
| `trackingEvents` | Array | - | Timeline events: `[{ status, message, timestamp }]` |

**Compound Indexes**:
* `{ user: 1, createdAt: -1 }`: Optimizes customer order history queries.
* `{ orderStatus: 1, createdAt: -1 }`: Optimizes admin order fulfillment queue.

---

### 2.6 Payment (`payments`)
Audit ledger for simulated payment gateway transactions.

| Field | Type | Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Payment document ID |
| `order` | ObjectId | Index | Reference to `Order._id` |
| `user` | ObjectId | Index | Reference to `User._id` |
| `method` | String | - | `UPI`, `CARD`, `NET_BANKING`, `COD` |
| `amount` | Number | - | Transacted amount |
| `status` | String | Index | `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED` |
| `transactionId` | String | Unique Index | Generated unique ledger ID (e.g. `TXN-...`) |
| `details` | Object | - | Sanitized metadata (`cardLast4`, `upiId`, `bankName`) |
