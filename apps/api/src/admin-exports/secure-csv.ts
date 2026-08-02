export const CSV_EXPORT_LIMIT = 10_000;
function neutralize(value: string) {
  return /^[\s]*[=+\-@\t\r]/.test(value) ? "'" + value : value;
}
export function csvCell(value: unknown): string {
  const raw =
    value === null || value === undefined
      ? ''
      : value instanceof Date
        ? value.toISOString()
        : typeof value === 'string'
          ? neutralize(value)
          : typeof value === 'object'
            ? JSON.stringify(value)
            : typeof value === 'number' ||
                typeof value === 'boolean' ||
                typeof value === 'bigint'
              ? value.toString()
              : '';
  return /[",\r\n]/.test(raw) ? '"' + raw.replace(/"/g, '""') + '"' : raw;
}
export function csvDocument(headers: string[], rows: unknown[][]): Buffer {
  const text =
    [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') +
    '\r\n';
  return Buffer.from('\uFEFF' + text, 'utf8');
}
