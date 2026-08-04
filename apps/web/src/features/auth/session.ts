import { authApi } from './api';
import type { AuthResponse } from './types';
let accessToken: string | null = null;
let refreshFlight: Promise<AuthResponse> | null = null;
export const memorySession = {
  get: () => accessToken,
  set: (v: string | null) => {
    accessToken = v;
  },
  clear: () => {
    accessToken = null;
  },
};
export function refreshSingleFlight() {
  if (!refreshFlight)
    refreshFlight = authApi
      .refresh()
      .then((r) => ((accessToken = r.accessToken), r))
      .finally(() => {
        refreshFlight = null;
      });
  return refreshFlight;
}
export function resetSessionForTests() {
  accessToken = null;
  refreshFlight = null;
}
