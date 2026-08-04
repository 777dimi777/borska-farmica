import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './states';
describe('EmptyState', () => {
  it('ne ubacuje demo proizvode', () => {
    render(<EmptyState />);
    expect(screen.getByText(/Ponuda se trenutno priprema/)).toBeInTheDocument();
  });
});
