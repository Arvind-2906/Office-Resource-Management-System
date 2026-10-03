# Prometheus Monitoring Guide

This directory contains the Prometheus monitoring configuration for the NovaStore E-Commerce application.

> **Note**: As explicitly requested in the project specification, **Grafana is not included** at this stage. All metric inspection, querying, and verification are performed directly via Prometheus and the application's `/metrics` endpoint.

---

## 1. Overview

The backend uses `prom-client` to expose application and runtime metrics in standard Prometheus exposition format on:

```
GET /metrics
```

Prometheus periodically scrapes this endpoint (configured at a 5-second interval in `prometheus.yml`) and stores time-series data for analysis.

---

## 2. Key Metrics Tracked

| Metric Name | Type | Description | Labels |
|---|---|---|---|
| `http_requests_total` | Counter | Total number of HTTP requests processed | `method`, `route`, `status_code` |
| `http_request_duration_seconds` | Histogram | Request latency distributions (buckets: 10ms - 5s) | `method`, `route`, `status_code` |
| `active_requests` | Gauge | Instantaneous number of concurrent in-flight requests | None |
| `process_cpu_user_seconds_total` | Counter | Total user CPU time spent in seconds | None |
| `process_resident_memory_bytes` | Gauge | Resident memory size (RAM) in bytes | None |
| `nodejs_eventloop_lag_seconds` | Gauge | Node.js event loop lag | None |
| `nodejs_heap_size_total_bytes` | Gauge | Process heap memory allocation | None |

---

## 3. Running Prometheus Locally

### Option A: Using Docker

Run Prometheus directly mounting the configuration file:

```bash
docker run -d \
  --name novastore-prometheus \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus:v2.53.0
```

On Windows PowerShell:
```powershell
docker run -d `
  --name novastore-prometheus `
  -p 9090:9090 `
  -v ${PWD}/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml `
  prom/prometheus:v2.53.0
```

### Option B: Native Binary

Download Prometheus from [prometheus.io/download](https://prometheus.io/download/) and run:

```bash
./prometheus --config.file=monitoring/prometheus/prometheus.yml
```

Once running, access the Prometheus web UI at: **http://localhost:9090**

---

## 4. Useful PromQL Queries

### Request Volume & Throughput
* **Overall HTTP Request Rate (requests/sec)**:
  ```promql
  sum(rate(http_requests_total[1m]))
  ```

* **Request Rate by Route**:
  ```promql
  sum by (route) (rate(http_requests_total[1m]))
  ```

### Errors & Reliability
* **HTTP 5xx Server Error Rate**:
  ```promql
  sum(rate(http_requests_total{status_code=~"5.."}[1m]))
  ```

* **Error Percentage (%)**:
  ```promql
  (sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100
  ```

### Latency (SLO / SLA)
* **95th Percentile Latency**:
  ```promql
  histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
  ```

* **99th Percentile Latency**:
  ```promql
  histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
  ```

### Resource Utilization
* **Active In-Flight Requests**:
  ```promql
  active_requests
  ```

* **Memory Usage (MB)**:
  ```promql
  process_resident_memory_bytes / 1024 / 1024
  ```

---

## 5. Verification Checklist

1. Start backend server: `npm start` in `backend/` (running on port 5000).
2. Visit `http://localhost:5000/metrics` in browser to confirm text exposition format.
3. Open `http://localhost:9090/targets` in Prometheus to verify `ecommerce-backend` state is `UP`.
