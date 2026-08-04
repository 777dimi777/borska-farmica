const LOCAL_API = 'http://localhost:4000/api/v1';
const LOCAL_SITE = 'http://localhost:3000';
export function validatedUrl(
  name: string,
  value: string | undefined,
  fallback: string,
): string {
  const resolved = value || fallback;
  const url = new URL(resolved);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error(`${name} mora biti HTTP(S) URL.`);
  if (
    process.env.NODE_ENV === 'production' &&
    Boolean(value) &&
    ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  )
    throw new Error(`${name} ne sme koristiti localhost u produkciji.`);
  return resolved.replace(/\/$/, '');
}
export function serverApiUrl() {
  return validatedUrl(
    'API_INTERNAL_URL',
    process.env.API_INTERNAL_URL,
    LOCAL_API,
  );
}
export function publicApiUrl() {
  return validatedUrl(
    'NEXT_PUBLIC_API_URL',
    process.env.NEXT_PUBLIC_API_URL,
    LOCAL_API,
  );
}
export function siteUrl() {
  return validatedUrl(
    'NEXT_PUBLIC_SITE_URL',
    process.env.NEXT_PUBLIC_SITE_URL,
    LOCAL_SITE,
  );
}
