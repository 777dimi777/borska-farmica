import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { AdminRole } from '../generated/prisma/enums';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  DashboardPeriodQueryDto,
  RevenueSeriesQueryDto,
  TopProductsQueryDto,
} from './dto/dashboard-query.dto';

@ApiTags('Admin Dashboard')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Read dashboard KPI values and previous-period comparisons',
  })
  overview(@Query() query: DashboardPeriodQueryDto) {
    return this.dashboard.overview(query);
  }

  @Get('revenue-series')
  @ApiOperation({
    summary: 'Read completed and paid revenue in gap-free buckets',
  })
  revenueSeries(@Query() query: RevenueSeriesQueryDto) {
    return this.dashboard.revenueSeries(query);
  }

  @Get('orders-by-status')
  @ApiOperation({
    summary: 'Read all order statuses for orders created in the period',
  })
  ordersByStatus(@Query() query: DashboardPeriodQueryDto) {
    return this.dashboard.ordersByStatus(query);
  }

  @Get('order-flow')
  @ApiOperation({
    summary: 'Read independent order event counts by event timestamp',
  })
  orderFlow(@Query() query: DashboardPeriodQueryDto) {
    return this.dashboard.orderFlow(query);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Rank completed and paid product snapshot sales' })
  topProducts(@Query() query: TopProductsQueryDto) {
    return this.dashboard.topProducts(query);
  }

  @Get('category-sales')
  @ApiOperation({
    summary: 'Read completed and paid sales by category snapshot',
  })
  categorySales(@Query() query: DashboardPeriodQueryDto) {
    return this.dashboard.categorySales(query);
  }

  @Get('pickup-sales')
  @ApiOperation({ summary: 'Read completed and paid sales by pickup location' })
  pickupSales(@Query() query: DashboardPeriodQueryDto) {
    return this.dashboard.pickupSales(query);
  }
}
