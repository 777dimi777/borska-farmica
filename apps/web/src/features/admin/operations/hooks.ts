'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '../admin-provider';
import { operationsApi } from './api';
import { operationKeys } from './query';
export function useCustomers(q: string) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: operationKeys.customerList(q),
    queryFn: () => authorized((t) => operationsApi.customers.list(t, q)),
    enabled: status === 'authenticated',
    staleTime: 20000,
  });
}
export function useCustomer(id: string) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: operationKeys.customer(id),
    queryFn: () => authorized((t) => operationsApi.customers.detail(t, id)),
    enabled: status === 'authenticated' && !!id,
  });
}
export function useCustomerOrders(id: string, q: string) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: operationKeys.orders(id, q),
    queryFn: () => authorized((t) => operationsApi.customers.orders(t, id, q)),
    enabled: status === 'authenticated' && !!id,
  });
}
export function useCustomerControl(id: string) {
  const { authorized } = useAdmin(),
    qc = useQueryClient();
  return useMutation({
    mutationFn: (action: 'disable' | 'enable' | 'revoke-sessions') =>
      authorized((t) => operationsApi.customers.control(t, id, action)),
    retry: false,
    onSettled: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: operationKeys.customers }),
        qc.invalidateQueries({ queryKey: operationKeys.customer(id) }),
      ]);
    },
  });
}
export function useAuditList(q: string, enabled: boolean) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: operationKeys.auditList(q),
    queryFn: () => authorized((t) => operationsApi.audit.list(t, q)),
    enabled: enabled && status === 'authenticated',
  });
}
export function useAudit(id: string, enabled: boolean) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: operationKeys.audit(id),
    queryFn: () => authorized((t) => operationsApi.audit.detail(t, id)),
    enabled: enabled && status === 'authenticated' && !!id,
  });
}
