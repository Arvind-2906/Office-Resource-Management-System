# NovaStore Architectural Blueprint

## 1. System Overview

NovaStore is an enterprise-grade E-Commerce platform built upon the **MERN** (MongoDB, Express.js, React, Node.js) technology stack, engineered specifically for Agile Software Development and DevOps laboratory evaluation.

The system emphasizes:
- **Clean Layered Architecture**: Strict separation of concerns across controllers, domain services, data models, validation schemas, and middlewares.
- **Defensive Backend Calculations**: Financial calculations (subtotals, discounts, delivery fees, taxes, and final totals) are exclusively performed server-side to prevent client tampering.
- **Resilience & Observability**: Real-time Prometheus metrics exposition, tiered health probes, and structured JSON logs.

---

## 2. High-Level Architecture Diagram

```
                        ┌────────────────────────────────────────┐
                        │      Client Web Browser (React + Vite) │
                        └───────────────────┬────────────────────┘
                                            │ HTTP / JSON REST
                                            ▼
                        ┌────────────────────────────────────────┐
                        │      Ingress / Nginx Gateway           │
                        └─────────┬────────────────────┬─────────┘
                                  │                    │
                    Path: /api, /metrics          Path: /
                                  ▼                    ▼
                   ┌─────────────────────────┐  ┌──────────────────┐
                   │ Express REST API Backend│  │ Frontend Nginx   │
                   │ (Node.js Multi-Replica) │  │ Static Container │
                   └───────────┬─────────────┘  └──────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
     │ JWT Auth &   │   │ Business     │   │ Request      │
     │ Role Guard   │   │ Services     │   │ Validation   │
     └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │ Mongoose ODM
                               ▼
                   ┌─────────────────────────┐
                   │    MongoDB Database     │
                   │    StatefulSet / Volume │
                   └─────────────────────────┘
                               ▲
                               │ Scrapes /metrics
                   ┌───────────┴─────────────┐
                   │   Prometheus Monitoring  │
                   └─────────────────────────┘
```

---

## 3. Component Breakdown

### 3.1 Frontend Tier (`frontend/`)
* **Framework**: React 18 with Vite bundling.
* **Routing**: React Router DOM v6 with declarative public, customer-protected, and role-protected routes.
* **State Management**: React Context API (`AuthContext`, `CartContext`) decoupling local UI components from global auth/cart data.
* **Communication**: Native Fetch API wrapped inside a unified `api.js` abstraction (no external HTTP libraries like Axios).
* **Styling**: Tailwind CSS with custom glassmorphic components, high-contrast badges, and micro-interactions.

### 3.2 Backend Tier (`backend/`)
* **Controllers**: Thin request handlers that unwrap parameters, call domain services, and structure responses.
* **Services**: Stateful domain logic (inventory deduction, order total math, payment simulation).
* **Middleware**:
  * `authMiddleware`: Validates JWT from HTTP-only cookie or Bearer header.
  * `adminMiddleware`: Enforces `ADMIN` role access.
  * `validationMiddleware`: Aggregates Express-Validator errors.
  * `errorMiddleware`: Centralized exception handler formatting JSON output.
* **Observability**: Interceptor measuring request counts and latency histograms exposed via `GET /metrics`.

### 3.3 Database Tier (`MongoDB`)
* Indexed collections with automatic timestamping.
* ACID-like atomic operations for stock updates (`$inc: { stock: -qty }`).
* Compound text indexes for fulltext catalog search across name, brand, and descriptions.

---

## 4. Security Architecture

1. **Password Hashing**: Pre-save Mongoose hook hashing passwords using `bcryptjs` (salt factor 10).
2. **JWT Issuance**: Signed with a 256-bit secret, set via `HttpOnly` and `SameSite` cookies to neutralize XSS attacks.
3. **HTTP Headers**: Enforced using `helmet` for CSP, X-Frame-Options, and XSS filtering.
4. **Data Sanitization**: Logger redacts sensitive fields (`password`, `token`, `cardNumber`, `cvv`) from stdout.
