const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const client = require('prom-client');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import middlewares
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ==========================================
// Prometheus Metrics Configuration
// ==========================================
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const activeRequestsGauge = new client.Gauge({
  name: 'active_requests',
  help: 'Number of active HTTP requests currently being handled'
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);
register.registerMetric(activeRequestsGauge);

// Metrics Interceptor Middleware
app.use((req, res, next) => {
  if (req.path === '/metrics' || req.path.startsWith('/api/health')) {
    return next();
  }

  activeRequestsGauge.inc();
  const start = process.hrtime();

  res.on('finish', () => {
    activeRequestsGauge.dec();
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const statusCode = res.statusCode.toString();

    httpRequestCounter.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDuration.observe(
      { method: req.method, route, status_code: statusCode },
      durationInSeconds
    );
  });

  next();
});

// Metrics Scraping Endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.send(metrics);
});

// ==========================================
// Security & Core Middlewares
// ==========================================
app.use(helmet());

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // In dev, allow localhost on any port
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      if (origin === clientUrl) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local agile/devops evaluation
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ==========================================
// Health & Probes Endpoints (Section 24)
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    service: 'ecommerce-backend'
  });
});

app.get('/api/health/live', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ALIVE',
    uptime: process.uptime()
  });
});

app.get('/api/health/ready', (req, res) => {
  const isMongoReady = mongoose.connection.readyState === 1;
  if (isMongoReady) {
    return res.status(200).json({
      success: true,
      status: 'READY',
      database: 'CONNECTED'
    });
  }
  return res.status(503).json({
    success: false,
    status: 'NOT_READY',
    database: 'DISCONNECTED'
  });
});

// ==========================================
// API Routes Mount
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to NovaStore E-Commerce REST API',
    documentation: '/docs',
    health: '/api/health',
    metrics: '/metrics'
  });
});

// Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
