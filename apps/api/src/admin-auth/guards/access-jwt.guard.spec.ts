import { UnauthorizedException } from '@nestjs/common';
import { AccessJwtGuard } from './access-jwt.guard';
const context = (authorization?: string) => {
  const request = { headers: { authorization } };
  return {
    request,
    context: { switchToHttp: () => ({ getRequest: () => request }) },
  };
};
describe('AccessJwtGuard', () => {
  it('attaches an active admin', async () => {
    const x = context('Bearer token');
    const guard = new AccessJwtGuard(
      {
        verifyAccess: jest.fn().mockResolvedValue({ sub: 'id', role: 'ADMIN' }),
      } as never,
      {
        adminUser: {
          findFirst: jest.fn().mockResolvedValue({ id: 'id', role: 'ADMIN' }),
        },
      } as never,
    );
    await expect(guard.canActivate(x.context as never)).resolves.toBe(true);
    expect(x.request).toHaveProperty('admin');
  });
  it('rejects missing bearer token', async () => {
    const guard = new AccessJwtGuard({} as never, {} as never);
    await expect(
      guard.canActivate(context().context as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects disabled, deleted or changed-role admin', async () => {
    const guard = new AccessJwtGuard(
      {
        verifyAccess: jest.fn().mockResolvedValue({ sub: 'id', role: 'ADMIN' }),
      } as never,
      { adminUser: { findFirst: jest.fn().mockResolvedValue(null) } } as never,
    );
    await expect(
      guard.canActivate(context('Bearer x').context as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
