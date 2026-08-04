'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { ordersApi } from './api';
import type { OrderStatus } from './types';
export const orderKeys = {
  all: ['customer-orders'] as const,
  list: (q: unknown) => ['customer-orders', 'list', q] as const,
  detail: (n: string) => ['customer-orders', 'detail', n] as const,
};
export function useOrders(
  q: { page?: number; status?: OrderStatus; sort?: 'newest' | 'oldest' } = {},
) {
  const a = useAuth();
  return useQuery({
    queryKey: orderKeys.list(q),
    queryFn: () => a.authorized((t) => ordersApi.list(t, q)),
    enabled: a.status === 'authenticated',
  });
}
export function useOrder(n: string) {
  const a = useAuth();
  return useQuery({
    queryKey: orderKeys.detail(n),
    queryFn: () => a.authorized((t) => ordersApi.detail(t, n)),
    enabled: a.status === 'authenticated' && !!n,
  });
}
export function useCancelOrder() {
  const a = useAuth(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ number, reason }: { number: string; reason?: string }) =>
      a.authorized((t) => ordersApi.cancel(t, number, reason)),
    onSuccess: (o) => {
      q.setQueryData(orderKeys.detail(o.orderNumber), o);
      void q.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
