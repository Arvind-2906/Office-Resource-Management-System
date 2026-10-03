const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(`[Server] Office Resource Management API running on port ${env.PORT}`);
      logger.info(`[Server] Environment: ${env.NODE_ENV}`);
      logger.info(`[Server] Health check: http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = () => {
      logger.info('[Server] Received termination signal. Closing HTTP server gracefully...');
      server.close(() => {
        logger.info('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(`[Server] Failed to initialize server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
