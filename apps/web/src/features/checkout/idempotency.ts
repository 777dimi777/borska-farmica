const STORAGE = 'bf_checkout_idempotency';
type Stored = { key: string; fingerprint: string; createdAt: number };
export async function payloadFingerprint(value: {
  items: Array<{ id: string; variantId: string; quantity: string }>;
  pickupLocationId: string;
  requestedPickupDate: string;
  note?: string;
}) {
  const note = value.note?.trim() ?? '';
  const noteHash = note ? await sha(note) : '';
  return sha(
    JSON.stringify({
      items: [...value.items].sort((a, b) => a.id.localeCompare(b.id)),
      pickupLocationId: value.pickupLocationId,
      requestedPickupDate: value.requestedPickupDate,
      noteHash,
    }),
  );
}
async function sha(v: string) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(v),
  );
  return Array.from(new Uint8Array(bytes), (x) =>
    x.toString(16).padStart(2, '0'),
  ).join('');
}
export function idempotencyFor(fingerprint: string) {
  const now = Date.now();
  try {
    const stored = JSON.parse(
      sessionStorage.getItem(STORAGE) ?? 'null',
    ) as Stored | null;
    if (
      stored?.fingerprint === fingerprint &&
      now - stored.createdAt < 86_400_000
    )
      return stored.key;
  } catch {}
  const entry = { key: crypto.randomUUID(), fingerprint, createdAt: now };
  sessionStorage.setItem(STORAGE, JSON.stringify(entry));
  return entry.key;
}
export const clearIdempotency = () => sessionStorage.removeItem(STORAGE);
export const idempotencyStorageKey = STORAGE;
