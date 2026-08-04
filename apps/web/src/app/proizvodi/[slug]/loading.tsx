import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return (
    <Container>
      <div className="detail-loading">
        <Skeleton className="detail-loading-image" />
        <div>
          <Skeleton className="skeleton-title" />
          <Skeleton className="skeleton-line" />
          <Skeleton className="skeleton-card" />
        </div>
      </div>
    </Container>
  );
}
