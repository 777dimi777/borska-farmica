import { Injectable } from '@nestjs/common';
import { DashboardPeriodQueryDto } from './dto/dashboard-query.dto';
import { resolveDashboardPeriod } from './dashboard-period';

@Injectable()
export class AdminDashboardService {
  period(query: DashboardPeriodQueryDto) {
    return resolveDashboardPeriod(query.from, query.to);
  }
}
