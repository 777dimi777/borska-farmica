import { ApiProperty } from '@nestjs/swagger';
export const HEALTH_SERVICE_NAME = 'borska-farmica-api' as const;
export class RuntimeInfo {
  @ApiProperty({ example: HEALTH_SERVICE_NAME })
  service!: typeof HEALTH_SERVICE_NAME;
  @ApiProperty({ example: 'development' }) environment!: string;
  @ApiProperty({ example: 'development' }) version!: string;
  @ApiProperty({ example: 'unknown' }) commit!: string;
  @ApiProperty({ format: 'date-time' }) timestamp!: string;
}
export class LivenessResponse extends RuntimeInfo {
  @ApiProperty({ example: 'ok' }) status!: 'ok';
  @ApiProperty({ example: 42.5 }) uptime!: number;
}
export class DatabaseUpCheck {
  @ApiProperty({ example: 'up' }) database!: 'up';
}
export class ReadinessResponse extends RuntimeInfo {
  @ApiProperty({ example: 'ok' }) status!: 'ok';
  @ApiProperty({ type: DatabaseUpCheck }) checks!: { database: 'up' };
}
export interface NotReadyResponse {
  status: 'error';
  service: typeof HEALTH_SERVICE_NAME;
  environment: string;
  version: string;
  commit: string;
  timestamp: string;
  checks: { database: 'down' };
}
