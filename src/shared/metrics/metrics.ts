import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

const globalForMetrics = globalThis as typeof globalThis & {
  __loyaltyWebMetricsRegistry?: Registry;
  __loyaltyWebHttpRequestsTotal?: Counter<string>;
  __loyaltyWebBusinessTransactionsTotal?: Counter<string>;
  __loyaltyWebHttpRequestDurationSeconds?: Histogram<string>;
  __loyaltyWebMetricsInitialized?: boolean;
};

export const metricsRegistry =
  globalForMetrics.__loyaltyWebMetricsRegistry ?? new Registry();

if (!globalForMetrics.__loyaltyWebMetricsInitialized) {
  collectDefaultMetrics({ register: metricsRegistry, prefix: 'loyalty_web_' });
  globalForMetrics.__loyaltyWebMetricsInitialized = true;
}

globalForMetrics.__loyaltyWebMetricsRegistry = metricsRegistry;

export const httpRequestsTotal =
  globalForMetrics.__loyaltyWebHttpRequestsTotal ??
  new Counter({
    name: 'loyalty_web_http_requests_total',
    help: 'Total HTTP requests handled by the web layer',
    labelNames: ['method', 'route', 'status_class', 'status_code'] as const,
    registers: [metricsRegistry],
  });

globalForMetrics.__loyaltyWebHttpRequestsTotal = httpRequestsTotal;

export const businessTransactionsTotal =
  globalForMetrics.__loyaltyWebBusinessTransactionsTotal ??
  new Counter({
    name: 'loyalty_web_business_transactions_total',
    help: 'Business transactions processed by the web layer',
    labelNames: ['flow', 'outcome'] as const,
    registers: [metricsRegistry],
  });

globalForMetrics.__loyaltyWebBusinessTransactionsTotal = businessTransactionsTotal;

export const httpRequestDurationSeconds =
  globalForMetrics.__loyaltyWebHttpRequestDurationSeconds ??
  new Histogram({
    name: 'loyalty_web_http_request_duration_seconds',
    help: 'HTTP request latency in seconds for the web layer',
    labelNames: ['method', 'route', 'status_class', 'status_code'] as const,
    buckets: [0.01, 0.025, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1, 1.5, 2, 3, 5],
    registers: [metricsRegistry],
  });

globalForMetrics.__loyaltyWebHttpRequestDurationSeconds = httpRequestDurationSeconds;

export function statusClass(statusCode: number): string {
  return `${Math.floor(statusCode / 100)}xx`;
}

export function observeRequest(args: {
  method: string;
  route: string;
  statusCode: number;
  durationSeconds: number;
}) {
  const labels = {
    method: args.method,
    route: args.route,
    status_class: statusClass(args.statusCode),
    status_code: String(args.statusCode),
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, args.durationSeconds);
}
