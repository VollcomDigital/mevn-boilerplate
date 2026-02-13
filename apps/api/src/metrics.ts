import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

const METRIC_PREFIX = "mevn_api_";

export const metricsRegistry = new Registry();

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: METRIC_PREFIX
});

const httpRequestDurationSeconds = new Histogram({
  name: `${METRIC_PREFIX}http_request_duration_seconds`,
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry]
});

const httpRequestsTotal = new Counter({
  name: `${METRIC_PREFIX}http_requests_total`,
  help: "Total number of processed HTTP requests.",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [metricsRegistry]
});

/**
 * Records request metrics for Prometheus scraping.
 */
export function observeHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
): void {
  const labels = {
    method,
    route,
    status_code: String(statusCode)
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationSeconds);
}
