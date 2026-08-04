import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config/env';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/o-nama', '/preuzimanje', '/kontakt'].map((path) => ({
    url: `${siteUrl()}${path}`,
    changeFrequency: path ? 'monthly' : 'weekly',
    priority: path?.length ? 0.7 : 1,
  }));
}
