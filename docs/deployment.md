# NovaStore Deployment Guide

This guide covers deployment procedures across different environments: Local Development, Docker Compose, Kubernetes, and Ansible automation.

---

## 1. Local Development Deployment

### Prerequisites
* Node.js v18 or v20+
* MongoDB running locally on port 27017 (or MongoDB Atlas URI)

### Setup Steps
1. **Clone repository & prepare environment variables**:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Install dependencies & seed initial catalog**:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm install
   npm run seed
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm install
   npm run dev
   ```

3. **Access points**:
   * Frontend: `http://localhost:5173`
   * Backend REST API: `http://localhost:5000/api`
   * Backend Health: `http://localhost:5000/api/health`
   * Prometheus Metrics: `http://localhost:5000/metrics`

---

## 2. Docker Compose Deployment

### 2.1 Production Stack
Runs the containerized frontend (Nginx), backend (Node.js), and MongoDB with internal networking and automated health checks:

```bash
docker compose up --build -d
```

View container statuses:
```bash
docker compose ps
```

View application logs:
```bash
docker compose logs -f
```

Tear down stack:
```bash
docker compose down -v
```

### 2.2 Development Stack (Hot-Reload)
Runs containers with volume bind mounts so code edits in `./backend` and `./frontend` reload instantaneously:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## 3. Kubernetes Deployment

### Prerequisites
* Running Kubernetes cluster (Minikube, Kind, k3s, EKS, GKE, or AKS)
* `kubectl` CLI configured with cluster context
* Ingress controller installed (e.g., ingress-nginx)

### Deployment Commands

1. **Review and deploy all resources via Kustomize**:
   ```bash
   kubectl apply -k k8s/
   ```

2. **Verify namespace creation & workload rollout**:
   ```bash
   kubectl get pods -n ecommerce
   kubectl get services -n ecommerce
   kubectl get statefulsets -n ecommerce
   kubectl get ingress -n ecommerce
   ```

3. **Check rollout status**:
   ```bash
   kubectl rollout status deployment/ecommerce-backend -n ecommerce
   kubectl rollout status deployment/ecommerce-frontend -n ecommerce
   kubectl rollout status statefulset/mongodb -n ecommerce
   ```

4. **Local Cluster DNS Routing (Minikube / Kind)**:
   Add entry to your `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts`):
   ```
   127.0.0.1 novastore.local
   ```
   Now navigate to `http://novastore.local` in your browser.

---

## 4. Ansible Server Deployment

To provision and deploy to remote virtual machines:

```bash
# Provision OS dependencies, Docker & Firewall
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/setup-server.yml

# Deploy application stack & run health verification
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy.yml
```

---

## 5. Post-Deployment Verification

Execute the following verification curl commands:

```bash
# 1. Verify backend health
curl -s http://localhost:5000/api/health | jq

# 2. Verify MongoDB readiness
curl -s http://localhost:5000/api/health/ready | jq

# 3. Verify Prometheus metrics scraping endpoint
curl -s http://localhost:5000/metrics | grep http_requests_total
```
