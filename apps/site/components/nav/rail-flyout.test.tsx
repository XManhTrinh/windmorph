import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RAIL_GROUP_MAP } from '../../content/components/catalog';
import { axeViolations } from '../../test/axe';
import { GroupTrigger, RailFlyout } from './rail-flyout';

const actions = RAIL_GROUP_MAP.actions;
const noop = () => {};

describe('GroupTrigger', () => {
  it('is a link to the group\u2019s first page with disclosure ARIA and visual-only current', () => {
    render(
      <GroupTrigger
        group={actions}
        icon={<svg aria-hidden="true" />}
        open={false}
        current
        flyoutId="fly-actions"
        onPointerOpen={noop}
        onFocusOpen={noop}
        onPointerLeave={noop}
      />,
    );
    const link = screen.getByRole('link', { name: /actions/i });
    // Navigates to the first page of the group (registry order): Button.
    expect(link).toHaveAttribute('href', '/components/button');
    expect(link).toHaveAttribute('aria-expanded', 'false');
    // Collapsed: no dangling aria-controls idref (the flyout is not in the DOM yet).
    expect(link).not.toHaveAttribute('aria-controls');
    expect(link).toHaveAttribute('data-current', 'true');
    // A group link, never "the current page": no aria-current on it.
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('opens its panel on hover (delegated) and points aria-controls at it when open', async () => {
    const onPointerOpen = vi.fn();
    const onFocusOpen = vi.fn();
    render(
      <GroupTrigger
        group={actions}
        icon={<svg aria-hidden="true" />}
        open
        current={false}
        flyoutId="fly-actions"
        onPointerOpen={onPointerOpen}
        onFocusOpen={onFocusOpen}
        onPointerLeave={noop}
      />,
    );
    const link = screen.getByRole('link', { name: /actions/i });
    expect(link).toHaveAttribute('aria-expanded', 'true');
    expect(link).toHaveAttribute('aria-controls', 'fly-actions');
    link.focus();
    expect(onFocusOpen).toHaveBeenCalledTimes(1);
  });
});

describe('RailFlyout', () => {
  it('is a labelled nav disclosure of anchor links, not a menu', () => {
    render(
      <RailFlyout
        id="fly-actions"
        group={actions}
        open
        pathname="/components/icon-button"
        onNavigate={noop}
        onPointerEnter={noop}
        onPointerLeave={noop}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Actions' });
    expect(nav).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryByRole('menuitem')).toBeNull();

    const current = nav.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Icon button');
  });

  it('closes (onNavigate) when a link is activated', async () => {
    const onNavigate = vi.fn();
    render(
      <RailFlyout
        id="fly-actions"
        group={actions}
        open
        pathname="/components/button"
        onNavigate={onNavigate}
        onPointerEnter={noop}
        onPointerLeave={noop}
      />,
    );
    // The chip is part of the link's name, so it's announced too ("FAB Expressive" in a
    // browser, which spaces flex items; jsdom doesn't apply layout).
    await userEvent.click(screen.getByRole('link', { name: /^FAB\s?Expressive$/ }));
    expect(onNavigate).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <RailFlyout
        id="fly-actions"
        group={actions}
        open
        pathname="/components/button"
        onNavigate={noop}
        onPointerEnter={noop}
        onPointerLeave={noop}
      />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
