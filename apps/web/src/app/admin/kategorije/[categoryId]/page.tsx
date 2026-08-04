import { CategoryEditor } from '@/features/admin/catalog/categories';
export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  return <CategoryEditor id={(await params).categoryId} />;
}
