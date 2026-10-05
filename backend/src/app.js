const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const env = require('./config/env');
const ApiResponse = require('./utils/apiResponse');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middleware
const errorHandler = require('./middleware/errorMiddleware');
const notFound = require('./middleware/notFoundMiddleware');
const { register, metricsMiddleware } = require('./utils/metrics');

const app = express();

// Standard middlewares
app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware);
app.use(
  cors({
    origin: [
      env.CLIENT_URL,
      'http://localhost',
      'http://127.0.0.1',
      'http://localhost:80',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Prometheus metrics endpoint for scraping
app.get('/api/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  return ApiResponse.success(res, 'Server is healthy', {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: states[dbState] || 'Unknown',
    environment: env.NODE_ENV
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
