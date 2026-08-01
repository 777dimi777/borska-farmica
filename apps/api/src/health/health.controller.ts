import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthService } from './health.service';
import { LivenessResponse, ReadinessResponse } from './health.types';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ type: LivenessResponse })
  getLiveness(): LivenessResponse {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOkResponse({ type: ReadinessResponse })
  @ApiServiceUnavailableResponse({ description: 'Database is unavailable.' })
  getReadiness(): Promise<ReadinessResponse> {
    return this.healthService.getReadiness();
  }
}
