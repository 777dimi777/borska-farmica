import { browserApi } from '@/lib/browser-api/client';
import type {
  AuthResponse,
  CustomerProfile,
  LoginInput,
  ProfileInput,
  RegisterInput,
} from './types';
export const authApi = {
  login: (x: LoginInput) =>
    browserApi<AuthResponse>('/auth/login', { method: 'POST', body: x }),
  register: (x: RegisterInput) =>
    browserApi<AuthResponse>('/auth/register', { method: 'POST', body: x }),
  refresh: () => browserApi<AuthResponse>('/auth/refresh', { method: 'POST' }),
  logout: () => browserApi<void>('/auth/logout', { method: 'POST' }),
  me: (token: string) => browserApi<CustomerProfile>('/account/me', { token }),
  update: (token: string, x: ProfileInput) =>
    browserApi<CustomerProfile>('/account/me', {
      method: 'PATCH',
      token,
      body: x,
    }),
  changePassword: (
    token: string,
    x: { currentPassword: string; newPassword: string },
  ) =>
    browserApi<AuthResponse>('/account/change-password', {
      method: 'POST',
      token,
      body: x,
    }),
};
