import { UnauthorizedException } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
const admin = {
  id: 'id',
  email: 'admin@example.com',
  firstName: 'A',
  lastName: 'B',
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  passwordHash: 'hash',
};
describe('AdminAuthService', () => {
  const findUnique = jest.fn();
  const update = jest.fn();
  const verify = jest.fn();
  const verifyDummy = jest.fn();
  const create = jest.fn();
  const service = new AdminAuthService(
    { adminUser: { findUnique, update } } as never,
    { verify, verifyDummy } as never,
    { create, rotate: jest.fn(), revoke: jest.fn() } as never,
    {
      signAccess: jest.fn().mockResolvedValue('access'),
      accessTtl: () => 900,
    } as never,
  );
  beforeEach(() => {
    jest.clearAllMocks();
    update.mockResolvedValue(admin);
    create.mockResolvedValue('refresh');
  });
  it('logs in an active admin and creates a session', async () => {
    findUnique.mockResolvedValue(admin);
    verify.mockResolvedValue(true);
    const result = await service.login(
      { email: ' ADMIN@example.com ', password: 'StrongPassword123!' },
      {},
    );
    expect(result.response).toMatchObject({
      accessToken: 'access',
      admin: { email: 'admin@example.com' },
    });
    expect(create).toHaveBeenCalled();
  });
  it('uses generic 401 for wrong password', async () => {
    findUnique.mockResolvedValue(admin);
    verify.mockResolvedValue(false);
    await expect(
      service.login({ email: admin.email, password: 'WrongPassword123!' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('does dummy work and returns same generic 401 for missing admin', async () => {
    findUnique.mockResolvedValue(null);
    verifyDummy.mockResolvedValue(undefined);
    await expect(
      service.login(
        { email: 'none@example.com', password: 'WrongPassword123!' },
        {},
      ),
    ).rejects.toMatchObject({ message: 'Invalid credentials.' });
    expect(verifyDummy).toHaveBeenCalled();
  });
  it('rejects disabled admin', async () => {
    findUnique.mockResolvedValue({ ...admin, status: 'DISABLED' });
    verify.mockResolvedValue(true);
    await expect(
      service.login({ email: admin.email, password: 'StrongPassword123!' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
