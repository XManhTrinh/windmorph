import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DrawerNav } from './drawer-nav';

describe('DrawerNav', () => {
  it('links to the Pro-filtered index on its own, never nesting a link in a row', () => {
    const { container } = render(
      <DrawerNav pathname="/components/accordion" onNavigate={() => {}} />,
    );
    expect(screen.getByRole('link', { name: 'Pro components' })).toHaveAttribute(
      'href',
      '/components?filter=pro',
    );
    // A Pro row's tag is text inside its link, which keeps one name and one tab stop.
    expect(screen.getByRole('link', { name: /^Accordion\s*Pro$/ })).toBeInTheDocument();
    expect(container.querySelector('a a, a button, a [tabindex]')).toBeNull();
  });

  it('gives every row a 48px target', () => {
    const { container } = render(<DrawerNav pathname="/components/button" onNavigate={() => {}} />);
    const rows = container.querySelectorAll('a, button');
    expect(rows.length).toBeGreaterThan(10);
    for (const row of rows) expect(row.className).toContain('min-h-12');
  });
});
