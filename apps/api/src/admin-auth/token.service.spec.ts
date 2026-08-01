import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
describe('TokenService', () => {
  const jwt = { verifyAsync: jest.fn() };
  const config = {
    getOrThrow: (key: string) => (key.includes('TTL') ? 900 : 'x'.repeat(40)),
  };
  const service = new TokenService(jwt as never, config as never);
  it('rejects access token used as refresh', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'id', type: 'access' });
    await expect(service.verifyRefresh('token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('hashes tokens without storing raw values', () =>
    expect(service.hashToken('raw')).toMatch(/^[a-f0-9]{64}$/));
});
