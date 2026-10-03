# NovaStore — Enterprise E-Commerce Platform & DevOps Infrastructure

![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=github-actions)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Kustomize-326CE5?logo=kubernetes)
![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus-E6522C?logo=prometheus)
![Tests](https://img.shields.io/badge/Tests-33%20Passed-success?logo=jest)
![License](https://img.shields.io/badge/License-MIT-green)

A production-grade, fullstack E-Commerce web application implemented using the **MERN** stack and complete **DevOps** infrastructure, specifically designed for Agile Software Development and DevOps laboratory reference.

---

## 1. Project Overview

NovaStore implements the five core Agile e-commerce user stories:
1. **Search & Discover Products**: Full-text partial search, multi-factor filtering (categories, brands, price ranges, ratings), sorting, and server-side pagination.
2. **Add & Manage Shopping Cart**: Server-side stock availability validation, live item quantity increments/decrements, item removals, and automatic total calculations.
3. **Checkout & Place Order**: Delivery destination address management, order reviews, and defensive server-side price calculations (prices are never trusted from the client).
4. **Make Secure Payment**: Simulated payment gateway covering **UPI**, **Credit/Debit Card**, **Net Banking**, and **Cash on Delivery (COD)**, with interactive toggle to simulate payment failures.
5. **Track Orders & View History**: Interactive 6-stage order tracking stepper (*Order Placed* &rarr; *Confirmed* &rarr; *Packed* &rarr; *Shipped* &rarr; *Out for Delivery* &rarr; *Delivered*) with complete historical event logs.

---

## 2. Technology Stack

### Frontend
* **React 18** with **Vite** (JavaScript / JSX — no TypeScript, no Next.js)
* **Tailwind CSS** (modern glassmorphism, responsive grids, custom typography)
* **React Router DOM v6** (declarative public, customer-protected, and admin routes)
* **Lucide React** (modern iconography)
* **Fetch API** (custom wrapper handling cookies and JWT headers — no Axios)
* **React Context API** (`AuthContext` & `CartContext`)

### Backend
* **Node.js** & **Express.js** (Clean layered architecture: Controllers, Services, Models, Validators, Middlewares)
* **JWT Authentication** with HTTP-only cookies and Bearer fallback
* **bcryptjs** for salted password hashing
* **express-validator** for schema input validation
* **Helmet** (security headers) & **CORS**
* **Structured JSON Logging** with automated credential redaction
* **prom-client** for real-time Prometheus metrics exposition on `GET /metrics`

### Database
* **MongoDB** with **Mongoose ODM**
* Models: `User`, `Category`, `Product`, `Cart`, `Order`, `Payment`
* Full-text compound search indexes and indexing on frequently queried foreign keys

### DevOps & Infrastructure
* **Docker & Docker Compose**: Multi-stage production builds and development hot-reloading configurations.
* **Kubernetes (k8s)**: Deployments, Services, StatefulSet with PersistentVolumeClaims, ConfigMaps, Secrets, Ingress, and Health/Readiness Probes.
* **GitHub Actions CI/CD**: Dual-pipeline architecture for testing, linting, building, container packaging, and deployment verification.
* **Ansible**: Provisioning host servers with Docker, configuring UFW firewalls, and orchestrating deployments.
* **Prometheus**: Metric scraping for latency histograms, request counters, error rates, and Node.js process metrics (*Grafana excluded by specification*).

---

## 3. High-Level Architecture

```
                             ┌──────────────────────┐
                             │  React + Vite Client │
                             └──────────┬───────────┘
                                        │ REST API (Fetch)
                                        ▼
                             ┌──────────────────────┐
                             │  Express.js Backend  │
                             └──────────┬───────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
  Authentication & JWT           Business Services          Request Validation
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        ▼
                             ┌──────────────────────┐
                             │   MongoDB Database   │
                             └──────────────────────┘
                                        ▲
                                        │ Scrapes /metrics
                             ┌──────────┴───────────┐
                             │      Prometheus      │
                             └──────────────────────┘
```

---

## 4. Repository Structure

```
.
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Auth & Cart Context providers
│   │   ├── hooks/                # Custom React hooks (useAuth, useCart)
│   │   ├── layouts/              # MainLayout and AdminLayout
│   │   ├── pages/                # Public, Customer & Admin pages
│   │   ├── routes/               # AppRoutes configuration
│   │   ├── services/             # Fetch API service layers
│   │   └── utils/                # Currency and date formatters
│   ├── Dockerfile                # Multi-stage production container
│   ├── nginx.conf                # Client-side SPA routing server
│   └── package.json
│
├── backend/                      # Express.js REST API
│   ├── src/
│   │   ├── config/               # MongoDB database connection
│   │   ├── controllers/          # Thin request controllers
│   │   ├── middleware/           # Auth, Admin, Validation, Error middlewares
│   │   ├── models/               # Mongoose schemas (User, Product, Order, etc.)
│   │   ├── routes/               # Modular Express routers
│   │   ├── seed/                 # Database seed script (21 products + users)
│   │   ├── services/             # Core business logic
│   │   ├── utils/                # Logger, token generator, order calculator
│   │   ├── app.js                # Express app & Prometheus configuration
│   │   └── server.js             # HTTP server entrypoint
│   ├── tests/                    # Jest + Supertest test suites
│   ├── Dockerfile                # Multi-stage Node runtime container
│   └── package.json
│
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.example.yaml
│   ├── mongodb-statefulset.yaml
│   ├── mongodb-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
│
├── monitoring/                   # Prometheus monitoring configuration
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── README.md
│
├── ansible/                      # Ansible automation playbooks
│   ├── inventory/
│   │   └── hosts.ini
│   ├── playbooks/
│   │   ├── setup-server.yml
│   │   └── deploy.yml
│   └── README.md
│
├── docs/                         # In-depth architectural documentation
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── database-schema.md
│   ├── deployment.md
│   ├── testing.md
│   └── devops-pipeline.md
│
├── .github/workflows/
│   ├── ci.yml                    # Automated tests & Docker builds
│   └── cd.yml                    # Registry push & k8s deployment
│
├── docker-compose.yml            # Production compose stack
├── docker-compose.dev.yml        # Development hot-reloading compose stack
├── .env.example                  # Root environment template
└── README.md                     # Project manual
```

---

## 5. Development Test Credentials

The database seed script generates predefined accounts for lab evaluation:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@novastore.com` | `admin123` | Full access: Add/edit/delete products, update order status, view dashboard |
| **Customer 1** | `john@example.com` | `password123` | Browse, cart, checkout, payment simulation, order cancellation |
| **Customer 2** | `sarah@example.com` | `password123` | Standard customer account |

> **Tip**: The login page includes a **One-Click Autofill** button to instantly populate these credentials for grading.

---

## 6. Getting Started Locally

### Prerequisites
* **Node.js**: v18.x or v20.x
* **npm**: v9.x or v10.x
* **MongoDB**: Running locally on `mongodb://localhost:27017` (or Docker)

### Step 1: Clone Repository & Configure Environment
```bash
git clone <repository-url>
cd <repository-directory>

# Copy environment configuration files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 2: Install Backend & Seed Database
```bash
cd backend
npm install
npm run seed
npm start
```
*Backend starts on `http://localhost:5000`*

### Step 3: Install Frontend & Launch Development Server
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
*Frontend will be accessible at `http://localhost:5173`*

---

## 7. Running with Docker Compose

### Production Mode
Launches the full container stack (Frontend Nginx, Backend Express, MongoDB) with automated health checks:

```bash
docker compose up --build -d
```

* Frontend: `http://localhost:80`
* Backend API: `http://localhost:5000/api`
* Health Check: `http://localhost:5000/api/health`
* Prometheus Metrics: `http://localhost:5000/metrics`

### Development Mode (With Live Hot-Reloading)
```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## 8. Running Automated Tests

### Backend Tests (29 Tests via Jest & Supertest)
Backend tests execute against an isolated in-memory MongoDB engine (`mongodb-memory-server`):

```bash
cd backend
npm test
```

### Frontend Tests (Vitest & React Testing Library)
```bash
cd frontend
npm test
```

---

## 9. Kubernetes Deployment

Deploy all workloads into the `ecommerce` namespace using Kustomize:

```bash
kubectl apply -k k8s/
```

Verify pod statuses:
```bash
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
```

---

## 10. Prometheus Monitoring

To start scraping metrics:

```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus:v2.53.0
```

Access Prometheus at `http://localhost:9090`. Try querying:
```promql
sum(rate(http_requests_total[1m]))
```

---

## 11. Troubleshooting Guide

| Issue | Cause | Solution |
|---|---|---|
| `MongoServerSelectionError` | MongoDB service is not running | Ensure MongoDB is running locally on port 27017 or start via `docker run -d -p 27017:27017 mongo:7.0`. |
| `Not authorized` on Cart/Checkout | JWT cookie or Bearer token missing | Log in via `/login` or use the one-click customer demo credentials. |
| Ingress `novastore.local` not resolving | Hostname not added to local DNS | Add `127.0.0.1 novastore.local` to `/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`. |
| Port 5000 already in use | Stale Node process or another server | Stop conflicting process or change `PORT=5001` in `.env` and `frontend/.env`. |

---

## 12. License

This project is licensed under the [MIT License](LICENSE).