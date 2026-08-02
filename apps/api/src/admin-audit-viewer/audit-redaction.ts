const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'accesstoken',
  'cookie',
  'authorization',
  'sessiontokenhash',
  'secret',
  'connectionstring',
]);
export function redactAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactAuditValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        return [
          key,
          SENSITIVE_KEYS.has(normalized)
            ? '[REDACTED]'
            : redactAuditValue(item),
        ];
      }),
    );
  }
  return value;
}
export const REDACTED_AUDIT_KEYS = Array.from(SENSITIVE_KEYS);
