import { PasswordService } from './password.service';
describe('PasswordService', () => {
  const service = new PasswordService();
  it('hashes with Argon2id and verifies correct password', async () => {
    const hash = await service.hash('StrongPassword123!');
    expect(hash).toContain('argon2id');
    await expect(service.verify(hash, 'StrongPassword123!')).resolves.toBe(
      true,
    );
  });
  it('rejects an incorrect password', async () => {
    const hash = await service.hash('StrongPassword123!');
    await expect(service.verify(hash, 'WrongPassword123!')).resolves.toBe(
      false,
    );
  });
  it('performs a dummy verification', async () =>
    await expect(service.verifyDummy('anything')).resolves.toBeUndefined());
});
