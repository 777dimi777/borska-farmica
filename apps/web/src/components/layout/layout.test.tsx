import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
vi.mock('./header-actions', () => ({ HeaderActions: () => null }));
import { Brand } from './brand';
import { Header } from './header';
import { Footer } from './footer';
describe('storefront layout', () => {
  it('prikazuje tipografski Brand fallback', () => {
    render(<Brand />);
    expect(screen.getByText('Borska Farmica')).toBeInTheDocument();
  });
  it('ima funkcionalnu navigaciju i mobile Escape', async () => {
    const user = userEvent.setup();
    render(<Header />);
    expect(
      screen.getAllByRole('link', { name: 'O nama' }).length,
    ).toBeGreaterThan(0);
    const button = screen.getByRole('button', { name: 'Otvori navigaciju' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
  it('footer sadrÃ…Â¾i potvrÃ„â€˜ene linkove i lokacije', () => {
    render(<Footer />);
    expect(screen.getByText(/Nade Dimi/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Facebooku/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });
});
