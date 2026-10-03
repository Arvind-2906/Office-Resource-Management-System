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
    │  Kubernetes  │ <── │ Docker Image │ <── │   Jenkins    │
    │  Deployment  │     │   Registry   │     │  CI Pipeline │
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

## 3. Jenkins CI/CD Pipeline (`Jenkinsfile`)

The Jenkinsfile implements an automated declarative pipeline:
1. **Checkout**: Clones the active Git branch.
2. **Install Dependencies**: Runs `npm ci` in parallel for backend and frontend.
3. **Run Automated Tests**: Executes integration tests (`node --test tests/*.test.js`) verifying RBAC and booking conflict logic.
4. **Build Frontend**: Compiles Vite bundle.
5. **Build Docker Images**: Builds backend and frontend images tagged with `$BUILD_NUMBER` and `latest`.
6. **Push Images**: Authenticates against Docker Hub using Jenkins credentials (`dockerhub-credentials`) and pushes the container images.
7. **Deploy to Kubernetes**: Applies `k8s/` manifests to the target cluster and waits for rollout status confirmation.

---

## 4. Kubernetes Architecture (`k8s/`)

- **Namespace**: `office-management` isolates all system workloads.
- **ConfigMap & Secret**: Separates runtime parameters from credentials (e.g. MongoDB Atlas connection string).
- **Deployments**:
  - `backend-deployment`: 2 replicas with `livenessProbe` and `readinessProbe` checking `/api/health`.
  - `frontend-deployment`: 2 replicas running Nginx.
- **Services**: `backend-service` and `frontend-service` provide stable internal cluster endpoints.
- **Ingress**: Routes incoming HTTP traffic based on path prefixes (`/api` -> backend, `/` -> frontend).
- **Horizontal Pod Autoscaler (HPA)**: Automatically scales backend pods from 2 to 5 based on 70% CPU threshold.
- **Database Boundary Rule**: MongoDB Atlas runs outside the cluster for high availability and zero maintenance overhead.
