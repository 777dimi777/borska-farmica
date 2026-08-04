import { describe, expect, it } from 'vitest';
import { periodQuery } from './dashboard';
describe('admin dashboard URL period', () => {
  it('prosleđuje samo podržane datume', () => {
    const params = new URLSearchParams(
      'from=2026-07-01&to=2026-07-31&granularity=week&unsafe=x',
    );
    expect(periodQuery(params).toString()).toBe(
      'from=2026-07-01&to=2026-07-31',
    );
  });
  it('ostavlja backend default kada period nije izabran', () =>
    expect(periodQuery(new URLSearchParams()).toString()).toBe(''));
});
