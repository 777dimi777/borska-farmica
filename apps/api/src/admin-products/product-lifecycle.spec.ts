import { ConflictException } from '@nestjs/common';
import { canonicalSlug } from '../common/slug';
import { ProductStatus } from '../generated/prisma/enums';
import { AdminProductMutationsService } from './admin-product-mutations.service';
describe('product lifecycle', () => {
  const service = new AdminProductMutationsService(
    {} as never,
    {} as never,
    {} as never,
  );
  const transition = (from: ProductStatus, to: ProductStatus) =>
    (
      service as unknown as {
        transition(from: ProductStatus, to: ProductStatus): void;
      }
    ).transition(from, to);
  it.each([
    [ProductStatus.DRAFT, ProductStatus.ACTIVE],
    [ProductStatus.DRAFT, ProductStatus.ARCHIVED],
    [ProductStatus.ACTIVE, ProductStatus.DRAFT],
    [ProductStatus.ACTIVE, ProductStatus.ARCHIVED],
    [ProductStatus.ARCHIVED, ProductStatus.DRAFT],
  ])('allows %s -> %s', (from, to) =>
    expect(() => transition(from, to)).not.toThrow(),
  );
  it('blocks ARCHIVED -> ACTIVE', () =>
    expect(() =>
      transition(ProductStatus.ARCHIVED, ProductStatus.ACTIVE),
    ).toThrow(ConflictException));
  it('normalizes Serbian product slugs through the shared utility', () =>
    expect(canonicalSlug('  Kozje Mleko \u0110ur\u0111evdan  ')).toBe(
      'kozje-mleko-djurdjevdan',
    ));
});
