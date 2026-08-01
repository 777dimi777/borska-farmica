import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
const context = (role: string) => ({
  getHandler: () => null,
  getClass: () => null,
  switchToHttp: () => ({ getRequest: () => ({ admin: { role } }) }),
});
describe('RolesGuard', () => {
  it('allows an explicitly listed role', () =>
    expect(
      new RolesGuard({
        getAllAndOverride: () => ['ADMIN'],
      } as never).canActivate(context('ADMIN') as never),
    ).toBe(true));
  it('does not grant implicit SUPER_ADMIN hierarchy', () =>
    expect(() =>
      new RolesGuard({
        getAllAndOverride: () => ['ADMIN'],
      } as never).canActivate(context('SUPER_ADMIN') as never),
    ).toThrow(ForbiddenException));
  it('allows routes without role metadata', () =>
    expect(
      new RolesGuard({
        getAllAndOverride: () => undefined,
      } as never).canActivate(context('ADMIN') as never),
    ).toBe(true));
});
