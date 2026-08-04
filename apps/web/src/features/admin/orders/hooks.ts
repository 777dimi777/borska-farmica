'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '../admin-provider';
import { adminOrdersApi } from './api';
import {
  adminOrderKeys,
  serializeOrderFilters,
  type OrderFilters,
} from './query';
import type { TransitionInput } from './types';
export function useAdminOrders(filters: OrderFilters) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: adminOrderKeys.list(filters),
    queryFn: () =>
      authorized((t) =>
        adminOrdersApi.list(t, serializeOrderFilters(filters).toString()),
      ),
    enabled: status === 'authenticated',
    staleTime: 25_000,
  });
}
export function useAdminOrder(id: string) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => authorized((t) => adminOrdersApi.detail(t, id)),
    enabled: status === 'authenticated' && !!id,
    staleTime: 10_000,
  });
}
export function usePickupLocations() {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: ['admin-orders', 'pickup-locations'],
    queryFn: () => authorized(adminOrdersApi.pickupLocations),
    enabled: status === 'authenticated',
    staleTime: 300_000,
  });
}
async function invalidateBase(
  qc: ReturnType<typeof useQueryClient>,
  id: string,
) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: adminOrderKeys.detail(id) }),
    qc.invalidateQueries({ queryKey: adminOrderKeys.lists() }),
    qc.invalidateQueries({ queryKey: ['admin-dashboard', 'overview'] }),
    qc.invalidateQueries({ queryKey: ['admin-dashboard', 'recent'] }),
    qc.invalidateQueries({ queryKey: ['admin-dashboard', 'attention'] }),
    qc.invalidateQueries({ queryKey: ['admin-dashboard', 'statuses'] }),
    qc.invalidateQueries({ queryKey: ['admin-dashboard', 'flow'] }),
  ]);
}
export function useOrderTransition() {
  const { authorized } = useAdmin();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TransitionInput }) =>
      authorized((t) => adminOrdersApi.transition(t, id, body)),
    retry: false,
    onSuccess: async (data, variables) => {
      qc.setQueryData(adminOrderKeys.detail(variables.id), data);
      await invalidateBase(qc, variables.id);
      if (variables.body.targetStatus === 'COMPLETED')
        await Promise.all([
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'revenue'] }),
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'products'] }),
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'categories'] }),
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'pickups'] }),
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'inventory'] }),
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'alerts'] }),
        ]);
      if (variables.body.targetStatus === 'CANCELLED')
        await Promise.all([
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'inventory'] }),
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'alerts'] }),
          qc.invalidateQueries({ queryKey: ['admin-dashboard', 'attention'] }),
        ]);
    },
  });
}
