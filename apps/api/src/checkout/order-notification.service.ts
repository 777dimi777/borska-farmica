import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type OrderNotification = {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickup: { name: string; address: string; requestedPickupDate: string };
  customerNote: string | null;
  items: Array<{
    productName: string;
    variantName: string;
    packageAmount: string;
    measurementUnit: string;
    quantity: string;
    lineTotal: string;
  }>;
  summary: { total: string; currency: string };
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character]!,
  );

@Injectable()
export class OrderNotificationService {
  private readonly logger = new Logger(OrderNotificationService.name);

  constructor(private readonly config: ConfigService) {}

  async orderCreated(order: OrderNotification): Promise<void> {
    const key = this.config.get<string>('RESEND_API_KEY');
    if (!key) {
      this.logger.warn({
        event: 'order.email.skipped',
        reason: 'not_configured',
      });
      return;
    }

    const to = this.config.get<string>(
      'ORDER_NOTIFICATION_EMAIL_TO',
      this.config.get<string>('CONTACT_EMAIL_TO', 'borskafarmica@gmail.com'),
    );
    const from = this.config.get<string>(
      'CONTACT_EMAIL_FROM',
      'Borska Farmica <onboarding@resend.dev>',
    );
    const frontendUrl = this.config
      .get<string>('FRONTEND_URL', '')
      .replace(/\/$/, '');
    const adminUrl = `${frontendUrl}/admin/porudzbine/${encodeURIComponent(order.orderNumber)}`;
    const itemLines = order.items.map(
      (item) =>
        `- ${item.productName} (${item.variantName}), ${item.quantity} × ${item.packageAmount} ${item.measurementUnit}: ${item.lineTotal} RSD`,
    );
    const text = [
      `Nova porudžbina ${order.orderNumber}`,
      '',
      `Kupac: ${order.customer.firstName} ${order.customer.lastName}`,
      `Email: ${order.customer.email}`,
      `Telefon: ${order.customer.phone}`,
      `Preuzimanje: ${order.pickup.name}, ${order.pickup.address}`,
      `Traženi datum: ${order.pickup.requestedPickupDate}`,
      order.customerNote ? `Napomena: ${order.customerNote}` : '',
      '',
      'Proizvodi:',
      ...itemLines,
      '',
      `Ukupno: ${order.summary.total} ${order.summary.currency}`,
      `Otvori u adminu: ${adminUrl}`,
    ]
      .filter((line) => line !== '')
      .join('\n');
    const itemsHtml = order.items
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.productName)}</strong> (${escapeHtml(item.variantName)}) — ${escapeHtml(item.quantity)} × ${escapeHtml(item.packageAmount)} ${escapeHtml(item.measurementUnit)}: ${escapeHtml(item.lineTotal)} RSD</li>`,
      )
      .join('');

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: order.customer.email,
          subject: `[Nova porudžbina] ${order.orderNumber} — ${order.summary.total} RSD`,
          text,
          html: `<h2>Nova porudžbina ${escapeHtml(order.orderNumber)}</h2><p><strong>Kupac:</strong> ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}<br><strong>Email:</strong> ${escapeHtml(order.customer.email)}<br><strong>Telefon:</strong> ${escapeHtml(order.customer.phone)}</p><p><strong>Preuzimanje:</strong> ${escapeHtml(order.pickup.name)}, ${escapeHtml(order.pickup.address)}<br><strong>Traženi datum:</strong> ${escapeHtml(order.pickup.requestedPickupDate)}</p>${order.customerNote ? `<p><strong>Napomena:</strong> ${escapeHtml(order.customerNote)}</p>` : ''}<h3>Proizvodi</h3><ul>${itemsHtml}</ul><p style="font-size:18px"><strong>Ukupno: ${escapeHtml(order.summary.total)} ${escapeHtml(order.summary.currency)}</strong></p><p><a href="${escapeHtml(adminUrl)}">Otvori porudžbinu u admin dashboardu</a></p>`,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        this.logger.error({
          event: 'order.email.failed',
          orderNumber: order.orderNumber,
          status: response.status,
        });
        return;
      }
      this.logger.log({
        event: 'order.email.sent',
        orderNumber: order.orderNumber,
      });
    } catch (error) {
      this.logger.error({
        event: 'order.email.failed',
        orderNumber: order.orderNumber,
        reason: error instanceof Error ? error.name : 'unknown',
      });
    }
  }
}
