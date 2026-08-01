import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { evaluateAvailability } from '../products/availability';
import {
  AdminAvailabilityWindowDto,
  AvailabilityPreviewDto,
} from './dto/availability.dto';
@Injectable()
export class AdminAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}
  async list(productId: string): Promise<AdminAvailabilityWindowDto[]> {
    await this.requireProduct(productId);
    const rows = await this.prisma.availabilityWindow.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => ({
      id: row.id,
      productId: row.productId,
      type: row.type,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      startMonth: row.startMonth,
      startDay: row.startDay,
      endMonth: row.endMonth,
      endDay: row.endDay,
      isActive: row.isActive,
      label: row.publicLabel,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }
  async preview(
    productId: string,
    at?: string,
  ): Promise<AvailabilityPreviewDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        availabilityMode: true,
        isManuallyAvailable: true,
        variants: {
          where: { isActive: true },
          select: {
            stockQuantity: true,
            reservedQuantity: true,
            allowBackorder: true,
          },
        },
        availabilityWindows: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            isActive: true,
            type: true,
            startsAt: true,
            endsAt: true,
            startMonth: true,
            startDay: true,
            endMonth: true,
            endDay: true,
            publicLabel: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found.');
    const evaluatedAt = at ? new Date(at) : new Date();
    const result = evaluateAvailability(
      {
        mode: product.availabilityMode,
        manuallyAvailable: product.isManuallyAvailable,
        variants: product.variants,
        windows: product.availabilityWindows,
      },
      evaluatedAt,
    );
    return {
      productId,
      mode: result.mode,
      evaluatedAt: evaluatedAt.toISOString(),
      businessDate: result.businessDate,
      currentlyAvailable: result.currentlyAvailable,
      inStock: result.inStock,
      purchasable: result.purchasable,
      label: result.label,
      matchedWindowId: result.matchedWindowId,
      businessReason: result.businessReason,
      stockReason: result.stockReason,
    };
  }
  private async requireProduct(id: string) {
    if (
      !(await this.prisma.product.findUnique({
        where: { id },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Product not found.');
  }
}
