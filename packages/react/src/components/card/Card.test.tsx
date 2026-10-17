import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { labelInNameViolations } from '../../../test/label-in-name';
import { Card } from './Card';

describe('Card', () => {
  it('renders a static filled card', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toHaveAttribute('data-tokens', 'md-comp-card');
    expect(card).toHaveAttribute('data-variant', 'filled');
    expect(card).toHaveClass(
      'bg-[var(--_md-comp-card-container-color)]',
      'rounded-[var(--_md-comp-card-container-shape)]',
      'shadow-[shadow:var(--_md-comp-card-container-elevation)]',
      'text-on-surface',
      'overflow-hidden',
      'flex',
      'flex-col',
    );
    expect(card).not.toHaveClass('state-layer', 'border');
  });

  it.each(['elevated', 'outlined'] as const)(
    'marks the %s variant for its component tokens',
    (variant) => {
      render(
        <Card variant={variant} data-testid="card">
          Content
        </Card>,
      );
      expect(screen.getByTestId('card')).toHaveAttribute('data-variant', variant);
    },
  );

  it('draws the outlined border in the outline token', () => {
    render(
      <Card variant="outlined" data-testid="card">
        Content
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass(
      'border',
      'border-[color:var(--_md-comp-card-outline-color)]',
    );
  });

  it('lets consumer colour, corner and shadow classes replace the token classes', () => {
    render(
      <Card
        variant="outlined"
        className="bg-tertiary rounded-corner-small shadow-elevation-3 border-primary"
        data-testid="card"
      >
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-tertiary', 'rounded-corner-small', 'shadow-elevation-3');
    expect(card).not.toHaveClass(
      'bg-[var(--_md-comp-card-container-color)]',
      'rounded-[var(--_md-comp-card-container-shape)]',
      'shadow-[shadow:var(--_md-comp-card-container-elevation)]',
      'border-[color:var(--_md-comp-card-outline-color)]',
    );
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
      <Card variant="elevated" onPress={onPress}>
        <h3>Kyoto</h3>
        <p>Temples and gardens</p>
      </Card>,
    );
    const card = screen.getByRole('button', { name: 'Kyoto Temples and gardens' });
    expect(card.tagName).toBe('DIV');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('data-tokens', 'md-comp-card');
    expect(card).toHaveAttribute('data-variant', 'elevated');
    expect(card).toHaveClass('state-layer', 'focus-ring', 'w-full', 'text-start');
    expect(card).toHaveClass(
      'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-2',
    );

    await userEvent.click(card);
    card.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('follows the spec’s state elevations, and an outlined card’s focus border', () => {
    render(
      <>
        <Card variant="outlined" onPress={() => {}} aria-label="Outlined">
          Content
        </Card>
        <Card onPress={() => {}} aria-label="Filled">
          Content
        </Card>
      </>,
    );
    const outlined = screen.getByRole('button', { name: 'Outlined' });
    expect(outlined).toHaveClass(
      'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-1',
      'data-focus-visible:border-on-surface',
      'data-dragged:shadow-elevation-3',
      'data-disabled:border-outline/12',
    );
    expect(screen.getByRole('button', { name: 'Filled' })).toHaveClass(
      'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-1',
      'data-dragged:shadow-elevation-3',
    );
  });

  it('fades a disabled card’s container like the spec’s disabled tokens', () => {
    render(
      <Card variant="elevated" onPress={() => {}} disabled aria-label="Trip">
        Content
      </Card>,
    );
    // Elevated: `surface` at 38% over its own container, still at level 1.
    expect(screen.getByRole('button', { name: 'Trip' })).toHaveClass(
      'data-disabled:bg-[color-mix(in_srgb,var(--md-sys-color-surface)_38%,var(--md-sys-color-surface-container-low))]',
      'data-disabled:shadow-elevation-1',
    );
  });

  it('marks a dragged card, static or interactive', () => {
    const { rerender } = render(
      <>
        <Card dragged data-testid="static">
          Static
        </Card>
        <Card variant="elevated" dragged onPress={() => {}} aria-label="Trip">
          Content
        </Card>
      </>,
    );
    expect(screen.getByTestId('static')).toHaveAttribute('data-dragged');
    expect(screen.getByTestId('static')).toHaveClass('data-dragged:shadow-elevation-3');
    const card = screen.getByRole('button', { name: 'Trip' });
    expect(card).toHaveAttribute('data-dragged');
    expect(card).toHaveClass('data-dragged:shadow-elevation-4');
    rerender(
      <>
        <Card data-testid="static">Static</Card>
        <Card variant="elevated" onPress={() => {}} aria-label="Trip">
          Content
        </Card>
      </>,
    );
    expect(screen.getByTestId('static')).not.toHaveAttribute('data-dragged');
    expect(screen.getByRole('button', { name: 'Trip' })).not.toHaveAttribute('data-dragged');
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
        <Card href="/trips/kyoto">
          <h3>Kyoto</h3>
        </Card>
      </RouterProvider>,
    );
    const link = screen.getByRole('link', { name: 'Kyoto' });
    expect(link).toHaveAttribute('href', '/trips/kyoto');
    expect(link).toHaveAttribute('data-tokens', 'md-comp-card');
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

  it('takes no toggle or menu-trigger props, which no card uses', () => {
    const cards = [
      // @ts-expect-error a pressable card is never a toggle
      <Card key="a" onPress={() => {}} aria-label="Open" toggle={false} />,
      // @ts-expect-error a pressable card always takes focus on press
      <Card key="b" onPress={() => {}} aria-label="Open" preventFocusOnPress />,
      // @ts-expect-error a link card always takes focus on press
      <Card key="c" href="/a" preventFocusOnPress />,
    ];
    expect(cards).toHaveLength(3);
  });

  // 2026-10-17: the documented pattern named a card by its headline alone, leaving its other
  // visible text out of the name (axe's label-content-name-mismatch, WCAG 2.5.3).
  it('is named by all its visible text, in reading order', async () => {
    const { container } = render(
      <div>
        <Card onPress={() => {}}>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
          <h3>Kyoto</h3>
          <p>Temples and gardens</p>
        </Card>
        <Card href="/trips/lisbon">
          <p>Next week</p>
          <h3>Lisbon</h3>
          <p>Trams and tiles</p>
        </Card>
      </div>,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Kyoto Temples and gardens');
    expect(screen.getByRole('link')).toHaveAccessibleName('Next week Lisbon Trams and tiles');
    expect(await labelInNameViolations(container)).toEqual([]);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Card>Static</Card>
        <Card onPress={() => {}}>
          <h3>Pressable</h3>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
        </Card>
        <Card href="/x">
          <h3>Link</h3>
        </Card>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('Card token sets', () => {
  it("puts an app's token set after the card's own, static or pressable", () => {
    render(
      <>
        <Card data-testid="static" data-tokens="app-post">
          Static
        </Card>
        <Card onPress={() => {}} data-tokens="app-post">
          Pressable
        </Card>
      </>,
    );
    expect(screen.getByTestId('static')).toHaveAttribute('data-tokens', 'md-comp-card app-post');
    expect(screen.getByRole('button', { name: 'Pressable' })).toHaveAttribute(
      'data-tokens',
      'md-comp-card app-post',
    );
  });
});
