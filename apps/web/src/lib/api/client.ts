import { serverApiUrl } from '@/lib/config/env';
export type ApiErrorKind =
  'unavailable' | 'timeout' | 'not-found' | 'validation' | 'unexpected';
export class PublicApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
  ) {
    super(kind);
  }
}
interface FetchOptions {
  revalidate?: number;
  signal?: AbortSignal;
}
export async function publicApiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  try {
    const response = await fetch(`${serverApiUrl()}${path}`, {
      signal: options.signal ?? AbortSignal.timeout(5000),
      next: { revalidate: options.revalidate ?? 60 },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 404) throw new PublicApiError('not-found', 404);
      if (response.status === 400 || response.status === 422)
        throw new PublicApiError('validation', response.status);
      throw new PublicApiError(
        response.status >= 500 ? 'unavailable' : 'unexpected',
        response.status,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof PublicApiError) throw error;
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    )
      throw new PublicApiError('timeout');
    throw new PublicApiError('unavailable');
  }
}
