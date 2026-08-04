import { Injectable } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly httpRequests = new Counter({
    name: 'borska_farmica_http_requests_total',
    help: 'HTTP requests',
    labelNames: ['method', 'route', 'status_class'],
    registers: [this.registry],
  });
  readonly httpDuration = new Histogram({
    name: 'borska_farmica_http_request_duration_seconds',
    help: 'HTTP duration',
    labelNames: ['method', 'route', 'status_class'],
    registers: [this.registry],
  });
  readonly readiness = new Gauge({
    name: 'borska_farmica_database_readiness',
    help: 'Database readiness',
    registers: [this.registry],
  });
  readonly maintenanceRuns = new Counter({
    name: 'borska_farmica_maintenance_runs_total',
    help: 'Maintenance runs',
    labelNames: ['job', 'outcome'],
    registers: [this.registry],
  });
  readonly maintenanceDuration = new Histogram({
    name: 'borska_farmica_maintenance_duration_seconds',
    help: 'Maintenance duration',
    labelNames: ['job'],
    registers: [this.registry],
  });
  readonly maintenanceProcessed = new Counter({
    name: 'borska_farmica_maintenance_processed_total',
    help: 'Maintenance rows',
    labelNames: ['job'],
    registers: [this.registry],
  });
  readonly imageUploads = new Counter({
    name: 'borska_farmica_image_uploads_total',
    help: 'Image uploads',
    labelNames: ['outcome'],
    registers: [this.registry],
  });
  readonly orders = new Counter({
    name: 'borska_farmica_orders_total',
    help: 'Order lifecycle',
    labelNames: ['event', 'reason'],
    registers: [this.registry],
  });
  constructor() {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'borska_farmica_',
    });
  }
  recordHttp(
    method: string,
    route: string,
    status: number,
    durationSeconds: number,
  ): void {
    const labels = {
      method,
      route,
      status_class: `${Math.floor(status / 100)}xx`,
    };
    this.httpRequests.inc(labels);
    this.httpDuration.observe(labels, durationSeconds);
  }
  recordMaintenance(
    job: string,
    processed: number,
    durationMs: number,
    failed: number,
  ): void {
    this.maintenanceRuns.inc({ job, outcome: failed ? 'failure' : 'success' });
    this.maintenanceProcessed.inc({ job }, processed);
    this.maintenanceDuration.observe({ job }, durationMs / 1000);
  }
  contentType(): string {
    return this.registry.contentType;
  }
  metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
