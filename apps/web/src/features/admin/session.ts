import { adminAuthApi } from './api';
import type { AdminAuthResponse } from './types';
let token: string | null = null;
let flight: Promise<AdminAuthResponse> | null = null;
export const adminMemorySession = {
  get: () => token,
  set: (v: string | null) => {
    token = v;
  },
  clear: () => {
    token = null;
  },
};
export function refreshAdminSingleFlight() {
  if (!flight)
    flight = adminAuthApi
      .refresh()
      .then((r) => {
        token = r.accessToken;
        return r;
      })
      .finally(() => {
        flight = null;
      });
  return flight;
}
export function resetAdminSessionForTests() {
  token = null;
  flight = null;
}
