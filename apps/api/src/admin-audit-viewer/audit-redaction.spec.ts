import { redactAuditValue } from './audit-redaction';
describe('audit redaction', () => {
  it('recursively redacts exact sensitive key names', () => {
    expect(
      redactAuditValue({
        safe: 'ok',
        password: 'x',
        nested: [{ refresh_token: 'y', tokenCount: 2 }],
        connectionString: 'db',
      }),
    ).toEqual({
      safe: 'ok',
      password: '[REDACTED]',
      nested: [{ refresh_token: '[REDACTED]', tokenCount: 2 }],
      connectionString: '[REDACTED]',
    });
  });
});
