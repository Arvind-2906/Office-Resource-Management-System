# Office Resource Management System (ORMS)

> **Agile Software Development and DevOps Lab Mini-Project**  
> Built with JavaScript (MERN Stack), Docker, Docker Compose, and Kubernetes (AWS EC2 + MongoDB Atlas).

---

## 1. Project Objective

The **Office Resource Management System** is a full-stack, enterprise-style web application designed to manage corporate resources (laptops, 4K monitors, meeting rooms, laser projectors, and printers). 

The primary academic objective of this project is to demonstrate **Agile development workflows** and **DevOps automation** while maintaining a clean, manageable business application built in pure JavaScript.

---

## 2. Core Capabilities & Business Rules

1. **Role-Based Access Control (RBAC)**:
   - Exactly two roles: **`ADMIN`** and **`EMPLOYEE`**.
   - Public signup strictly registers **`EMPLOYEE`** accounts.
   - Admin accounts are provisioned exclusively via secure database seeding or IT administration.
   - RBAC is enforced strictly at the API controller layer.
2. **Resource Allocation & Return**:
   - Physical equipment cannot be concurrently allocated to multiple employees (duplicate allocation prevention).
   - Approval of a request generates an active **Allocation** and updates the resource state to `ALLOCATED`.
   - Employees initiate return requests; Admins inspect hardware condition and confirm return, restoring state to `AVAILABLE`.
3. **Shared Resource Conflict Prevention**:
   - Meeting rooms and projectors enforce interval overlap validation:
     $$\text{newStart} < \text{existingEnd} \land \text{newEnd} > \text{existingStart}$$
   - Any conflicting booking is rejected with `409 Conflict`.
4. **Maintenance Workflow**:
   - Defective equipment is reported by employees (`PENDING`).
   - Resource status transitions immediately to `UNDER_MAINTENANCE` and cannot be booked or requested.
   - Resolving the ticket restores the resource to `AVAILABLE`.
5. **In-App Notifications & Audit Logs**:
   - Real-time in-app alerts for status updates, approvals, rejections, and check-ins.
   - Chronological audit logging of critical actions for administrator compliance.

---

## 3. RBAC Permissions Matrix

| Feature / Action | Admin | Employee |
|---|:---:|:---:|
| User Registration (Signup) | ❌ (Seeded/Admin Provisioned) | ✅ (Self-service) |
| Login / Logout / Profile | ✅ | ✅ |
| View Operations Dashboard | ✅ (Org-wide counters) | ✅ (Personal counters) |
| Add / Edit / Delete Resources | ✅ | ❌ (403 Forbidden) |
| Request Equipment Allocation | ❌ (Direct Allocation) | ✅ |
| Approve / Reject Requests | ✅ | ❌ (403 Forbidden) |
| Book Shared Rooms / Projectors | ✅ | ✅ |
| Cancel Bookings | ✅ (Any booking) | ✅ (Own bookings only) |
| Confirm Equipment Return | ✅ | ❌ (Initiate only) |
| Report Maintenance Issue | ✅ | ✅ |
| Update Maintenance Status | ✅ | ❌ (403 Forbidden) |
| View Employee Management | ✅ | ❌ (403 Forbidden) |
| View System Audit Logs | ✅ | ❌ (403 Forbidden) |

---

## 4. Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Fetch API.
- **Backend**: Node.js 22, Express.js, Mongoose ODM, JWT, bcryptjs, cookie-parser, CORS.
- **Database**: MongoDB Atlas (Cloud Database Cluster).
- **Monitoring & Observability**: Prometheus (scraping `/api/metrics`), Grafana (analytics dashboards on port 3000), prom-client.
- **CI / Automation**: GitHub Actions (Node.js setup, caching, integration testing with MongoDB service container, production build, Docker build verification).
- **Containerization**: Docker, Docker Compose, Nginx (Alpine multi-stage frontend).
- **Orchestration**: Kubernetes manifests (`k8s/` - Namespace, Deployments, Services, ConfigMaps, Secrets, Ingress, HPA, Prometheus, Grafana).
- **Testing**: Node.js Native Test Runner (`node:test`) + Supertest.

---

## 5. Repository Structure

```
office-resource-management/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions Continuous Integration pipeline
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, env.js
│   │   ├── controllers/     # auth, user, resource, request, allocation, booking, etc.
│   │   ├── middleware/      # authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── models/          # User, Resource, ResourceRequest, Allocation, Booking, etc.
│   │   ├── routes/          # Express route definitions
│   │   ├── seed/            # seedAdmin.js (initial admin, employee, and sample assets)
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # apiResponse, jwt, logger, metrics.js
│   │   ├── app.js           # Express app setup with /api/metrics
│   │   └── server.js        # Server listener
│   ├── tests/               # Automated integration & business logic tests
│   ├── Dockerfile           # Node 22 Alpine container with healthcheck
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI components, Header, Sidebar, Modal, Badge
│   │   ├── context/         # AuthContext, NotificationContext
│   │   ├── pages/           # Admin pages, Employee pages, Auth pages
│   │   ├── services/        # api.js Fetch client
│   │   ├── App.jsx          # Route hierarchy and RBAC guards
│   │   └── main.jsx
│   ├── Dockerfile           # Multi-stage build (Vite -> Nginx Alpine)
│   ├── nginx.conf           # SPA client routing and gzip compression
│   └── package.json
│
├── k8s/                     # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   ├── backend-hpa.yaml
│   ├── prometheus-configmap.yaml
│   ├── prometheus-deployment.yaml
│   ├── prometheus-service.yaml
│   ├── grafana-datasource-configmap.yaml
│   ├── grafana-deployment.yaml
│   ├── grafana-service.yaml
│   └── kustomization.yaml
│
├── docs/                    # Architecture, API, Database, DevOps, and Deployment docs
├── docker-compose.yml       # Local multi-container orchestration
├── .env.example
└── README.md
```

---

## 6. Getting Started

### Default Seed Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@office.com` | `Admin@123` |
| **Employee** | `employee@office.com` | `Employee@123` |

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/Arvind-2906/Office-Resource-Management-System.git
cd Office-Resource-Management-System
```
Ensure your root `.env` or `backend/.env` contains your MongoDB Atlas connection string:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/office_resource_db
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

### Step 2: Install & Seed Database
```bash
# Backend setup
cd backend
npm install
node src/seed/seedAdmin.js
npm run dev

# Frontend setup (in a separate terminal)
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 7. Running Automated Tests

Run backend integration and business logic tests:
```bash
cd backend
npm test
```
The test suite validates:
- ✅ Public signup strictly forces `EMPLOYEE` role.
- ✅ Non-admin users are blocked with `403 Forbidden` from resource creation.
- ✅ Overlapping bookings are rejected with `409 Conflict`.
- ✅ Adjacent bookings are accepted.
- ✅ Physical equipment duplicate allocation is prevented.

---

## 8. Docker & Docker Compose Deployment

Run the complete stack in Docker:
```bash
docker compose up --build
```
Access the application:
- Frontend: `http://localhost` (or `http://localhost:5173`)
- Backend Health Check: `http://localhost:5000/api/health`

---

## 9. Kubernetes Deployment

Deploy to Kubernetes (Minikube, Docker Desktop, or Cloud K8s):
```bash
# Deploy all resources (App + Ingress + HPA + Prometheus + Grafana)
kubectl apply -k k8s
```
Or apply individually:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/backend-hpa.yaml
kubectl apply -f k8s/prometheus-configmap.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus-service.yaml
kubectl apply -f k8s/grafana-datasource-configmap.yaml
kubectl apply -f k8s/grafana-deployment.yaml
kubectl apply -f k8s/grafana-service.yaml
```

---

## 10. GitHub Actions CI Pipeline

Continuous Integration (CI) is implemented using **GitHub Actions** via `.github/workflows/ci.yml`.

### 1. Purpose of GitHub Actions
GitHub Actions automatically verifies code health, executes backend integration tests, compiles the frontend production bundle, and builds container images on every code update before changes can be merged or deployed.

### 2. Workflow Triggers
The CI pipeline executes on:
- Every `push` to `main` or `develop` branches.
- Every `pull_request` targeting `main` or `develop` branches.

### 3. CI Pipeline Stages
1. **Repository Checkout**: Retrieves source code using `actions/checkout@v4`.
2. **Node.js 22 Runtime Setup**: Configures Node.js 22 with automated npm dependency caching (`actions/setup-node@v4`).
3. **Backend CI**:
   - Clean dependency installation using `npm ci`.
   - Executes automated tests via `npm test` against an isolated MongoDB service container (`mongo:6.0`).
   - Validates RBAC enforcement, duplicate allocation prevention, and booking overlap business logic without exposing production credentials.
4. **Frontend CI**:
   - Clean dependency installation via `npm ci`.
   - Production bundle compilation via `npm run build` using `VITE_API_URL=http://localhost:5000/api`.
5. **Docker Build Verification**:
   - Builds Backend image: `docker build -t office-resource-backend:ci ./backend`
   - Builds Frontend image: `docker build --build-arg VITE_API_URL=http://localhost:5000/api -t office-resource-frontend:ci ./frontend`
   - Confirms that Dockerfiles and production bundles build successfully in an isolated containerized environment.

### 4. Failure Behavior
The pipeline adheres to the **fail-fast** principle: if dependency installation fails, any backend test fails, the Vite build errors, or Docker build fails, the workflow immediately halts with a red ❌ failure status, blocking pull requests from merging.

### 5. DevOps Architecture & Tooling Distinction

| Tool | Role in this Project |
|---|---|
| **GitHub Actions** | **Automation / CI**: Runs automated tests, builds, and Docker validation on remote GitHub infrastructure. |
| **Docker** | **Containerization**: Packages frontend and backend services with their runtime environments into standardized container images. |
| **Docker Compose** | **Local Multi-Container Dev**: Coordinates multi-container startup (frontend + backend + local dev environments) on local machines. |
| **Kubernetes** | **Container Orchestration**: Manages pod scaling, rolling updates, self-healing, Service discovery, ConfigMaps, and Ingress routing. |
| **Prometheus** | **Metrics Collection**: Pulls time-series operational metrics from `/api/metrics` inside Kubernetes. |
| **Grafana** | **Observability Dashboards**: Visualizes real-time request rates, API latency, and CPU/memory utilization. |

### 6. Why Kubernetes Deployment is Currently Manual
- **Local Cluster Architecture**: The Kubernetes cluster runs locally via **Docker Desktop** on the developer's laptop (`localhost`).
- **Network Isolation**: GitHub-hosted runners run in GitHub's remote cloud environment and cannot reach a private developer's localhost Kubernetes API without insecure third-party tunnels or self-hosted runners.
- **Academic Separation of Concerns**: Keeping CI in GitHub Actions and deployment manual via `kubectl` ensures clean observability for grading and local development control.
- **Future Roadmap**: When moving to cloud-managed Kubernetes (such as AWS EKS), GitHub Actions can be seamlessly extended with a Continuous Deployment (CD) job using secure OpenID Connect (OIDC) or cluster credentials.

---

## 11. Monitoring & Observability (Prometheus & Grafana)

The project includes an enterprise-grade cloud-native monitoring architecture running natively inside the `office-management` Kubernetes namespace:

### Live Monitoring Endpoints

| Component | URL | Credentials | Role |
|---|---|---|---|
| **Prometheus Web UI** | **`http://localhost:9090`** | None | Scrapes `/api/metrics` from `backend-service:5000` every 5 seconds. |
| **Grafana Dashboards** | **`http://localhost:3000`** | `admin` / `admin` | Real-time interactive visual graphs and alerts. |

### Key Metrics Tracked
- **`office_http_requests_total`**: Total API requests segmented by HTTP method (`GET`, `POST`), route (`/api/bookings`, `/api/resources`), and status code (`200`, `400`, `409`, `403`).
- **`office_http_request_duration_seconds`**: API latency histogram to detect slow database queries or bottlenecks.
- **Node.js Runtime Metrics**: Heap memory used (`office_nodejs_heap_size_used_bytes`), active event loop handles, and GC durations.

---

## 12. Viva Voce Highlights & Key Concepts

1. **Why MongoDB Atlas instead of containerized Mongo in Kubernetes?**
   - In production, databases require persistent replication, automated backups, and disk scaling. Managing stateful database pods inside ephemeral Kubernetes clusters adds unnecessary operational complexity. Connecting Kubernetes workloads to MongoDB Atlas follows the 12-factor cloud-native principle.
2. **How does the booking overlap algorithm work?**
   - Two intervals $[S_1, E_1)$ and $[S_2, E_2)$ intersect if and only if:
     $S_2 < E_1 \text{ and } E_2 > S_1$. If this condition is met for any active booking on the same resource and date, the API returns `409 Conflict`.
3. **How is RBAC secured against frontend tampering?**
   - The frontend role check only determines UI visibility. Every Express endpoint enforces `protect` (JWT validation) and `authorize('ADMIN')` (database verification of the user's role). Even if a user tampers with client-side state, unauthorized API requests return `403 Forbidden`.
4. **Why use an ephemeral MongoDB service container in CI?**
   - It eliminates the need to expose production MongoDB Atlas credentials or network IP whitelists inside GitHub Actions. Integration tests run against a pristine, temporary database container (`mongo:6.0`) initialized on the GitHub runner and destroyed when the workflow finishes.
5. **How does Prometheus discover and scrape Kubernetes workloads?**
   - Prometheus runs inside the same Kubernetes namespace and utilizes internal kube-DNS resolution to query `http://backend-service:5000/api/metrics`. Grafana is auto-provisioned via a ConfigMap volume mount to connect to `http://prometheus-service:9090` on boot.
