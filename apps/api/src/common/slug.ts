export function canonicalSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\u0111/g, 'dj')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
