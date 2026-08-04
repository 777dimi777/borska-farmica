export function formatRsd(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Cena na upit';
  return new Intl.NumberFormat('sr-Latn-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 2,
  }).format(amount);
}
