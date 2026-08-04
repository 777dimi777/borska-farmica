import Link from 'next/link';
const hrefs: Record<string, string> = {
  pending: '/admin/porudzbine?status=PENDING_CONFIRMATION',
  stalePending: '/admin/porudzbine?status=PENDING_CONFIRMATION',
  ready: '/admin/porudzbine?status=READY_FOR_PICKUP',
  overduePickup: '/admin/porudzbine?sort=pickup_date',
};
export function AttentionLink({
  type,
  value,
  label,
}: {
  type: string;
  value: number;
  label: string;
}) {
  const content = (
    <>
      <strong>{value}</strong>
      <span>{label}</span>
    </>
  );
  return hrefs[type] ? (
    <Link className="attention-item" href={hrefs[type]}>
      {content}
    </Link>
  ) : (
    <article>{content}</article>
  );
}
