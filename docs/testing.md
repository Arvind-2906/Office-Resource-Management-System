# NovaStore Automated Testing Strategy & Execution

This document details the automated testing architecture, test suites, and execution instructions for the NovaStore platform.

---

## 1. Testing Philosophy

The application employs an automated pyramid testing strategy:
1. **Isolated Integration & API Tests (Backend)**: Tests REST endpoints end-to-end against an in-memory MongoDB engine (`mongodb-memory-server`), ensuring 100% test isolation with zero external database dependencies.
2. **Component & Flow Tests (Frontend)**: Evaluates React components using `vitest` and `@testing-library/react` within a headless `jsdom` virtual browser.
3. **Continuous Integration Guardrails**: CI pipelines automatically execute both test suites on every pull request and push to the primary branch.

---

## 2. Backend Test Suites (Jest & Supertest)

The backend test suite is located in `backend/tests/` and comprises **29 automated tests** covering all 5 core Agile user stories:

| Test File | Target Scope | Key Assertions |
|---|---|---|
| `auth.test.js` | User Registration & Authentication | Duplicate email prevention, password length enforcement, bcrypt hash verification, JWT cookie issuance, `/api/auth/me` guard |
| `product.test.js` | Search, Filtering, Sorting & Pagination | Keyword search regex, category filtering, min/max price range clamping, price asc/desc sorting, invalid ID 404s |
| `cart.test.js` | Shopping Basket Operations | Add to cart, quantity update, stock threshold validation (rejection of quantity > stock), item removal |
| `order_payment.test.js`| Checkout & Simulated Payments | Server-side total calculation, inventory deduction, payment SUCCESS status propagation, payment FAILED test case handling, order cancellation stock recovery |
| `admin_health.test.js` | Governance & Monitoring | Role-based authorization (403 for Customers on admin routes, 200 for Admin), order status transitions, `/api/health`, `/api/health/live`, `/api/health/ready`, and Prometheus `/metrics` exposition |

### Running Backend Tests

```bash
cd backend
npm test
```

### Generating Backend Coverage Reports

```bash
cd backend
npm run test:coverage
```

---

## 3. Frontend Test Suites (Vitest & React Testing Library)

The frontend test suite is located in `frontend/src/tests/` and verifies critical UI components:

| Test Suite | Assertions |
|---|---|
| `Navbar` | Verifies brand typography, search input presence, and navigation links |
| `ProductCard` | Verifies product image rendering, price formatting, stock status pills, and interactive cart additions |
| `OrderStatusTracker` | Verifies accurate rendering of all 6 fulfillment stages and active progress state |
| `Button` | Verifies button style variants, loading spinner states, and click event callbacks |

### Running Frontend Tests

```bash
cd frontend
npm test
```

### Running Frontend Tests in Watch Mode

```bash
cd frontend
npm run test:watch
```

---

## 4. End-to-End User Flow Verification Matrix

| Step | User Action | Expected System Result | Verified By |
|---|---|---|---|
| 1 | Register new customer account | Account created, JWT issued, redirected to home | `auth.test.js` |
| 2 | Search catalog for "Headphones" | Filtered product list returns 1 match | `product.test.js` |
| 3 | Add 2 units to cart | Item added, subtotal calculated server-side | `cart.test.js` |
| 4 | Attempt to order more than available stock | Rejection with HTTP 400 "Insufficient stock" | `cart.test.js` |
| 5 | Submit checkout shipping details | Order created in PENDING status, stock deducted | `order_payment.test.js` |
| 6 | Execute payment simulation (SUCCESS) | Payment logged, order confirmed, tracking updated | `order_payment.test.js` |
| 7 | Execute payment simulation (FAILURE) | Payment logged as FAILED, order status unchanged | `order_payment.test.js` |
| 8 | Cancel pending order | Order status CANCELLED, stock restored to product | `order_payment.test.js` |
| 9 | Customer attempts to access `/api/admin/dashboard` | Access blocked with HTTP 403 Forbidden | `admin_health.test.js` |
| 10| Administrator updates status to SHIPPED | Status updated and timeline event appended | `admin_health.test.js` |
