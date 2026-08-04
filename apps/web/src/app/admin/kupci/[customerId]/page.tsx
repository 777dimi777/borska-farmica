import { CustomerDetailView } from '@/features/admin/operations/customers';
export default async function Page({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  return <CustomerDetailView id={(await params).customerId} />;
}
