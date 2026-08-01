import { AdminBootstrapService } from './admin-bootstrap.service';
const input = {
  email: ' Admin@Example.COM ',
  password: 'StrongPassword123!',
  firstName: ' Test ',
  lastName: ' Admin ',
  role: 'SUPER_ADMIN' as const,
};
describe('AdminBootstrapService', () => {
  const findUnique = jest.fn();
  const create = jest.fn();
  const hash = jest.fn().mockResolvedValue('argon-hash');
  const service = new AdminBootstrapService(
    { adminUser: { findUnique, create } } as never,
    { hash } as never,
  );
  beforeEach(() => jest.clearAllMocks());
  it('normalizes input and hashes before create', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.create(input)).resolves.toBe('created');
    const call = JSON.stringify(create.mock.calls);
    for (const value of ['admin@example.com', 'argon-hash', 'Test', 'Admin'])
      expect(call).toContain(value);
    expect(JSON.stringify(create.mock.calls)).not.toContain(input.password);
  });
  it('is idempotent and never changes an existing password', async () => {
    findUnique.mockResolvedValue({ id: 'id' });
    await expect(service.create(input)).resolves.toBe('exists');
    expect(hash).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
