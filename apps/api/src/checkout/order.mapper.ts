import { Prisma } from '../generated/prisma/client';

export const orderResponseInclude = {
  pickupLocation: {
    select: {
      id: true,
      code: true,
      name: true,
      address: true,
      instructions: true,
    },
  },
  items: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] },
} satisfies Prisma.OrderInclude;

export type OrderResponseRecord = Prisma.OrderGetPayload<{
  include: typeof orderResponseInclude;
}>;

export function mapOrder(order: OrderResponseRecord, idempotentReplay = false) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    pickup: {
      locationId: order.pickupLocation.id,
      code: order.pickupLocation.code,
      name: order.pickupLocation.name,
      address: order.pickupLocation.address,
      instructions: order.pickupLocation.instructions,
      requestedPickupDate: order.requestedPickupDate.toISOString().slice(0, 10),
      confirmedPickupAt: order.confirmedPickupAt,
      exactTimeRequiresConfirmation: true,
      confirmationMessage:
        'Tačan termin preuzimanja admin potvrđuje telefonom.',
    },
    customer: {
      firstName: order.customerFirstName,
      lastName: order.customerLastName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    customerNote: order.customerNote,
    items: order.items.map((item) => ({
      productName: item.productName,
      productSlug: item.productSlug,
      variantName: item.variantName,
      sku: item.sku,
      packageAmount: item.packageAmount.toFixed(3),
      measurementUnit: item.measurementUnit,
      quantity: item.quantity.toFixed(3),
      unitPrice: item.unitPrice.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
      imageUrl: item.imageUrl,
    })),
    summary: {
      subtotal: order.subtotal.toFixed(2),
      fee: '0.00',
      total: order.total.toFixed(2),
      currency: order.currency,
    },
    createdAt: order.createdAt,
    idempotentReplay,
  };
}
