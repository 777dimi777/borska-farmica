import Decimal from 'decimal.js-light';
export function normalizeQuantity(v: string) {
  const x = v.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,3})?$/.test(x)) return null;
  try {
    const d = new Decimal(x);
    return d.gt(0) ? d.toFixed(3) : null;
  } catch {
    return null;
  }
}
export function validQuantity(v: string, min: string, step: string) {
  const n = normalizeQuantity(v);
  if (!n) return false;
  const d = new Decimal(n),
    m = new Decimal(min),
    s = new Decimal(step);
  return d.gte(m) && d.minus(m).mod(s).eq(0);
}
export const shiftQuantity = (v: string, step: string, direction: 1 | -1) =>
  new Decimal(v).plus(new Decimal(step).times(direction)).toFixed(3);
export function displayQuantity(v: string) {
  return new Decimal(v)
    .toFixed(3)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1')
    .replace('.', ',');
}
