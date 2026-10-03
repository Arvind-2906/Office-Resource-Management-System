# System Architecture: Office Resource Management System

## 1. High-Level Architecture Overview

The **Office Resource Management System** is built as a modular monolithic web application tailored for the **Agile Software Development and DevOps Lab**. It enforces a clean separation of concerns across a presentation layer (React + Vite), an API layer (Node.js + Express.js), and an operational database layer (MongoDB Atlas).

```
   ┌────────────────────────────────────────────────────────┐
   │                  Client Tier (Browser)                 │
   │           React 18 + Vite + Tailwind CSS               │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / JSON (REST APIs)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                  Web & Gateway Tier                    │
   │              Nginx (Production) / Vite Dev             │
   └───────────────────────────┬────────────────────────────┘
                               │ Reverse Proxy / API calls
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                  Application Tier                      │
   │               Node.js + Express.js                     │
   │  ┌──────────────────────────────────────────────────┐  │
   │  │ Middleware: JWT Auth, RBAC, Error, Logger       │  │
   │  ├──────────────────────────────────────────────────┤  │
   │  │ Controllers & Business Services:                 │  │
   │  │ • Auth & User RBAC     • Resource Management     │  │
   │  │ • Requests & Approvals • Allocation & Returns    │  │
   │  │ • Conflict-Free Booking• Maintenance Workflow    │  │
   │  │ • In-App Notifications • Activity Audit Logging  │  │
   │  └──────────────────────────────────────────────────┘  │
   └───────────────────────────┬────────────────────────────┘
                               │ Mongoose ODM (TLS / TCP)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                   Database Tier                        │
   │             MongoDB Atlas (Managed Cloud)              │
   └────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **Role-Based Access Control (RBAC) at the Core**:
   - Access policies are strictly enforced on backend routes and controller services, not just visually on frontend menus.
   - Any attempt by an employee to access admin endpoints returns an immediate `403 Forbidden` response.
2. **Conflict Prevention in Business Logic**:
   - Physical assets cannot be duplicated in active allocations.
   - Shared assets (rooms, projectors) use strict interval overlap arithmetic:
     $$\text{newStart} < \text{existingEnd} \land \text{newEnd} > \text{existingStart} \implies 409\text{ Conflict}$$
3. **Stateless JWT with Flexible Persistence**:
   - Authentication tokens are signed with HMAC SHA-256 and sent via HttpOnly cookie or Authorization Bearer header.
4. **Cloud-Native Containerization**:
   - Frontend and backend are packaged into lightweight Docker containers ready for deployment to any Kubernetes engine (K3s, EKS, or local Minikube).
