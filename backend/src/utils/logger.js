/**
 * Structured Application Logger
 * Logs messages in JSON format for Docker and Kubernetes log scrapers.
 * Masks sensitive credentials (passwords, tokens, cards).
 */

const SENSITIVE_KEYS = ['password', 'token', 'jwt', 'secret', 'cardNumber', 'cvv', 'creditCard'];

const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const clean = { ...data };
  for (const key of Object.keys(clean)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      clean[key] = '***REDACTED***';
    } else if (typeof clean[key] === 'object') {
      clean[key] = sanitizeData(clean[key]);
    }
  }
  return clean;
};

const formatLog = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service: 'ecommerce-backend',
    message,
    ...(meta && Object.keys(meta).length > 0 ? { details: sanitizeData(meta) } : {})
  };

  const output = JSON.stringify(logEntry);
  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
  return logEntry;
};

const logger = {
  info: (message, meta) => formatLog('info', message, meta),
  warn: (message, meta) => formatLog('warn', message, meta),
  error: (message, meta) => formatLog('error', message, meta),
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      formatLog('debug', message, meta);
    }
  },
  authEvent: (event, meta) => formatLog('info', `AUTH_EVENT: ${event}`, meta),
  orderEvent: (event, meta) => formatLog('info', `ORDER_EVENT: ${event}`, meta),
  paymentEvent: (event, meta) => formatLog('info', `PAYMENT_EVENT: ${event}`, meta)
};

module.exports = logger;
