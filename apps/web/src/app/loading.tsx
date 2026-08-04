import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return (
    <Container>
      <div className="loading-page" aria-label="Učitavanje">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-line" />
        <div className="product-grid">
          {[1, 2, 3, 4].map((x) => (
            <Skeleton key={x} className="skeleton-card" />
          ))}
        </div>
      </div>
    </Container>
  );
}
