import { resolveRequestId, validRequestId } from './request-id';

describe('request IDs', () => {
  it('accepts only bounded safe client identifiers', () => {
    expect(validRequestId('client.safe_ID-123')).toBe(true);
    expect(validRequestId('x'.repeat(101))).toBe(false);
    expect(validRequestId('unsafe value')).toBe(false);
  });

  it('generates a UUID when the supplied value is unsafe', () => {
    expect(resolveRequestId('unsafe value')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
