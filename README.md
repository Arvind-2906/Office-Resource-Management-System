# Office Resource Management System (ORMS)

> **Agile Software Development and DevOps Lab Mini-Project**  
> Built with JavaScript (MERN Stack), Docker, Docker Compose, Jenkins CI/CD, and Kubernetes (AWS EC2 + MongoDB Atlas).

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
- **Backend**: Node.js, Express.js, Mongoose ODM, JWT, bcryptjs, cookie-parser, CORS.
- **Database**: MongoDB Atlas (Cloud Database Cluster).
- **Containerization**: Docker, Docker Compose, Nginx (Alpine multi-stage frontend).
- **CI/CD Pipeline**: Jenkins Declarative Pipeline (`Jenkinsfile`).
- **Orchestration**: Kubernetes manifests (`k8s/` - Namespace, Deployments, Services, ConfigMaps, Secrets, Ingress, HPA).
- **Testing**: Node.js Native Test Runner (`node:test`) + Supertest.

---

## 5. Repository Structure

```
office-resource-management/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, env.js
│   │   ├── controllers/     # auth, user, resource, request, allocation, booking, etc.
│   │   ├── middleware/      # authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── models/          # User, Resource, ResourceRequest, Allocation, Booking, etc.
│   │   ├── routes/          # Express route definitions
│   │   ├── seed/            # seedAdmin.js (initial admin, employee, and sample assets)
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # apiResponse, jwt, logger
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server listener
│   ├── tests/               # Automated integration & business logic tests
│   ├── Dockerfile           # Node 18 Alpine container with healthcheck
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
│   └── kustomization.yaml
│
├── scripts/                 # Automation scripts (setup, build, test, docker, deploy)
├── docs/                    # Architecture, API, Database, DevOps, and Deployment docs
├── docker-compose.yml       # Local multi-container orchestration
├── Jenkinsfile              # Declarative CI/CD pipeline
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

## 9. Jenkins CI/CD Pipeline

The included `Jenkinsfile` defines a 7-stage automated pipeline:
1. **Checkout**: Source code clone.
2. **Install Dependencies**: Parallel `npm ci` for backend and frontend.
3. **Run Automated Tests**: Executes `npm test` verifying business rules.
4. **Build Frontend**: Compiles production assets.
5. **Build Docker Images**: Builds backend and frontend images tagged with `$BUILD_NUMBER` and `latest`.
6. **Push Docker Images**: Pushes container images to Docker Hub registry.
7. **Deploy to Kubernetes**: Applies `k8s/` manifests to target cluster and monitors rollout status.

---

## 10. Kubernetes Deployment

Deploy to Kubernetes (Minikube, K3s on AWS EC2, or EKS):
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
```

---

## 11. Viva Voce Highlights & Key Concepts

1. **Why MongoDB Atlas instead of containerized Mongo in Kubernetes?**
   - In production, databases require persistent replication, automated backups, and disk scaling. Managing stateful database pods inside ephemeral Kubernetes clusters adds unnecessary operational complexity. Connecting Kubernetes workloads to MongoDB Atlas follows the 12-factor cloud-native principle.
2. **How does the booking overlap algorithm work?**
   - Two intervals $[S_1, E_1)$ and $[S_2, E_2)$ intersect if and only if:
     $S_2 < E_1 \text{ and } E_2 > S_1$. If this condition is met for any active booking on the same resource and date, the API returns `409 Conflict`.
3. **How is RBAC secured against frontend tampering?**
   - The frontend role check only determines UI visibility. Every Express endpoint enforces `protect` (JWT validation) and `authorize('ADMIN')` (database verification of the user's role). Even if a user tampers with client-side state, unauthorized API requests return `403 Forbidden`.
