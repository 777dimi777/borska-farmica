import { describe, expect, it } from 'vitest';
import { allowedTargets, primaryAction } from './transitions';
describe('admin order transition matrix', () => {
  it('prati svaku dozvoljenu backend tranziciju', () => {
    expect(allowedTargets('PENDING_CONFIRMATION')).toEqual([
      'CONFIRMED',
      'CANCELLED',
    ]);
    expect(allowedTargets('CONFIRMED')).toEqual(['PREPARING', 'CANCELLED']);
    expect(allowedTargets('PREPARING')).toEqual([
      'READY_FOR_PICKUP',
      'CANCELLED',
    ]);
    expect(allowedTargets('READY_FOR_PICKUP')).toEqual([
      'COMPLETED',
      'CANCELLED',
    ]);
  });
  it('terminalni statusi nemaju akcije', () => {
    expect(allowedTargets('COMPLETED')).toEqual([]);
    expect(allowedTargets('CANCELLED')).toEqual([]);
    expect(primaryAction.COMPLETED).toBeUndefined();
  });
  it('ne dozvoljava preskakanje faza', () => {
    expect(allowedTargets('PENDING_CONFIRMATION')).not.toContain('COMPLETED');
    expect(allowedTargets('CONFIRMED')).not.toContain('READY_FOR_PICKUP');
    expect(allowedTargets('PREPARING')).not.toContain('CONFIRMED');
  });
});
