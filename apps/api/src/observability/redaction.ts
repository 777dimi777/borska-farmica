const SENSITIVE =
  /^(authorization|cookie|setcookie|password|passwordhash|currentpassword|newpassword|token|accesstoken|refreshtoken|tokenhash|sessiontokenhash|apikey|apisecret|secret|clientsecret|databaseurl|connectionstring)$/i;
const PII = /^(email|phone|address|firstname|lastname)$/i;
export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE.test(key.replace(/[-_]/g, '')) ||
      PII.test(key.replace(/[-_]/g, ''))
        ? '[REDACTED]'
        : redactSensitive(item),
    ]),
  );
}
