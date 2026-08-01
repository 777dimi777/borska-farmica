import { createPaginationMetadata } from './pagination';

describe('createPaginationMetadata', () => {
  it('returns zero pages for an empty result', () => {
    expect(createPaginationMetadata(1, 12, 0)).toEqual({
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  });

  it('calculates page count and navigation flags', () => {
    expect(createPaginationMetadata(2, 12, 25)).toEqual({
      page: 2,
      limit: 12,
      total: 25,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    });
  });

  it('does not report a next page on the last page', () => {
    expect(createPaginationMetadata(3, 12, 25).hasNextPage).toBe(false);
  });
});
