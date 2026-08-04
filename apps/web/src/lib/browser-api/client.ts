import { publicApiUrl } from '@/lib/config/env';
export type BrowserApiErrorKind =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'unauthenticated'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'business'
  | 'rate-limit'
  | 'unavailable'
  | 'unexpected';
export class BrowserApiError extends Error {
  constructor(
    public kind: BrowserApiErrorKind,
    public status?: number,
    public requestId?: string,
  ) {
    super(kind);
  }
}
type Options = {
  method?: string;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  timeout?: number;
  headers?: Record<string, string>;
};
const kind = (s: number): BrowserApiErrorKind =>
  s === 400
    ? 'validation'
    : s === 401
      ? 'unauthenticated'
      : s === 403
        ? 'forbidden'
        : s === 404
          ? 'not-found'
          : s === 409
            ? 'conflict'
            : s === 422
              ? 'business'
              : s === 429
                ? 'rate-limit'
                : s >= 500
                  ? 'unavailable'
                  : 'unexpected';
export async function browserApi<T>(path: string, o: Options = {}): Promise<T> {
  const timeout = AbortSignal.timeout(o.timeout ?? 8000);
  const signal = o.signal ? AbortSignal.any([o.signal, timeout]) : timeout;
  try {
    const multipart =
      typeof FormData !== 'undefined' && o.body instanceof FormData;
    const r = await fetch(`${publicApiUrl()}${path}`, {
      method: o.method ?? 'GET',
      credentials: 'include',
      signal,
      headers: {
        Accept: 'application/json',
        ...(o.body !== undefined && !multipart
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...o.headers,
        ...(o.token ? { Authorization: `Bearer ${o.token}` } : {}),
      },
      body:
        o.body === undefined
          ? undefined
          : multipart
            ? (o.body as FormData)
            : JSON.stringify(o.body),
    });
    if (!r.ok)
      throw new BrowserApiError(
        kind(r.status),
        r.status,
        r.headers.get('X-Request-ID') ?? undefined,
      );
    if (r.status === 204) return undefined as T;
    return (await r.json()) as T;
  } catch (e) {
    if (e instanceof BrowserApiError) throw e;
    if (
      e instanceof Error &&
      (e.name === 'TimeoutError' || e.name === 'AbortError')
    )
      throw new BrowserApiError('timeout');
    throw new BrowserApiError('network');
  }
}
