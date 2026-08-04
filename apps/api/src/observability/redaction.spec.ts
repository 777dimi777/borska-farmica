import { redactSensitive } from './redaction';
import { sanitizeSentryEvent } from './sentry.service';

describe('observability redaction', () => {
  it('recursively redacts credentials and customer PII', () => {
    expect(
      redactSensitive({
        authorization: 'Bearer secret',
        nested: { password: 'secret', email: 'customer@example.test' },
        safe: 'visible',
      }),
    ).toEqual({
      authorization: '[REDACTED]',
      nested: { password: '[REDACTED]', email: '[REDACTED]' },
      safe: 'visible',
    });
  });

  it('removes request payload, query and cookies from Sentry events', () => {
    const event = sanitizeSentryEvent({
      request: {
        data: { password: 'secret' },
        query_string: 'token=secret',
        cookies: 'session=secret',
        method: 'POST',
      },
    });
    expect(event).toEqual({ request: { method: 'POST' } });
  });
});
