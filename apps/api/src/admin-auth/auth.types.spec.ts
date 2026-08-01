import { normalizeEmail, toAdminSummary } from './auth.types';
describe('admin auth mapping', () => {
  it('normalizes email', () =>
    expect(normalizeEmail(' Admin@Example.COM ')).toBe('admin@example.com'));
  it('never maps passwordHash', () => {
    const result = toAdminSummary({
      id: '1',
      email: 'a@b.c',
      firstName: 'A',
      lastName: 'B',
      role: 'ADMIN',
      passwordHash: 'secret',
    } as never);
    expect(result).not.toHaveProperty('passwordHash');
  });
});
