import { browserApi } from '@/lib/browser-api/client';
import type {
  Audit,
  AuditPage,
  CustomerDetail,
  CustomerOrdersPage,
  CustomerPage,
} from './types';
export const operationsApi = {
  customers: {
    list: (t: string, q: string) =>
      browserApi<CustomerPage>(`/admin/customers${q ? `?${q}` : ''}`, {
        token: t,
      }),
    detail: (t: string, id: string) =>
      browserApi<CustomerDetail>(`/admin/customers/${id}`, { token: t }),
    orders: (t: string, id: string, q: string) =>
      browserApi<CustomerOrdersPage>(
        `/admin/customers/${id}/orders${q ? `?${q}` : ''}`,
        { token: t },
      ),
    control: (
      t: string,
      id: string,
      action: 'disable' | 'enable' | 'revoke-sessions',
    ) =>
      browserApi<{ id: string; status?: string; revokedSessions: number }>(
        `/admin/customers/${id}/${action}`,
        { token: t, method: 'POST' },
      ),
  },
  audit: {
    list: (t: string, q: string) =>
      browserApi<AuditPage>(`/admin/audit-logs${q ? `?${q}` : ''}`, {
        token: t,
      }),
    detail: (t: string, id: string) =>
      browserApi<Audit>(`/admin/audit-logs/${id}`, { token: t }),
  },
};
