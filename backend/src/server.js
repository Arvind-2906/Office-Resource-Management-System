require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[NovaStore API] Server running at http://localhost:${PORT}`);
      console.log(`[NovaStore API] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[NovaStore API] Prometheus metrics: http://localhost:${PORT}/metrics`);
    });

    // Graceful Shutdown handling
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown if taking too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection', { message: err.message, stack: err.stack });
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception thrown', { message: err.message, stack: err.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to initialize server', { message: error.message });
    process.exit(1);
  }
};

startServer();
