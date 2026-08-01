export const HEALTH_SERVICE_NAME = 'borska-farmica-api' as const;

export interface LivenessResponse {
  status: 'ok';
  service: typeof HEALTH_SERVICE_NAME;
  timestamp: string;
  uptime: number;
}

export interface ReadinessResponse {
  status: 'ok';
  service: typeof HEALTH_SERVICE_NAME;
  timestamp: string;
  checks: { database: 'up' };
}

export interface NotReadyResponse {
  status: 'error';
  service: typeof HEALTH_SERVICE_NAME;
  timestamp: string;
  checks: { database: 'down' };
}
