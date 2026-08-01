import { ApiProperty } from '@nestjs/swagger';

export const HEALTH_SERVICE_NAME = 'borska-farmica-api' as const;

export class LivenessResponse {
  @ApiProperty({ example: 'ok' }) status!: 'ok';
  @ApiProperty({ example: HEALTH_SERVICE_NAME })
  service!: typeof HEALTH_SERVICE_NAME;
  @ApiProperty({ format: 'date-time' }) timestamp!: string;
  @ApiProperty({ example: 42.5 }) uptime!: number;
}

export class DatabaseUpCheck {
  @ApiProperty({ example: 'up' }) database!: 'up';
}

export class ReadinessResponse {
  @ApiProperty({ example: 'ok' }) status!: 'ok';
  @ApiProperty({ example: HEALTH_SERVICE_NAME })
  service!: typeof HEALTH_SERVICE_NAME;
  @ApiProperty({ format: 'date-time' }) timestamp!: string;
  @ApiProperty({ type: DatabaseUpCheck }) checks!: { database: 'up' };
}

export interface NotReadyResponse {
  status: 'error';
  service: typeof HEALTH_SERVICE_NAME;
  timestamp: string;
  checks: { database: 'down' };
}
