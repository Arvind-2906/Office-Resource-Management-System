# Office Resource Management System (ORMS)

> **Agile Software Development and DevOps Lab Project**  
> A Cloud-Native Enterprise Resource Management Platform built with React, Node.js, Express, MongoDB Atlas, Docker, Docker Compose, Kubernetes, GitHub Actions CI, Prometheus, and Grafana.

---

## 1. Project Overview & Objectives

The **Office Resource Management System (ORMS)** is a full-stack, enterprise-grade web application engineered to streamline the tracking, allocation, and scheduling of corporate physical assets (laptops, monitors, printers) and shared office spaces (meeting rooms, conference halls, projectors).

### Core Academic & Engineering Goals:
1. **Agile Methodology Demonstration**: Tracked end-to-end using **Jira Software** with Epics, User Stories, Story Points estimation, 3-week Sprints, and Scrum Board workflows across a 3-member team.
2. **Containerization & Optimization**: Implemented multi-stage Docker builds to reduce image footprints by over **90%** (from ~300MB to ~25MB).
3. **Cloud-Native Container Orchestration**: High-availability deployment orchestrated via **Kubernetes (K8s)** manifests featuring self-healing deployments, internal service discovery, Ingress routing, Horizontal Pod Autoscaling (HPA), and ConfigMap/Secret decoupling.
4. **Automated Continuous Integration (CI)**: Zero-friction verification pipeline powered by **GitHub Actions** executing backend unit/integration tests with an isolated MongoDB service container, Vite production builds, and Docker build validations.
5. **Site Reliability & Observability**: Real-time instrumentation using **Prometheus** time-series scraping and visual operational analytics dashboards powered by **Grafana**.

---

## 2. Comprehensive DevOps Architecture, Toolchain & End-to-End Workflow

The **Office Resource Management System** integrates a modern, cloud-native DevOps toolchain designed to automate and monitor every phase of the software delivery lifecycle from planning to production.

---

### 2.1 Complete DevOps End-to-End Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       COMPLETE DEVOPS PIPELINE FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  [1. Agile Planning]          [2. Version Control]               [3. Automated CI Pipeline]
   ┌─────────────────┐          ┌────────────────────┐             ┌─────────────────────────┐
   │  JIRA SOFTWARE  │          │    GIT & GITHUB    │             │      GITHUB ACTIONS     │
   │ • 6 Epics       │ ───────> │ • Feature Branch   │ ──────────> │ • Setup Node.js 22      │
   │ • 23 Stories    │          │ • Semantic Commits │  Git Push   │ • Ephemeral MongoDB     │
   │ • 106 Points    │          │ • Pull Request     │  or PR      │ • npm test (7/7 Pass)   │
   │ • 3 Sprints     │          │ • Peer Review      │             │ • npm run build (Vite)  │
   └─────────────────┘          └────────────────────┘             │ • Docker Build Validate │
                                                                   └────────────┬────────────┘
                                                                                │
                                           Builds & Validates Images            │
                                                                                ▼
  [6. Observability & SRE]     [5. Orchestration & Runtime]       [4. Containerization]
   ┌─────────────────┐          ┌────────────────────┐             ┌─────────────────────────┐
   │   PROMETHEUS    │ <─────── │     KUBERNETES     │ <────────── │     DOCKER ENGINE       │
   │  & GRAFANA      │  Scrapes │ • office-management│  Deploy via │ • Multi-Stage Frontend  │
   │ • Pull /metrics │  every 5s│ • Backend (2 Pods) │  Kustomize  │   (Vite -> Nginx: 25MB) │
   │ • Target Health │          │ • Frontend (2 Pods)│  (kubectl)  │ • Node 22 Backend       │
   │ • Live Dashbrd  │ ───────> │ • Ingress & HPA    │             │ • Docker Compose Dev    │
   │   (Port 3000)   │ Visuals  │ • LoadBalancers    │             │   (Multi-Container)     │
   └─────────────────┘          └────────────────────┘             └─────────────────────────┘
```

---

### 2.2 Deep Dive: What Each DevOps Tool is Used For in this Project

#### 1. Atlassian Jira Software (Agile Planning & Scrum Tracking)
* **What it is used for**: Managing project requirements, breaking features into deliverable increments, and tracking sprint execution across the team.
* **Implementation in this project**:
  - **6 Epics**: High-level capability buckets (*Project Setup & Auth*, *Resource Management*, *Resource Requests & Allocation*, *Shared Resource Booking*, *Maintenance Management*, *Dashboard & Notifications*).
  - **23 User Stories**: Sized with Fibonacci Story Points (totaling **106 Story Points** across the project).
  - **3 Sprints**: Iterative development cadence with clear sprint goals (*Sprint 1: 24 pts*, *Sprint 2: 62 pts*, *Sprint 3: 20 pts*).
  - **Scrum Board**: Active tracking across columns (`To Do` $\rightarrow$ `In Progress` $\rightarrow$ `Done`) with assigned team members.
* **Why it matters**: Demonstrates real-world Agile team coordination and traceability from user story to deployed code.

#### 2. Git & GitHub (Source Code Management & Collaboration)
* **What it is used for**: Distributed version control, code history tracking, and team collaboration.
* **Implementation in this project**:
  - Remote repository: `https://github.com/Arvind-2906/Office-Resource-Management-System`.
  - Branching model: `main` (production-ready codebase) and `develop` (integration branch).
  - Pull Requests (PRs): Code changes are vetted through PR reviews before merging into protected branches.
* **Why it matters**: Ensures atomic commit histories, easy rollbacks, and triggers automated cloud CI pipelines on every push.

#### 3. Docker (Containerization & Image Optimization)
* **What it is used for**: Packaging the frontend and backend applications along with all their dependencies, runtime libraries, and configurations into portable, immutable container images.
* **Implementation in this project**:
  - **Backend (`backend/Dockerfile`)**: Built on `node:22-alpine` with `npm ci --only=production`, exposing port 5000 with a built-in healthcheck pinging `/api/health`.
  - **Frontend Multi-Stage Build (`frontend/Dockerfile`)**:
    - *Stage 1 (Builder)*: Uses `node:22-alpine` to compile React + Tailwind assets into production static bundles.
    - *Stage 2 (Production Web Server)*: Copies static bundles into an ultra-lean `nginx:1.25-alpine` container with custom gzip compression and SPA client-side routing fallback (`try_files $uri /index.html`).
    - *Optimization Result*: Reduces image footprint by over **90%** (slashing size from ~300MB down to **~25MB**).
* **Why it matters**: Eliminates environment discrepancies ("it works on my machine") and creates lightweight, production-ready artifacts.

#### 4. Docker Compose (Local Multi-Container Development)
* **What it is used for**: Rapid local development and testing of multi-container applications without requiring a full Kubernetes cluster.
* **Implementation in this project**:
  - Configured in `docker-compose.yml` to orchestrate frontend (port 80/5173) and backend (port 5000) services.
  - Connects containers through an isolated internal bridge network (`office-network`).
  - Supports one-command startup: `docker compose up --build -d`.
* **Why it matters**: Allows developers to spin up or tear down the entire application stack locally in seconds for offline testing.

#### 5. Kubernetes (Container Orchestration & High Availability)
* **What it is used for**: Managing, scaling, self-healing, and networking containerized workloads across a cluster.
* **Implementation in this project**:
  - **Namespace Isolation (`k8s/namespace.yaml`)**: All workloads run in the dedicated `office-management` namespace.
  - **High Availability Deployments**: Multi-replica pods for `backend-deployment` (2 replicas) and `frontend-deployment` (2 replicas).
  - **Self-Healing Probes**: Configured with `livenessProbe` and `readinessProbe` checking `/api/health` to auto-restart crashed containers.
  - **Networking & Services (`backend-service`, `frontend-service`)**: Exposes stable LoadBalancer endpoints on localhost ports 5000 and 80.
  - **ConfigMaps & Secrets**: Follows 12-factor cloud principles by decoupling runtime parameters (`office-app-config`) and sensitive credentials (`office-app-secrets`).
  - **Ingress (`k8s/ingress.yaml`)**: Host-based routing for `office.local` to unify frontend and backend traffic under a single entrypoint.
  - **Horizontal Pod Autoscaler (`k8s/backend-hpa.yaml`)**: Automatically scales backend pods from 2 to 5 replicas when CPU load exceeds 70%.
  - **Kustomize Bundle (`k8s/kustomization.yaml`)**: Enables single-command declarative deployment: `kubectl apply -k k8s`.
* **Why it matters**: Provides enterprise-grade resilience, zero-downtime rolling updates, and automated scaling.

#### 6. GitHub Actions (Continuous Integration / CI)
* **What it is used for**: Automating the validation, testing, compilation, and container build of every code push and pull request.
* **Implementation in this project**:
  - Configured in `.github/workflows/ci.yml`.
  - Runs on `push` and `pull_request` targeting `main` and `develop`.
  - Configures **Node.js 22** with automated `npm` dependency caching for fast build times.
  - Spins up a dedicated **ephemeral MongoDB service container** (`mongo:6.0` on port 27017) inside the GitHub runner to run backend integration tests cleanly without exposing cloud Atlas credentials.
  - Builds the production Vite frontend bundle with `VITE_API_URL=http://localhost:5000/api`.
  - Validates containerization by building both Docker images: `office-resource-backend:ci` and `office-resource-frontend:ci`.
  - **Fail-Fast Policy**: Instantly halts and flags broken builds with ❌, preventing bad code from merging into production.
* **Why it matters**: Ensures continuous software quality, detects regression bugs early, and enforces strict standards before deployment.

#### 7. Prometheus (Metrics Collection & Time-Series Monitoring)
* **What it is used for**: Pull-based operational telemetry collection, monitoring application performance and resource utilization.
* **Implementation in this project**:
  - Backend application is instrumented using `prom-client` in `backend/src/utils/metrics.js`.
  - Express middleware measures request duration and counts requests, exposing metrics at `GET /api/metrics`.
  - Prometheus runs as a Kubernetes pod (`k8s/prometheus-deployment.yaml`) and service on port 9090 (`http://localhost:9090`).
  - Scrapes `backend-service:5000/api/metrics` every 5 seconds using internal **kube-DNS** resolution.
  - Collects custom counters (`office_http_requests_total`), latency distribution histograms (`office_http_request_duration_seconds`), and Node.js process telemetry (heap memory, event loop lag, active socket handles, GC duration).
* **Why it matters**: Enables transparent real-time health inspection without adding latency to user requests.

#### 8. Grafana (Visualization, Dashboards & Observability)
* **What it is used for**: Converting raw Prometheus metrics into intuitive, visual, real-time charts, graphs, and alert dashboards.
* **Implementation in this project**:
  - Runs as a Kubernetes pod (`k8s/grafana-deployment.yaml`) and LoadBalancer service on port 3000 (`http://localhost:3000`).
  - **Automated Datasource Provisioning**: Pre-configures Prometheus (`http://prometheus-service:9090`) at container boot via `k8s/grafana-datasource-configmap.yaml` (zero manual setup needed).
  - **Auto-Provisioned Dashboard**: Pre-loads **"Office Resource Management - System Overview"** via `k8s/grafana-dashboard-configmap.yaml` featuring live panels:
    - *Total HTTP Requests* (Live request counter)
    - *API Throughput by Route* (Rate of requests per second by route and HTTP status code)
    - *p95 Response Time / Latency* (95th percentile latency histogram)
    - *Node.js Heap Memory* (RAM consumption in MB)
    - *Active Handles & Sockets* (Event loop connection tracking)
    - *HTTP 4xx & 5xx Error Tracking* (Instant visual detection of failed requests)
* **Why it matters**: Gives system administrators and DevOps engineers instantaneous visibility into system bottlenecks, traffic spikes, and application health.

---

### 2.3 The Complete Day-in-the-Life DevOps Flow

Here is how all 8 tools collaborate during a typical feature delivery cycle:

```
Step 1: Planning
Developer picks a User Story (e.g., ORMS-14: "Admin resource management interface") from Jira Backlog 
and transitions it from "To Do" to "In Progress".
      │
      ▼
Step 2: Local Development
Developer creates a feature branch (`git checkout -b feature/ORMS-14`), writes the code, 
and tests multi-container functionality locally using Docker Compose (`docker compose up -d`).
      │
      ▼
Step 3: Commit & Push
Developer commits changes using conventional commit messages and pushes to GitHub (`git push origin feature/ORMS-14`), 
then opens a Pull Request targeting `develop`.
      │
      ▼
Step 4: Automated CI Execution
GitHub Actions triggers automatically:
  • Runs `npm ci` and Node.js 22 setup with caching
  • Starts ephemeral MongoDB service container (`mongo:6.0`)
  • Runs automated test suite (`npm test`) -> validates RBAC and business logic
  • Compiles Vite frontend (`npm run build`)
  • Builds both Docker container images to verify Dockerfile validity
      │
      ▼
Step 5: Code Review & Merge
Upon all GitHub Actions checks turning green ✅, the Pull Request is reviewed and merged into `main`.
The corresponding Jira User Story is transitioned to "Done".
      │
      ▼
Step 6: Kubernetes Orchestration
The production images are deployed into the local Kubernetes cluster with a single command:
`kubectl apply -k k8s`.
Kubernetes rolls out updated pods with zero downtime, executing liveness/readiness health probes.
      │
      ▼
Step 7: Observability & SRE
Backend pods serve live traffic and expose `/api/metrics`.
Prometheus scrapes the endpoint every 5 seconds.
DevOps team monitors live traffic throughput, p95 latency, and memory utilization on Grafana (http://localhost:3000).
```

---

## 3. Application Features & Business Logic

### 1. Role-Based Access Control (RBAC)
- Two distinct authorization tiers: **`ADMIN`** and **`EMPLOYEE`**.
- Public self-service signup is strictly locked to create **`EMPLOYEE`** accounts.
- Administrative accounts are provisioned exclusively through secure database seeding or IT administrators.
- Access guards are dual-enforced: visually on the React client and cryptographically at the Express API controller layer.

### 2. Resource Catalog Management
- **Physical Assets**: Laptops, 4K Monitors, Printers, Hardware dongles. Tracked with serial IDs, categories, conditions, and availability states.
- **Shared Bookable Facilities**: Conference rooms, executive meeting spaces, laser projectors. Tagged as `isBookable: true`.

### 3. Equipment Request & Approval Workflow
- Employees browse available physical assets and submit allocation requests with justification notes.
- Admins review incoming requests (`PENDING`), set return dates, and approve or reject with custom feedback.

### 4. Hardware Allocation & Condition-Checked Returns
- **Duplicate Allocation Prevention**: Prevents concurrent allocation of the same asset to multiple employees.
- Return workflow: Employees initiate return requests; Admins inspect hardware physical condition upon return and confirm check-in, immediately restoring state to **`AVAILABLE`**.

### 5. Shared Resource Booking & Conflict Prevention Algorithm
- Meeting rooms and projectors enforce mathematical interval overlap validation:
  $$\text{newStart} < \text{existingEnd} \land \text{newEnd} > \text{existingStart}$$
- Conflicting time slots on the same date are rejected with **`409 Conflict`**.
- Adjacent time slots (e.g., 10:00–11:00 and 11:00–12:00) are accepted seamlessly.

### 6. Defective Hardware & Maintenance Lifecycle
- Employees can report broken or damaged assets directly (`/employee/maintenance`).
- Reporting an issue immediately flags the asset status as **`UNDER_MAINTENANCE`**, automatically taking it out of bookable circulation.
- Admins manage the repair ticket (`IN_PROGRESS` $\rightarrow$ `RESOLVED`), restoring the hardware to **`AVAILABLE`**.

### 7. Interactive Dashboards & Live Metrics
- **Admin Dashboard**: Organization-wide asset counts, pending request queues, upcoming bookings, and maintenance tickets.
- **Employee Dashboard**: Personal assigned hardware, upcoming personal bookings, and active request statuses.

### 8. In-App Notifications & Chronological Audit Logs
- Real-time in-app alert badges for status updates, approvals, rejections, and check-ins.
- Complete chronological system audit trail under `/admin/activity` tracking all operational events.

---

## 4. RBAC Permissions Matrix

| Feature / Action | Admin | Employee | Enforcement Mechanism |
|---|:---:|:---:|---|
| User Registration (Public) | ❌ (Seeded) | ✅ | API Controller forces `role: EMPLOYEE` |
| Login / Logout / Profile | ✅ | ✅ | JWT Cookie + Auth Middleware |
| Operations Dashboard | ✅ (Org-wide) | ✅ (Personal) | Role-specific API endpoints |
| Add / Edit / Delete Resources | ✅ | ❌ | API returns `403 Forbidden` |
| Request Equipment Allocation | ❌ (Direct) | ✅ | Employee request controller |
| Approve / Reject Requests | ✅ | ❌ | Admin authorization guard |
| Book Shared Rooms / Projectors | ✅ | ✅ | Overlap algorithm validation |
| Cancel Bookings | ✅ (Any) | ✅ (Own only) | User ID ownership check |
| Confirm Equipment Return | ✅ | ❌ (Initiate only) | Admin condition inspection |
| Report Maintenance Issue | ✅ | ✅ | Maintenance ticket creation |
| Update Maintenance Status | ✅ | ❌ | Admin repair workflow |
| View System Audit Logs | ✅ | ❌ | Admin-only audit endpoint |

---

## 5. Agile Project Management (Jira Software)

The project lifecycle was tracked in **Jira Software** using the Scrum framework across a 3-member team:

### Team Members:
1. **Arvind Patil (ICONIC)** (`arvindpatil.9206@gmail.com`) — DevOps, Backend Architecture & Pipeline Lead
2. **Arya Rane** (`arvyrane05@gmail.com`) — Frontend Architecture, UI/UX & React Component Lead
3. **Harsh Phale** (`phaleharsh90@gmail.com`) — Business Logic, Allocation & Workflow Validation Lead

### Summary Metrics:
- **Total Epics**: 6
- **Total User Stories**: 23
- **Total Story Points**: 106 Points *(24 pts Sprint 1 + 62 pts Sprint 2 + 20 pts Sprint 3)*
- **Total Sprints**: 3 Sprints (All completed and marked `Done`)

### Epic Breakdown:
1. **Epic 1 (`ORMS-1`)**: Project Setup & Authentication (24 Story Points)
2. **Epic 2 (`ORMS-2`)**: Resource Management (13 Story Points)
3. **Epic 3 (`ORMS-3`)**: Resource Requests & Allocation (23 Story Points)
4. **Epic 4 (`ORMS-4`)**: Shared Resource Booking (13 Story Points)
5. **Epic 5 (`ORMS-5`)**: Maintenance Management (11 Story Points)
6. **Epic 6 (`ORMS-6`)**: Dashboard & Notifications (20 Story Points)

---

## 6. Repository Architecture

```
office-resource-management/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI automated pipeline
│
├── backend/
│   ├── src/
│   │   ├── config/                    # db.js, env.js
│   │   ├── controllers/               # Auth, Resource, Request, Booking, etc.
│   │   ├── middleware/                # JWT authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── models/                    # Mongoose schemas (User, Resource, Booking, etc.)
│   │   ├── routes/                    # Express REST route definitions
│   │   ├── seed/                      # seedAdmin.js (Initial demo data)
│   │   ├── services/                  # Business logic (overlap detection, allocation)
│   │   ├── utils/                     # apiResponse, logger, metrics.js (Prometheus)
│   │   ├── app.js                     # Express app instance with /api/metrics & /api/health
│   │   └── server.js                  # HTTP server listener
│   ├── tests/                         # Automated integration & RBAC test suite (api.test.js)
│   ├── Dockerfile                     # Node 22 Alpine production container with healthcheck
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Modular UI cards, badges, modal, sidebar, header
│   │   ├── context/                   # AuthContext, NotificationContext
│   │   ├── pages/                     # Admin pages, Employee pages, Auth pages
│   │   ├── services/                  # api.js Fetch client with auth headers
│   │   ├── App.jsx                    # Route hierarchy & RBAC route guards
│   │   └── main.jsx
│   ├── Dockerfile                     # Multi-stage build (Vite builder -> Nginx 1.25 Alpine)
│   ├── nginx.conf                     # SPA client fallback routing & gzip compression
│   └── package.json
│
├── k8s/                               # Kubernetes declarative manifests
│   ├── namespace.yaml                 # office-management namespace isolation
│   ├── configmap.yaml                 # Runtime environment parameters
│   ├── secret.yaml                    # Base64 encoded MongoDB URI & JWT secret
│   ├── backend-deployment.yaml        # 2 Replicas, liveness/readiness probes, resources
│   ├── backend-service.yaml           # LoadBalancer exposing backend port 5000
│   ├── frontend-deployment.yaml       # 2 Replicas running Nginx SPA container
│   ├── frontend-service.yaml          # LoadBalancer exposing frontend port 80
│   ├── ingress.yaml                   # Path-based routing for office.local
│   ├── backend-hpa.yaml               # Horizontal Pod Autoscaler (2-5 replicas on 70% CPU)
│   ├── prometheus-configmap.yaml      # Scrape configuration targeting backend-service:5000
│   ├── prometheus-deployment.yaml     # Prometheus v2.51.0 deployment
│   ├── prometheus-service.yaml        # LoadBalancer exposing Prometheus on port 9090
│   ├── grafana-datasource-configmap.yaml # Automated datasource provisioning
│   ├── grafana-dashboard-configmap.yaml  # Auto-provisioned ORMS Overview dashboard
│   ├── grafana-deployment.yaml        # Grafana v10.4.0 deployment
│   ├── grafana-service.yaml           # LoadBalancer exposing Grafana on port 3000
│   └── kustomization.yaml             # Kustomize manifest bundle
│
├── docs/                              # Technical architecture, API, and DevOps guides
├── docker-compose.yml                 # Local multi-container development orchestration
├── .env.example                       # Template for environment configuration
└── README.md
```

---

## 7. Quick Start & Execution Guide

### Default Seed Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@office.com` | `Admin@123` | Full administrative control & inventory management |
| **Employee** | `employee@office.com` | `Employee@123` | Asset requests, bookings, returns, issue reports |

---

### Method A: Kubernetes Deployment (Docker Desktop / Production)

Deploy all application pods, services, ingress, HPA, Prometheus, and Grafana in **one single command**:

```powershell
cd C:\Arvind\ASDd

# Apply all manifests via Kustomize
kubectl apply -k k8s
```

Verify that all 6 pods are up and running:
```powershell
kubectl get pods -n office-management
```

Access the active services:
- **Frontend Web UI**: **[http://localhost](http://localhost)**
- **Backend API Health**: **[http://localhost:5000/api/health](http://localhost:5000/api/health)**
- **Prometheus Web UI**: **[http://localhost:9090](http://localhost:9090)**
- **Grafana Analytics**: **[http://localhost:3000](http://localhost:3000)** *(User: `admin` / Password: `admin`)*

To stop all pods gracefully:
```powershell
kubectl scale deployment --all --replicas=0 -n office-management
```

---

### Method B: Docker Compose (Local Multi-Container Dev)

Run the containerized stack locally without Kubernetes:

```powershell
cd C:\Arvind\ASDd
docker compose up --build -d
```

To stop containers:
```powershell
docker compose down
```

---

### Method C: Running Bare-Metal (Node.js & Vite Dev Server)

```powershell
# 1. Setup Backend
cd backend
npm install
node src/seed/seedAdmin.js   # Seed database
npm run dev                  # Starts server on http://localhost:5000

# 2. Setup Frontend (In a separate terminal)
cd frontend
npm install
npm run dev                  # Starts Vite dev server on http://localhost:5173
```

---

## 8. Continuous Integration (GitHub Actions)

Continuous Integration is automated using **GitHub Actions** via [`.github/workflows/ci.yml`](file:///C:/Arvind/ASD&D/.github/workflows/ci.yml).

### Pipeline Workflow:
1. **Triggers**: Runs on every `push` or `pull_request` targeting `main` or `develop`.
2. **Setup Node.js 22**: Configures official Node.js 22 runtime with automated npm dependency caching.
3. **Backend CI**:
   - Executes clean dependency install via `npm ci`.
   - Spins up an **ephemeral MongoDB service container** (`mongo:6.0` on port 27017) inside the cloud runner.
   - Executes automated tests (`npm test`) without exposing sensitive cloud Atlas credentials.
4. **Frontend CI**:
   - Executes clean dependency install via `npm ci`.
   - Compiles production bundle via `npm run build` with `VITE_API_URL=http://localhost:5000/api`.
5. **Docker Build Verification**:
   - Builds Backend image: `docker build -t office-resource-backend:ci ./backend`
   - Builds Frontend image: `docker build --build-arg VITE_API_URL=... -t office-resource-frontend:ci ./frontend`
6. **Fail-Fast Policy**: If any test, compilation, or container build fails, the pipeline immediately turns **red ❌**, blocking pull requests from merging into production branches.

---

## 9. Monitoring & Observability (Prometheus & Grafana)

The application includes enterprise site-reliability instrumentation:

### Metrics Instrumentation:
- Implemented in [`backend/src/utils/metrics.js`](file:///C:/Arvind/ASD&D/backend/src/utils/metrics.js) via `prom-client`.
- Mounted globally in Express to measure real-time traffic without impacting latency.
- Exposes standard endpoint: **`GET /api/metrics`**.

### Metrics Tracked:
1. **`office_http_requests_total`**: Counter tracking total requests grouped by `method`, `route`, and HTTP `status_code` (`200`, `400`, `409`, `403`, `500`).
2. **`office_http_request_duration_seconds`**: Histogram tracking API latency distribution to identify slow database queries.
3. **Node.js Process Telemetry**: Heap memory usage (`office_nodejs_heap_size_used_bytes`), event loop lag, active socket handles, and Garbage Collection (GC) runtimes.

### Dashboards & Visualization in Grafana:
- **Access**: Open **[http://localhost:3000](http://localhost:3000)** (Default Login: `admin` / `admin`).
- **Direct Dashboard URL**: **[http://localhost:3000/d/orms-system-overview/office-resource-management-system-overview](http://localhost:3000/d/orms-system-overview/office-resource-management-system-overview)**.
- **Zero-Configuration Provisioning**:
  - `k8s/grafana-datasource-configmap.yaml`: Auto-provisions Prometheus at `http://prometheus-service:9090`.
  - `k8s/grafana-dashboard-configmap.yaml`: Auto-provisions the dashboard provider and JSON model at startup.
- **Pre-Built Monitoring Panels**:
  1. **Total HTTP Requests** (Stat panel): Cumulative count of all API requests served across all pods.
     ```promql
     sum(office_http_requests_total)
     ```
  2. **API Throughput by Route** (Time series): Real-time request rate (req/s) broken down by endpoint and HTTP status.
     ```promql
     sum by (route, status_code) (rate(office_http_requests_total[1m]))
     ```
  3. **p95 Latency / Response Time** (Time series): 95th percentile response time in seconds to detect slow routes.
     ```promql
     histogram_quantile(0.95, sum(rate(office_http_request_duration_seconds_bucket[5m])) by (le, route))
     ```
  4. **Node.js Heap Memory** (Time series): Live RAM consumption in Megabytes to monitor memory leak patterns.
     ```promql
     office_nodejs_heap_size_used_bytes / 1024 / 1024
     ```
  5. **Active Handles & Sockets** (Stat panel): Number of active event loop handles and open network connections.
     ```promql
     sum(office_nodejs_active_handles_total)
     ```
  6. **HTTP 4xx & 5xx Error Rate** (Time series): Instant visual detection of client errors or server exceptions.
     ```promql
     sum by (route, status_code) (rate(office_http_requests_total{status_code=~"[45].."}[1m]))
     ```

---

## 10. Automated Testing Suite

Automated integration tests are built with Node.js Native Test Runner (`node:test`) and Supertest:

```powershell
cd backend
npm test
```

### Key Test Validations:
- ✅ **Authentication**: Self-service signup strictly forces `EMPLOYEE` role even if payload attempts to forge `ADMIN`.
- ✅ **RBAC Enforcement**: Non-admin users are rejected with `403 Forbidden` on resource creation.
- ✅ **Booking Overlap Prevention**: Identical and overlapping meeting room reservations are rejected with `409 Conflict`.
- ✅ **Adjacent Bookings**: Meeting reservations on adjacent boundaries (e.g. 10–11 and 11–12) are accepted without conflict.
- ✅ **Hardware Allocation State**: Approved hardware transitions to `ALLOCATED` and rejects duplicate allocation requests.

---

## 11. Viva Voce Highlights & DevOps Exam Questions

### 1. Why is Kubernetes deployment manual while CI is automated in GitHub Actions?
GitHub Actions runs on cloud runners in Microsoft Azure data centers. The development Kubernetes cluster runs locally via Docker Desktop on the developer's laptop (`localhost`). A cloud runner cannot securely reach the laptop's private network or Kubernetes API endpoint (`127.0.0.1:6443`) without exposing insecure tunnels. Keeping CI automated in the cloud and CD manual locally represents clean separation of concerns.

### 2. Why use an ephemeral MongoDB service container in CI instead of MongoDB Atlas?
Running integration tests against cloud MongoDB Atlas in CI is bad practice because:
1. GitHub Actions runners have dynamic cloud IPs that change on every run, which would require opening Atlas Network Access to `0.0.0.0/0`.
2. Tests perform `deleteMany()` and mock data creation, which would pollute real development/demo data.
3. It exposes cloud database secrets in CI.  
The ephemeral Docker container (`mongo:6.0`) starts in 2 seconds, runs in runner memory, and is discarded after test completion.

### 3. How does the booking overlap algorithm work?
Two time intervals $[S_1, E_1)$ and $[S_2, E_2)$ intersect if and only if:
$$S_2 < E_1 \quad \text{and} \quad E_2 > S_1$$
If any active booking matches this condition on the same resource and date, the API rejects the request with HTTP `409 Conflict`.

### 4. How does the multi-stage frontend Dockerfile optimize image size?
- **Stage 1 (Builder)**: Uses `node:22-alpine` to compile JSX and Tailwind CSS into static HTML/CSS/JS files inside `/app/dist`.
- **Stage 2 (Server)**: Uses `nginx:1.25-alpine`, discarding Node.js, `node_modules`, npm, and development tools entirely. Only static assets are copied to `/usr/share/nginx/html`. This reduces the final image size from ~300MB to under 25MB.

### 5. What is the difference between Docker Compose and Kubernetes?
- **Docker Compose**: Orchestrates multi-container applications on a **single host machine**. Ideal for quick local developer setups.
- **Kubernetes**: An enterprise container orchestrator designed for **clustered environments** across multiple nodes, offering automated rolling updates, self-healing pod restarts, Horizontal Pod Autoscaling (HPA), and declarative ingress management.

### 6. How does Prometheus discover the backend service inside Kubernetes?
Prometheus runs in the same Kubernetes namespace (`office-management`) and leverages internal **kube-DNS** service discovery. The scrape target is statically configured as `backend-service:5000/api/metrics`. Kubernetes CoreDNS automatically resolves `backend-service` to the cluster IP, routing traffic across the backend pods.

---

## 12. License & Academic Attribution

This project was built for the **Agile Software Development and DevOps Lab** mini-project curriculum.  
Developed by:
- **Arvind Patil** (DevOps & Backend)
- **Arya Rane** (Frontend & UI)
- **Harsh Phale** (Business Logic & QA)
