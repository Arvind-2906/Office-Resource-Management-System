import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import env from './config/env.js';
import ApiResponse from './utils/apiResponse.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Middleware
import errorHandler from './middleware/errorMiddleware.js';
import notFound from './middleware/notFoundMiddleware.js';
import { register, metricsMiddleware } from './utils/metrics.js';

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

export default app;
