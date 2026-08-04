import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config/env';
import { getProducts } from '@/lib/api/catalog';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes = [
    '',
    '/proizvodi',
    '/o-nama',
    '/preuzimanje',
    '/kontakt',
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: (path === '/proizvodi'
      ? 'daily'
      : path
        ? 'monthly'
        : 'weekly') as 'daily' | 'monthly' | 'weekly',
    priority: path?.length ? 0.7 : 1,
  }));
  try {
    const first = await getProducts({ page: 1, limit: 48, sort: 'newest' });
    const pages = [first];
    for (let page = 2; page <= first.pagination.totalPages; page++)
      pages.push(await getProducts({ page, limit: 48, sort: 'newest' }));
    return [
      ...staticRoutes,
      ...pages
        .flatMap((x) => x.data)
        .map((p) => ({
          url: `${base}/proizvodi/${p.slug}`,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })),
    ];
  } catch {
    return staticRoutes;
  }
}
