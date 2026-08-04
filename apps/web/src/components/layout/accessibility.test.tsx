import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
vi.mock('./header-actions', () => ({ HeaderActions: () => null }));
vi.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => ({ status: 'anonymous' }),
}));
import { Header } from './header';
import { Footer } from './footer';

describe('layout accessibility', () => {
  it('header nema osnovne axe prekrÃƒâ€¦Ã‚Â¡aje', async () => {
    const { container } = render(<Header />);
    const result = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toHaveLength(0);
  });
  it('footer nema osnovne axe prekrÃƒâ€¦Ã‚Â¡aje', async () => {
    const { container } = render(<Footer />);
    const result = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toHaveLength(0);
  });
});
