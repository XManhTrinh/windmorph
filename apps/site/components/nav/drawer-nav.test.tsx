import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DrawerNav } from './drawer-nav';

// The groups need the rail around them; `e2e/rail.spec.ts` and the smoke suite cover them.
vi.mock('./docs-rail', () => ({ ComponentGroups: () => null }));

describe('DrawerNav', () => {
  it('links to the Pro-filtered index on its own, never nesting a link in a row', () => {
    const { container } = render(
      <DrawerNav pathname="/components/accordion" onNavigate={() => {}} />,
    );
    expect(screen.getByRole('link', { name: 'Pro components' })).toHaveAttribute(
      'href',
      '/components?filter=pro',
    );
    expect(container.querySelector('a a, a button, a [tabindex]')).toBeNull();
  });

  it('gives every guide and index row a 48px target', () => {
    const { container } = render(<DrawerNav pathname="/components/button" onNavigate={() => {}} />);
    const rows = container.querySelectorAll('a');
    expect(rows.length).toBeGreaterThan(5);
    for (const row of rows) expect(row.className).toContain('min-h-12');
  });
});
