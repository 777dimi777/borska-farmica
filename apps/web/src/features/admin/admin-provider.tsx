'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { adminAuthApi } from './api';
import { adminMemorySession, refreshAdminSingleFlight } from './session';
import type { AdminProfile } from './types';
type Value = {
  status: 'loading' | 'authenticated' | 'anonymous';
  admin: AdminProfile | null;
  login: (x: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  authorized: <T>(run: (token: string) => Promise<T>) => Promise<T>;
};
const Context = createContext<Value | null>(null);
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Value['status']>('loading');
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const qc = useQueryClient();
  const anonymous = useCallback(() => {
    adminMemorySession.clear();
    setAdmin(null);
    setStatus('anonymous');
  }, []);
  const load = useCallback(async () => {
    const auth = await refreshAdminSingleFlight();
    const profile = await adminAuthApi.me(auth.accessToken);
    setAdmin(profile);
    setStatus('authenticated');
  }, []);
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => {
      if (active) anonymous();
    });
    return () => {
      active = false;
    };
  }, [load, anonymous]);
  const authorized = useCallback(
    async <T,>(run: (token: string) => Promise<T>) => {
      let token = adminMemorySession.get();
      if (!token) {
        try {
          await load();
          token = adminMemorySession.get();
        } catch {
          anonymous();
          throw new Error('unauthenticated');
        }
      }
      try {
        return await run(token!);
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !('kind' in error) ||
          (error as { kind?: string }).kind !== 'unauthenticated'
        )
          throw error;
        try {
          const auth = await refreshAdminSingleFlight();
          return await run(auth.accessToken);
        } catch {
          anonymous();
          throw error;
        }
      }
    },
    [load, anonymous],
  );
  const login = async (x: { email: string; password: string }) => {
    const auth = await adminAuthApi.login(x);
    adminMemorySession.set(auth.accessToken);
    setAdmin(await adminAuthApi.me(auth.accessToken));
    setStatus('authenticated');
  };
  const logout = async () => {
    try {
      await adminAuthApi.logout();
    } finally {
      anonymous();
      qc.clear();
    }
  };
  return (
    <Context.Provider value={{ status, admin, login, logout, authorized }}>
      {children}
    </Context.Provider>
  );
}
export function useAdmin() {
  const value = useContext(Context);
  if (!value) throw new Error('AdminProvider missing');
  return value;
}
