'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { memorySession, refreshSingleFlight } from './session';
import type {
  CustomerProfile,
  LoginInput,
  ProfileInput,
  RegisterInput,
} from './types';
type State = 'loading' | 'authenticated' | 'anonymous';
type Value = {
  status: State;
  customer: CustomerProfile | null;
  login: (x: LoginInput) => Promise<void>;
  register: (x: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (x: ProfileInput) => Promise<void>;
  changePassword: (x: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  authorized: <T>(run: (token: string) => Promise<T>) => Promise<T>;
};
const C = createContext<Value | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<State>('loading');
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const qc = useQueryClient();
  const becomeAnonymous = useCallback(() => {
    memorySession.clear();
    setCustomer(null);
    setStatus('anonymous');
  }, []);
  const load = useCallback(
    async (r?: Awaited<ReturnType<typeof refreshSingleFlight>>) => {
      const a = r ?? (await refreshSingleFlight());
      memorySession.set(a.accessToken);
      const p = await authApi.me(a.accessToken);
      setCustomer(p);
      setStatus('authenticated');
    },
    [],
  );
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => {
      if (active) becomeAnonymous();
    });
    return () => {
      active = false;
    };
  }, [load, becomeAnonymous]);
  const authorized = useCallback(
    async <T,>(run: (t: string) => Promise<T>) => {
      let token = memorySession.get();
      if (!token) {
        try {
          await load();
          token = memorySession.get();
        } catch {
          becomeAnonymous();
          throw new Error('unauthenticated');
        }
      }
      try {
        return await run(token!);
      } catch (e) {
        if (
          !(e instanceof Error) ||
          !('kind' in e) ||
          (e as { kind?: string }).kind !== 'unauthenticated'
        )
          throw e;
        try {
          const a = await refreshSingleFlight();
          memorySession.set(a.accessToken);
          return await run(a.accessToken);
        } catch {
          becomeAnonymous();
          throw e;
        }
      }
    },
    [load, becomeAnonymous],
  );
  const login = async (x: LoginInput) => {
    const a = await authApi.login(x);
    memorySession.set(a.accessToken);
    setCustomer(await authApi.me(a.accessToken));
    setStatus('authenticated');
  };
  const register = async (x: RegisterInput) => {
    const a = await authApi.register(x);
    memorySession.set(a.accessToken);
    setCustomer(await authApi.me(a.accessToken));
    setStatus('authenticated');
  };
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      becomeAnonymous();
      qc.removeQueries({ queryKey: ['customer'] });
    }
  };
  const updateProfile = async (x: ProfileInput) =>
    setCustomer(await authorized((t) => authApi.update(t, x)));
  const changePassword = async (x: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await authorized((t) => authApi.changePassword(t, x));
    await authApi.logout().catch(() => undefined);
    becomeAnonymous();
  };
  const value = {
    status,
    customer,
    login,
    register,
    logout,
    refreshSession: () => load(),
    updateProfile,
    changePassword,
    authorized,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useAuth = () => {
  const v = useContext(C);
  if (!v) throw new Error('AuthProvider missing');
  return v;
};
