import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Card } from './Card';

describe('Card', () => {
  it('renders a static filled card', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toHaveClass(
      'bg-surface-container-highest',
      'text-on-surface',
      'rounded-corner-medium',
      'overflow-hidden',
      'flex',
      'flex-col',
    );
    expect(card).not.toHaveClass('state-layer');
  });

  it.each([
    ['elevated', ['bg-surface-container-low', 'shadow-elevation-1']],
    ['outlined', ['bg-surface', 'border-outline-variant', 'border']],
  ] as const)('styles the %s variant', (variant, classes) => {
    render(
      <Card variant={variant} data-testid="card">
        Content
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass(...classes);
  });

  it('puts className and ref on the root and lets consumer classes win', () => {
    let element: HTMLDivElement | null = null;
    render(
      <Card
        ref={(node) => {
          element = node as HTMLDivElement;
        }}
        className="overflow-visible p-4 grid"
        data-testid="card"
      >
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(element).toBe(card);
    expect(card).toHaveClass('overflow-visible', 'p-4', 'grid');
    expect(card).not.toHaveClass('overflow-hidden', 'flex');
  });

  it('renders a pressable card as a div button that works with mouse and keyboard', async () => {
    const onPress = vi.fn();
    render(
      <Card variant="elevated" onPress={onPress} aria-labelledby="title">
        <h3 id="title">Kyoto</h3>
        <p>Temples and gardens</p>
      </Card>,
    );
    const card = screen.getByRole('button', { name: 'Kyoto' });
    expect(card.tagName).toBe('DIV');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveClass('state-layer', 'focus-ring', 'w-full', 'text-start');
    expect(card).toHaveClass('data-hovered:shadow-elevation-2');

    await userEvent.click(card);
    card.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('keeps outlined cards at their elevation on hover', () => {
    render(
      <Card variant="outlined" onPress={() => {}} aria-label="Trip">
        Content
      </Card>,
    );
    const card = screen.getByRole('button');
    expect(card.className).not.toContain('data-hovered:shadow');
    expect(card).toHaveClass('data-dragged:shadow-elevation-3');
  });

  it('does not respond when disabled', async () => {
    const onPress = vi.fn();
    render(
      <Card onPress={onPress} disabled aria-label="Trip">
        Content
      </Card>,
    );
    const card = screen.getByRole('button');
    await userEvent.click(card);
    expect(onPress).not.toHaveBeenCalled();
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).toHaveAttribute('data-disabled');
  });

  it('renders a link card that navigates through the RouterProvider', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <Card href="/trips/kyoto" aria-labelledby="kyoto">
          <h3 id="kyoto">Kyoto</h3>
        </Card>
      </RouterProvider>,
    );
    const link = screen.getByRole('link', { name: 'Kyoto' });
    expect(link).toHaveAttribute('href', '/trips/kyoto');
    await userEvent.click(link);
    expect(navigate).toHaveBeenCalledWith('/trips/kyoto', undefined);
  });

  it('warns when an interactive card contains interactive content', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Card onPress={() => {}} aria-label="Trip">
        <button type="button">Share</button>
      </Card>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('must not contain'),
      expect.anything(),
    );
    warn.mockRestore();
  });

  it('does not warn for a static card with its own actions', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Card>
        <button type="button">Share</button>
      </Card>,
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('only allows disabled on pressable cards in its types', () => {
    // @ts-expect-error static cards cannot be disabled
    const staticDisabled = <Card disabled>Content</Card>;
    expect(staticDisabled).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Card>Static</Card>
        <Card onPress={() => {}} aria-labelledby="a">
          <h3 id="a">Pressable</h3>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
        </Card>
        <Card href="/x" aria-labelledby="b">
          <h3 id="b">Link</h3>
        </Card>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
