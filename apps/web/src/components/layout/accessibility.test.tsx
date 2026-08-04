import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Header } from './header';
import { Footer } from './footer';

describe('layout accessibility', () => {
  it('header nema osnovne axe prekrÅ¡aje', async () => {
    const { container } = render(<Header />);
    const result = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toHaveLength(0);
  });
  it('footer nema osnovne axe prekrÅ¡aje', async () => {
    const { container } = render(<Footer />);
    const result = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toHaveLength(0);
  });
});
