import { NotFoundException } from '@nestjs/common';
import { AdminAvailabilityService } from './admin-availability.service';
describe('AdminAvailabilityService queries', () => {
  const productFind = jest.fn(),
    windowsFind = jest.fn();
  const service = new AdminAvailabilityService({
    product: { findUnique: productFind },
    availabilityWindow: { findMany: windowsFind },
  } as never);
  beforeEach(() => jest.clearAllMocks());
  it('lists all windows in a stable database order without N+1', async () => {
    productFind.mockResolvedValueOnce({ id: 'p' });
    windowsFind.mockResolvedValueOnce([]);
    await service.list('p');
    expect(windowsFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: 'p' },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(productFind).toHaveBeenCalledTimes(1);
  });
  it('returns 404 for an unknown product', async () => {
    productFind.mockResolvedValueOnce(null);
    await expect(service.list('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('uses the supplied preview instant', async () => {
    productFind.mockResolvedValueOnce({
      id: 'p',
      availabilityMode: 'ALWAYS',
      isManuallyAvailable: true,
      variants: [],
      availabilityWindows: [],
    });
    const result = await service.preview('p', '2026-08-01T22:30:00.000Z');
    expect(result).toMatchObject({
      evaluatedAt: '2026-08-01T22:30:00.000Z',
      businessDate: '2026-08-02',
      stockReason: 'NO_ACTIVE_VARIANT',
    });
  });
});
