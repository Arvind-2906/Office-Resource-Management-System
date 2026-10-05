const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'office_'
});

const httpRequestCounter = new client.Counter({
  name: 'office_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

const httpRequestDuration = new client.Histogram({
  name: 'office_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 1.5, 2, 5]
});
register.registerMetric(httpRequestDuration);

const metricsMiddleware = (req, res, next) => {
  if (req.path === '/api/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const labels = {
      method: req.method,
      route: route || req.path,
      status_code: res.statusCode
    };

    httpRequestCounter.inc(labels);
    httpRequestDuration.observe(labels, durationInSeconds);
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware
};