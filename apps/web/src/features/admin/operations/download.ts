import { publicApiUrl } from '@/lib/config/env';
import { BrowserApiError } from '@/lib/browser-api/client';
export function safeCsvFilename(header: string | null, fallback: string) {
  let name = '';
  if (header) {
    const star = header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i),
      plain = header.match(/filename\s*=\s*"?([^";]+)"?/i);
    try {
      name = star
        ? decodeURIComponent(star[1].trim().replace(/^"|"$/g, ''))
        : (plain?.[1].trim() ?? '');
    } catch {
      name = '';
    }
  }
  name = name
    .replace(/[\\/\0-\x1f\x7f]/g, '-')
    .replace(/[^\p{L}\p{N}._ -]/gu, '-')
    .slice(0, 120)
    .replace(/\.+$/, '');
  if (!name.toLowerCase().endsWith('.csv')) name = '';
  return name || fallback.replace(/\.csv$/i, '') + '.csv';
}
export async function downloadAdminCsv(
  token: string,
  path: string,
  fallback: string,
) {
  let response: Response;
  try {
    response = await fetch(`${publicApiUrl()}${path}`, {
      credentials: 'include',
      headers: { Accept: 'text/csv', Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30000),
    });
  } catch (e) {
    throw new BrowserApiError(
      e instanceof Error &&
        (e.name === 'AbortError' || e.name === 'TimeoutError')
        ? 'timeout'
        : 'network',
    );
  }
  if (!response.ok) {
    const kind =
      response.status === 401
        ? 'unauthenticated'
        : response.status === 403
          ? 'forbidden'
          : response.status === 422
            ? 'business'
            : response.status === 429
              ? 'rate-limit'
              : response.status >= 500
                ? 'unavailable'
                : 'unexpected';
    throw new BrowserApiError(
      kind,
      response.status,
      response.headers.get('X-Request-ID') ?? undefined,
    );
  }
  const blob = await response.blob(),
    name = safeCsvFilename(
      response.headers.get('Content-Disposition'),
      fallback,
    ),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  try {
    a.href = url;
    a.download = name;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    return { name, size: blob.size };
  } finally {
    a.remove();
    URL.revokeObjectURL(url);
  }
}
