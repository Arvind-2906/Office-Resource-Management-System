# NovaStore DevOps Pipeline & Infrastructure Architecture

This document outlines the complete continuous integration, delivery, containerization, orchestration, and monitoring lifecycle for the NovaStore platform.

---

## 1. End-to-End DevOps Lifecycle

```
Developer Push (Git)
        │
        ▼
 GitHub Repository
        │
        ▼
 GitHub Actions CI Pipeline
  ├── Job 1: Setup Node 20 & Cache
  ├── Job 2: Run Backend Tests (Jest, Supertest, In-Memory MongoDB)
  ├── Job 3: Run Frontend Tests (Vitest, React Testing Library)
  ├── Job 4: Build Frontend Production Artifacts (Vite)
  └── Job 5: Validate Docker Compose & Build Container Images
        │ (Passed)
        ▼
 GitHub Actions CD Pipeline
  ├── Build Multi-Stage Docker Images
  ├── Push Images to GitHub Container Registry (ghcr.io)
  ├── Dry-run & Apply Kubernetes Manifests (k8s/ via Kustomize)
  ├── Rollout Status Verifications
  └── Automated Health Check Query (/api/health)
        │
        ▼
 Kubernetes Production Cluster
  ├── Ingress Controller (novastore.local)
  ├── Frontend Service (2 Replicas, Port 80)
  ├── Backend Service (2 Replicas, Port 5000, Probes)
  └── MongoDB Service (StatefulSet, Volume Claim, Port 27017)
        │
        ▼
 Prometheus Metrics Scraping
  └── Polls /metrics every 15s (Latency, Requests, Active Connections, Heap)
```

---

## 2. Continuous Integration (CI) Workflow

File: `.github/workflows/ci.yml`

* **Triggers**:
  * Any `push` to `main` or `master` branches.
  * Any `pull_request` targeting `main` or `master`.
* **Execution Gates**:
  1. **Backend Test Gate**: Runs in-memory test suites without external database dependencies.
  2. **Frontend Test & Build Gate**: Runs component tests and verifies that Vite can assemble the production bundle without missing imports or syntax regressions.
  3. **Docker Validation Gate**: Validates the syntax of `docker-compose.yml` and builds both frontend and backend Dockerfiles.

---

## 3. Continuous Deployment (CD) Workflow

File: `.github/workflows/cd.yml`

* **Triggers**:
  * Successful completion of the CI workflow.
  * Publication of semantic version tags (`v*`).
* **Deployment Stages**:
  1. **Container Registry Push**: Builds and tags container images with Git SHA and `latest`, pushing them securely to GitHub Container Registry (`ghcr.io`).
  2. **Kubernetes Rollout**: Applies Kustomize manifests into the `ecommerce` namespace and blocks until all deployment pods report healthy.
  3. **Synthetic Health Ping**: Verifies `/api/health` returns `HTTP 200` with status `"UP"`.

---

## 4. Multi-Stage Container Architecture

### 4.1 Backend (`backend/Dockerfile`)
* **Base Stage**: `node:20-alpine` fetches production dependencies (`npm ci --omit=dev`).
* **Runtime Stage**: Copies dependencies and source code to a slim runtime layer, executes under a dedicated non-root user `appuser`, and configures container `HEALTHCHECK`.

### 4.2 Frontend (`frontend/Dockerfile`)
* **Builder Stage**: `node:20-alpine` runs Vite bundler producing static chunks.
* **Runner Stage**: `nginx:alpine` serves static files with gzip compression and client-side SPA routing fallbacks.

---

## 5. Kubernetes Orchestration (`k8s/`)

| Resource | Manifest | Responsibility |
|---|---|---|
| Namespace | `namespace.yaml` | Isolates platform workloads (`ecommerce`) |
| ConfigMap | `configmap.yaml` | Non-sensitive runtime variables (`PORT`, `NODE_ENV`, `MONGO_URI`) |
| Secret | `secrets.example.yaml` | Sensitive environment variables (`JWT_SECRET`) |
| Database | `mongodb-statefulset.yaml` | Persistent storage with `volumeClaimTemplates` (2Gi) |
| Backend | `backend-deployment.yaml` | 2 replicas with `livenessProbe` and `readinessProbe` |
| Frontend | `frontend-deployment.yaml` | 2 replicas serving static Nginx frontend |
| Ingress | `ingress.yaml` | Single entry point routing traffic by URL prefix |
| Kustomization| `kustomization.yaml` | Aggregates all manifests for single-command deploy |

---

## 6. Observability & Health Probing

* **Liveness Probe**: `GET /api/health/live` ensures the Express process is active and responsive.
* **Readiness Probe**: `GET /api/health/ready` verifies active connectivity to MongoDB (`readyState === 1`) before routing user requests to that pod.
* **Prometheus Telemetry**: `GET /metrics` outputs `http_requests_total`, `http_request_duration_seconds`, and `active_requests` in Prometheus exposition format.
