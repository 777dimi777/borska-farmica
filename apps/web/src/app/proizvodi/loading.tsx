import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return (
    <Container>
      <div className="catalog-loading">
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-line" />
        <div className="catalog-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="skeleton-card" />
          ))}
        </div>
      </div>
    </Container>
  );
}
