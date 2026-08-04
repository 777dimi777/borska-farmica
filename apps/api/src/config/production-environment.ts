import type Joi from 'joi';

const PLACEHOLDER =
  /(change[-_ ]?me|example|placeholder|development|secret123)/i;
export function validateProductionEnvironment(
  value: Record<string, unknown>,
  helpers: Joi.CustomHelpers,
) {
  const keepAlive = Number(value.HTTP_KEEP_ALIVE_TIMEOUT_MS),
    headers = Number(value.HTTP_HEADERS_TIMEOUT_MS);
  if (headers <= keepAlive)
    return helpers.error('any.custom', {
      message: 'HTTP_HEADERS_TIMEOUT_MS must exceed keep-alive timeout',
    });
  if (value.NODE_ENV !== 'production') return value;
  const frontend =
    typeof value.FRONTEND_URL === 'string' ? value.FRONTEND_URL : '';
  try {
    const host = new URL(frontend).hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1')
      return helpers.error('any.custom', {
        message: 'production FRONTEND_URL cannot use localhost',
      });
  } catch {
    return helpers.error('any.custom', { message: 'invalid FRONTEND_URL' });
  }
  if (
    value.AUTH_COOKIE_SECURE !== true ||
    value.CUSTOMER_COOKIE_SECURE !== true ||
    value.CART_COOKIE_SECURE !== true
  )
    return helpers.error('any.custom', {
      message: 'production cookies must be Secure',
    });
  if (value.SWAGGER_ENABLED !== false)
    return helpers.error('any.custom', {
      message: 'Swagger must be explicitly disabled in production',
    });
  for (const key of [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'CUSTOMER_JWT_ACCESS_SECRET',
    'CUSTOMER_JWT_REFRESH_SECRET',
  ]) {
    const secret = typeof value[key] === 'string' ? value[key] : '';
    if (secret.length < 48 || PLACEHOLDER.test(secret))
      return helpers.error('any.custom', {
        message: `${key} is not production-safe`,
      });
  }
  return value;
}
