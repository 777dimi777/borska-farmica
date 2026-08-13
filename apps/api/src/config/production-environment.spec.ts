import { validateProductionEnvironment } from './production-environment';

const safe = {
  NODE_ENV: 'production',
  FRONTEND_URL: 'https://shop.example.test',
  AUTH_COOKIE_SECURE: true,
  CUSTOMER_COOKIE_SECURE: true,
  CART_COOKIE_SECURE: true,
  SWAGGER_ENABLED: false,
  HTTP_KEEP_ALIVE_TIMEOUT_MS: 65000,
  HTTP_HEADERS_TIMEOUT_MS: 66000,
  JWT_ACCESS_SECRET: 'a'.repeat(48),
  JWT_REFRESH_SECRET: 'b'.repeat(48),
  CUSTOMER_JWT_ACCESS_SECRET: 'c'.repeat(48),
  CUSTOMER_JWT_REFRESH_SECRET: 'd'.repeat(48),
};
const helpers = {
  error: jest.fn((_code: string, context: unknown) => ({ error: context })),
} as never;

describe('production environment validation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('accepts an explicit production-safe configuration', () => {
    expect(validateProductionEnvironment({ ...safe }, helpers)).toEqual(safe);
  });

  it('accepts Render generated 256-bit base64 secrets', () => {
    const generated = 'B0jrphAPOY7pg92AN0c9MN4yecczLMdwnx4OkA1KFUk=';
    expect(
      validateProductionEnvironment(
        {
          ...safe,
          JWT_ACCESS_SECRET: generated,
          JWT_REFRESH_SECRET: generated.replace('B', 'C'),
          CUSTOMER_JWT_ACCESS_SECRET: generated.replace('B', 'D'),
          CUSTOMER_JWT_REFRESH_SECRET: generated.replace('B', 'E'),
        },
        helpers,
      ),
    ).not.toHaveProperty('error');
  });
  it.each([
    ['localhost origin', { FRONTEND_URL: 'http://localhost:3000' }],
    ['insecure cookies', { CART_COOKIE_SECURE: false }],
    ['enabled Swagger', { SWAGGER_ENABLED: true }],
    ['placeholder secret', { JWT_ACCESS_SECRET: 'change-me'.repeat(8) }],
    ['unsafe timeouts', { HTTP_HEADERS_TIMEOUT_MS: 65000 }],
  ])('rejects %s', (_name, override) => {
    expect(
      validateProductionEnvironment({ ...safe, ...override }, helpers),
    ).toHaveProperty('error');
  });
});
