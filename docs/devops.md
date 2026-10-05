# DevOps Architecture & Automation Guide

This document explains the Agile Software Development and DevOps implementation for the **Office Resource Management System**.

---

## 1. Complete DevOps Lifecycle

```
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │     Jira     │ ──> │  Git Branch  │ ──> │  Git Commit  │
    │ User Stories │     │ feature/ORM-*│     │ & PR Review  │
    └──────────────┘     └──────────────┘     └──────┬───────┘
                                                     │
                                                     ▼
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │  Kubernetes  │ <── │ Docker Image │ <── │  CI/CD Automated
    │  Deployment  │     │   Registry   │     │ Pipeline Test│
    └──────┬───────┘     └──────────────┘     └──────────────┘
           │
           ▼
    ┌──────────────┐
    │   AWS EC2    │ (Connecting securely to MongoDB Atlas)
    │ Production   │
    └──────────────┘
```

---

## 2. Docker Architecture

### Multi-Stage Frontend Container (`frontend/Dockerfile`)
1. **Stage 1 (Builder)**: Uses `node:18-alpine` to compile the React/Vite source code into static bundles (`/app/dist`).
2. **Stage 2 (Production Server)**: Uses `nginx:1.25-alpine` to serve production assets with custom SPA fallback (`try_files $uri /index.html;`) and gzip compression. This reduces image size from ~300MB to under 30MB!

### Backend Container (`backend/Dockerfile`)
- Uses `node:18-alpine` with `npm ci --only=production`.
- Exposes port `5000`.
- Built-in Docker `HEALTHCHECK` pinging `/api/health`.

### Docker Compose Orchestration (`docker-compose.yml`)
- Runs frontend, backend, and optional local MongoDB in an isolated network (`office-network`).
- Bridges frontend port 80/5173 and backend port 5000 to the host.

---

## 3. Kubernetes Architecture (`k8s/`)

- **Namespace**: `office-management` isolates all system workloads.
- **ConfigMap & Secret**: Separates runtime parameters from credentials (e.g. MongoDB Atlas connection string).
- **Deployments**:
  - `backend-deployment`: 2 replicas with `livenessProbe` and `readinessProbe` checking `/api/health`.
  - `frontend-deployment`: 2 replicas running Nginx.
- **Services**: `backend-service` and `frontend-service` provide stable internal cluster endpoints.
- **Ingress**: Routes incoming HTTP traffic based on path prefixes (`/api` -> backend, `/` -> frontend).
- **Horizontal Pod Autoscaler (HPA)**: Automatically scales backend pods from 2 to 5 based on 70% CPU threshold.
- **Database Boundary Rule**: MongoDB Atlas runs outside the cluster for high availability and zero maintenance overhead.

---

## 4. Monitoring & Observability Architecture (Prometheus & Grafana)

The monitoring stack runs natively inside the `office-management` Kubernetes namespace:

```
┌────────────────────────────────────────────────────────┐
│             Kubernetes: office-management              │
│                                                        │
│  ┌────────────────────┐          ┌──────────────────┐  │
│  │  backend-service   │ <─────── │    Prometheus    │  │
│  │ (Port 5000/metrics)│  Scrapes │   (Port 9090)    │  │
│  └────────────────────┘          └────────┬─────────┘  │
│                                           │            │
│                                           │ Queries    │
│                                           ▼            │
│                                  ┌──────────────────┐  │
│                                  │     Grafana      │  │
│                                  │   (Port 3000)    │  │
│                                  └──────────────────┘  │
└────────────────────────────────────────────────────────┘
```

1. **Metrics Instrumentor**:
   - `backend/src/utils/metrics.js` collects default Node.js runtime metrics (heap memory, event loop lag, GC duration) with prefix `office_`.
   - Custom metrics:
     - `office_http_requests_total`: Counter tracking total requests tagged by method, route, and HTTP status code.
     - `office_http_request_duration_seconds`: Histogram tracking request latency distribution.
   - Route `GET /api/metrics` is exposed for Prometheus scrapers.

2. **Prometheus Manifests**:
   - `k8s/prometheus-configmap.yaml`: Scrapes `backend-service:5000/api/metrics` every 5 seconds.
   - `k8s/prometheus-deployment.yaml` & `k8s/prometheus-service.yaml`: Runs `prom/prometheus:v2.51.0` and exposes web UI on port `9090` (`http://localhost:9090`).

3. **Grafana Manifests**:
   - `k8s/grafana-datasource-configmap.yaml`: Auto-provisions Prometheus as the default datasource at startup (`http://prometheus-service:9090`).
   - `k8s/grafana-deployment.yaml` & `k8s/grafana-service.yaml`: Runs `grafana/grafana:10.4.0` with credentials `admin`/`admin` on port `3000` (`http://localhost:3000`).
