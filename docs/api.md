# REST API Specification: Office Resource Management System

Base URL: `/api`

All JSON responses follow a standardized envelope format:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {}
}
```

---

## 1. Authentication APIs (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Registers a new employee account (role is strictly set to `EMPLOYEE`). |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials and issues a JWT token. |
| `POST` | `/api/auth/logout` | Authenticated | Clears authentication token cookie. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current user profile. |

---

## 2. Resource Management APIs (`/api/resources`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/resources` | Authenticated | Lists all resources with search, category, status, and bookable filters. |
| `GET` | `/api/resources/:id` | Authenticated | Retrieves single resource details. |
| `POST` | `/api/resources` | **Admin Only** | Creates a new resource with a unique `resourceId`. |
| `PUT` | `/api/resources/:id` | **Admin Only** | Updates an existing resource's information. |
| `PATCH` | `/api/resources/:id/status` | **Admin Only** | Updates resource status (`AVAILABLE`, `INACTIVE`, etc.). |
| `DELETE` | `/api/resources/:id` | **Admin Only** | Deletes a resource (only permitted if not allocated/booked). |

---

## 3. Resource Request APIs (`/api/requests`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/requests` | Authenticated | Employees view own requests; Admins view all organization requests. |
| `GET` | `/api/requests/:id` | Authenticated | View request details by ID. |
| `POST` | `/api/requests` | **Employee Only** | Submits request for an available physical asset. |
| `PATCH` | `/api/requests/:id/approve` | **Admin Only** | Approves request, generates allocation, sets resource to `ALLOCATED`. |
| `PATCH` | `/api/requests/:id/reject` | **Admin Only** | Rejects request with mandatory explanation. |

---

## 4. Allocation & Return APIs (`/api/allocations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/allocations` | Authenticated | Employees view own allocations; Admins view all records. |
| `GET` | `/api/allocations/:id` | Authenticated | View specific allocation details. |
| `POST` | `/api/allocations` | **Admin Only** | Directly allocates an available resource to an employee. |
| `PATCH` | `/api/allocations/:id/return-request` | **Employee Only** | Submits return request for allocated asset. |
| `PATCH` | `/api/allocations/:id/confirm-return` | **Admin Only** | Confirms return, records condition, restores resource to `AVAILABLE`. |

---

## 5. Shared Resource Booking APIs (`/api/bookings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Authenticated | View bookings. Supports filter by `date` and `status`. |
| `GET` | `/api/bookings/:id` | Authenticated | View booking details. |
| `POST` | `/api/bookings` | Authenticated | Books room/equipment. Evaluates overlap; returns `409 Conflict` on overlap. |
| `PATCH` | `/api/bookings/:id/cancel` | Authenticated | Cancels a booking (Employee cancels own; Admin can cancel any). |

---

## 6. Maintenance APIs (`/api/maintenance`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Authenticated | View maintenance tickets. |
| `GET` | `/api/maintenance/:id` | Authenticated | View specific ticket details. |
| `POST` | `/api/maintenance` | Authenticated | Report an equipment issue. Sets resource to `UNDER_MAINTENANCE`. |
| `PATCH` | `/api/maintenance/:id/status` | **Admin Only** | Update ticket to `IN_PROGRESS` or `RESOLVED` (restores resource to `AVAILABLE`). |

---

## 7. User Management APIs (`/api/users`) - Admin Only

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | **Admin Only** | Lists all employees with search & department filter. |
| `GET` | `/api/users/:id` | **Admin Only** | Retrieves single user details. |
| `POST` | `/api/users` | **Admin Only** | Provisions an employee account. |
| `PUT` | `/api/users/:id` | **Admin Only** | Updates employee information. |
| `PATCH` | `/api/users/:id/status` | **Admin Only** | Activates or deactivates an employee account. |

---

## 8. Dashboard, Notifications & Audit APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | **Admin Only** | Aggregated resource counters, pending actions, and recent activity. |
| `GET` | `/api/dashboard/employee` | Authenticated | Personal allocated equipment, pending requests, upcoming bookings. |
| `GET` | `/api/notifications` | Authenticated | Retrieves in-app alerts for the current user. |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Marks a single notification as read. |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Marks all user notifications as read. |
| `GET` | `/api/activity` | **Admin Only** | Full system audit log trail. |
| `GET` | `/api/health` | Public | Liveness/readiness probe reporting database connection state. |
