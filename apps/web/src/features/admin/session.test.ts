import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./api', () => ({ adminAuthApi: { refresh: vi.fn() } }));
import { adminAuthApi } from './api';
import {
  adminMemorySession,
  refreshAdminSingleFlight,
  resetAdminSessionForTests,
} from './session';
describe('admin memory session', () => {
  beforeEach(() => {
    resetAdminSessionForTests();
    vi.clearAllMocks();
  });
  it('drži access token samo u memoriji', () => {
    expect(adminMemorySession.get()).toBeNull();
    adminMemorySession.set('access');
    expect(adminMemorySession.get()).toBe('access');
    adminMemorySession.clear();
    expect(adminMemorySession.get()).toBeNull();
  });
  it('spaja paralelne refresh zahteve', async () => {
    vi.mocked(adminAuthApi.refresh).mockResolvedValue({
      accessToken: 'new',
      tokenType: 'Bearer',
      expiresIn: 900,
      admin: {
        id: 'a',
        email: 'admin@example.com',
        firstName: 'Ana',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });
    const [a, b] = await Promise.all([
      refreshAdminSingleFlight(),
      refreshAdminSingleFlight(),
    ]);
    expect(adminAuthApi.refresh).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
    expect(adminMemorySession.get()).toBe('new');
  });
});
