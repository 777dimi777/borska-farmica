import { PaginationMetadataDto } from './pagination-response.dto';

export function createPaginationMetadata(
  page: number,
  limit: number,
  total: number,
): PaginationMetadataDto {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}
