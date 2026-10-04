# Deployment Guide: Local, Docker, Kubernetes & AWS

## 1. Local Development (Windows / macOS / Linux)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI or local MongoDB

### Setup Steps
```bash
# 1. Backend setup
cd backend
npm install
node src/seed/seedAdmin.js
npm run dev

# 2. Frontend setup (in a separate terminal)
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 2. Local Docker Compose Deployment

Run the complete multi-container stack with a single command:
```bash
docker compose up --build -d
```
Verify container status:
```bash
docker compose ps
```
Access the application:
- Frontend: `http://localhost` (or `http://localhost:5173`)
- Backend Health Check: `http://localhost:5000/api/health`

---

## 3. Kubernetes Deployment (Minikube / K3s / EKS)

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/backend-hpa.yaml

# Verify deployments
kubectl get pods -n office-management
kubectl get svc -n office-management
```

---

## 4. AWS Cloud Deployment Architecture

For an academic mini-project, the most cost-effective and practical architecture uses a single **AWS EC2 Ubuntu instance** running **K3s (Lightweight Kubernetes)**:

1. **Launch EC2 Instance**:
   - Instance Type: `t3.medium` or `t3a.medium` (2 vCPU, 4GB RAM)
   - OS: Ubuntu 22.04 LTS
   - Security Group Rules:
     - Inbound TCP `22` (SSH)
     - Inbound TCP `80` (HTTP)
     - Inbound TCP `443` (HTTPS)
     - Inbound TCP `5000` (Backend API direct access if needed)
2. **Install K3s Lightweight Kubernetes**:
   ```bash
   curl -sfL https://get.k3s.io | sh -
   sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
   sudo chown $(whoami) ~/.kube/config
   ```
3. **Deploy the System**:
   ```bash
   git clone https://github.com/Arvind-2906/Office-Resource-Management-System.git
   cd Office-Resource-Management-System
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/
   ```
4. **MongoDB Atlas Whitelisting**:
   - Add your EC2 Elastic IP to the **Network Access IP Whitelist** on your MongoDB Atlas Console.
