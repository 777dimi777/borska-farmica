import type {
  MeasurementUnit,
  ProductAvailability,
  ProductVariant,
} from '@/types/catalog';
export const unitLabels: Record<MeasurementUnit, string> = {
  LITER: 'l',
  MILLILITER: 'ml',
  KILOGRAM: 'kg',
  GRAM: 'g',
  PIECE: 'kom',
};
export function packageLabel(
  v: Pick<ProductVariant, 'packageAmount' | 'unit'>,
) {
  const amount = v.packageAmount
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
  return `${amount} ${unitLabels[v.unit]}`;
}
export function availabilityLabel(
  a: Pick<
    ProductAvailability,
    'currentlyAvailable' | 'inStock' | 'purchasable'
  >,
) {
  if (!a.currentlyAvailable) return 'Trenutno nije u ponudi';
  if (a.purchasable && a.inStock) return 'Dostupno';
  if (a.purchasable) return 'Dostupno za poručivanje';
  return 'Trenutno nema na stanju';
}
