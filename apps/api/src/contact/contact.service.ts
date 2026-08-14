import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ContactMessageDto } from './dto/contact-message.dto';

const htmlEscape = (value: string) =>
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
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(private readonly config: ConfigService) {}

  async send(dto: ContactMessageDto): Promise<void> {
    if (dto.website) return;
    const key = this.config.get<string>('RESEND_API_KEY');
    const to = this.config.get<string>(
      'CONTACT_EMAIL_TO',
      'borskafarmica@gmail.com',
    );
    const from = this.config.get<string>(
      'CONTACT_EMAIL_FROM',
      'Borska Farmica <onboarding@resend.dev>',
    );
    if (!key)
      throw new ServiceUnavailableException('Contact email is not configured.');
    const order = dto.orderNumber
      ? `\nBroj porudžbine: ${dto.orderNumber}`
      : '';
    const text = `Nova poruka sa sajta Borska Farmica\n\nIme: ${dto.name}\nEmail: ${dto.email}\nTema: ${dto.topic}${order}\n\nPoruka:\n${dto.message}`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: dto.email,
        subject: `[Borska Farmica] ${dto.topic} — ${dto.name}`,
        text,
        html: `<h2>Nova poruka sa sajta</h2><p><strong>Ime:</strong> ${htmlEscape(dto.name)}</p><p><strong>Email:</strong> ${htmlEscape(dto.email)}</p><p><strong>Tema:</strong> ${htmlEscape(dto.topic)}</p>${dto.orderNumber ? `<p><strong>Broj porudžbine:</strong> ${htmlEscape(dto.orderNumber)}</p>` : ''}<p><strong>Poruka:</strong></p><p>${htmlEscape(dto.message).replace(/\n/g, '<br>')}</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      this.logger.error({
        event: 'contact.email.failed',
        status: response.status,
      });
      throw new ServiceUnavailableException(
        'Contact message could not be delivered.',
      );
    }
    this.logger.log({ event: 'contact.email.sent', topic: dto.topic });
  }
}
