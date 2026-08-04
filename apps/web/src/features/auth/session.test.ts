import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./api', () => ({ authApi: { refresh: vi.fn() } }));
import { authApi } from './api';
import {
  memorySession,
  refreshSingleFlight,
  resetSessionForTests,
} from './session';
describe('memory session', () => {
  beforeEach(resetSessionForTests);
  it('shares one refresh promise', async () => {
    vi.mocked(authApi.refresh).mockResolvedValue({
      accessToken: 'memory-token',
      tokenType: 'Bearer',
      expiresIn: 1,
      customer: {
        id: '1',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.rs',
        phone: '+3811',
        emailVerified: false,
      },
    });
    await Promise.all([refreshSingleFlight(), refreshSingleFlight()]);
    expect(authApi.refresh).toHaveBeenCalledTimes(1);
    expect(memorySession.get()).toBe('memory-token');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
