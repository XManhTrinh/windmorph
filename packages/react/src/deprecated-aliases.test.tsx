import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from './components/carousel/Carousel';
import { List, ListItem } from './components/list/List';
import { Menu, MenuItem, SubmenuTrigger, type SubmenuTriggerProps } from './components/menu/Menu';
import { NavigationBar, NavigationBarItem } from './components/navigation/NavigationBar';
import { NavigationRail, NavigationRailItem } from './components/navigation/NavigationRail';
import { Snackbar } from './components/snackbar/Snackbar';
import {
  RichTooltip,
  RichTooltipTrigger,
  Tooltip,
  TooltipTrigger,
} from './components/tooltip/Tooltip';
import { Button } from './components/button/Button';

/**
 * The names replaced in 0.2.9 (docs/architecture.md §9, "Consistent names") stay as deprecated
 * aliases until a later minor release: each old name does what its replacement does, and the
 * replacement wins when both are given. Editors strike the old names through (`@deprecated`).
 */

const Icon = () => <svg viewBox="0 0 24 24" />;

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Hovers a trigger and waits for its tooltip, returning how long it took to show. React Aria
 * shows the next tooltip at once while one has shown recently, so each one is hidden after and
 * the cooldown (500ms) waited out.
 */
async function delayBeforeShowing(name: string, text: string) {
  const start = performance.now();
  fireEvent.pointerMove(document.body);
  await userEvent.hover(screen.getByRole('button', { name }));
  expect(screen.queryByText(text)).toBeNull();
  await screen.findByText(text);
  const elapsed = performance.now() - start;
  await userEvent.unhover(screen.getByRole('button', { name }));
  await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
  return elapsed;
}

describe('deprecated aliases', () => {
  it('TooltipTrigger and RichTooltipTrigger: delay is openDelay', async () => {
    render(
      <>
        <TooltipTrigger delay={300} closeDelay={0}>
          <Button>Save</Button>
          <Tooltip>Save the draft</Tooltip>
        </TooltipTrigger>
        <RichTooltipTrigger delay={300} closeDelay={0}>
          <Button>Help</Button>
          <RichTooltip title="Help">Read more.</RichTooltip>
        </RichTooltipTrigger>
      </>,
    );
    expect(await delayBeforeShowing('Save', 'Save the draft')).toBeGreaterThanOrEqual(300);
    expect(await delayBeforeShowing('Help', 'Read more.')).toBeGreaterThanOrEqual(300);
  });

  it('TooltipTrigger and RichTooltipTrigger: openDelay wins over delay', async () => {
    render(
      <>
        <TooltipTrigger openDelay={0} delay={1500} closeDelay={0}>
          <Button>Save</Button>
          <Tooltip>Save the draft</Tooltip>
        </TooltipTrigger>
        <RichTooltipTrigger openDelay={0} delay={1500} closeDelay={0}>
          <Button>Help</Button>
          <RichTooltip title="Help">Read more.</RichTooltip>
        </RichTooltipTrigger>
      </>,
    );
    // With the old name's 1.5s it would still be hidden after 800ms.
    for (const [name, text] of [
      ['Save', 'Save the draft'],
      ['Help', 'Read more.'],
    ] as const) {
      fireEvent.pointerMove(document.body);
      await userEvent.hover(screen.getByRole('button', { name }));
      expect(await screen.findByText(text, {}, { timeout: 800 })).toBeInTheDocument();
      await userEvent.unhover(screen.getByRole('button', { name }));
      await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
    }
  });

  it('SubmenuTrigger: delay is openDelay, and openDelay wins', () => {
    // React Stately reads a submenu trigger through its collection node, which holds the delay.
    const trigger = SubmenuTrigger as unknown as {
      getCollectionNode: (props: SubmenuTriggerProps) => Iterable<{ element: ReactElement }>;
    };
    const submenuDelay = (props: { openDelay?: number; delay?: number }) => {
      const [node] = [
        ...trigger.getCollectionNode({
          children: [
            <MenuItem key="share">Share</MenuItem>,
            <Menu aria-label="Share">
              <MenuItem key="email">Email</MenuItem>
            </Menu>,
          ],
          ...props,
        }),
      ];
      return (node!.element.props as { submenuDelay?: number }).submenuDelay;
    };
    expect(submenuDelay({ delay: 500 })).toBe(500);
    expect(submenuDelay({ openDelay: 0, delay: 500 })).toBe(0);
  });

  it('Carousel: heroAlignment is heroAlign', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(412);
    const slides = Array.from({ length: 5 }, (_, index) => <div key={index}>Photo {index}</div>);
    const layout = (carousel: ReactElement) => {
      const { unmount } = render(carousel);
      const groups = screen.getAllByRole('group');
      const sizes = groups.map((group) => group.style.width);
      unmount();
      return sizes;
    };
    const centred = layout(
      <Carousel aria-label="Photos" variant="hero" heroAlign="center">
        {slides}
      </Carousel>,
    );
    expect(centred).not.toEqual(
      layout(
        <Carousel aria-label="Photos" variant="hero">
          {slides}
        </Carousel>,
      ),
    );
    expect(
      layout(
        <Carousel aria-label="Photos" variant="hero" heroAlignment="center">
          {slides}
        </Carousel>,
      ),
    ).toEqual(centred);
    // The new name wins.
    expect(
      layout(
        <Carousel aria-label="Photos" variant="hero" heroAlign="center" heroAlignment="start">
          {slides}
        </Carousel>,
      ),
    ).toEqual(centred);
  });

  it('ListItem: verticalAlignment is verticalAlign', () => {
    render(
      <List aria-label="Messages">
        <ListItem key="a" verticalAlignment="top">
          Carol
        </ListItem>
        <ListItem key="b" verticalAlign="center" verticalAlignment="top">
          Dan
        </ListItem>
      </List>,
    );
    const [carol, dan] = screen.getAllByRole('listitem') as [HTMLElement, HTMLElement];
    expect(carol).toHaveClass('items-start');
    expect(dan).toHaveClass('items-center');
  });

  it('NavigationRail: itemAlignment is itemAlign, with both data attributes', () => {
    render(
      <NavigationRail aria-label="Main" itemAlignment="center">
        <NavigationRailItem href="#inbox" icon={<Icon />}>
          Inbox
        </NavigationRailItem>
      </NavigationRail>,
    );
    const items = screen.getByRole('link', { name: 'Inbox' }).parentElement!;
    expect(items).toHaveClass('my-auto');
    expect(items).toHaveAttribute('data-item-align', 'center');
    expect(items).toHaveAttribute('data-item-alignment', 'center');
  });

  it('NavigationRail: itemAlign wins over itemAlignment', () => {
    render(
      <NavigationRail aria-label="Main" itemAlign="center" itemAlignment="top">
        <NavigationRailItem href="#inbox" icon={<Icon />}>
          Inbox
        </NavigationRailItem>
      </NavigationRail>,
    );
    const items = screen.getByRole('link', { name: 'Inbox' }).parentElement!;
    expect(items).toHaveClass('my-auto');
    expect(items).toHaveAttribute('data-item-align', 'center');
  });

  it('NavigationBarItem and NavigationRailItem: selected is current, selectedIcon currentIcon', () => {
    render(
      <>
        <NavigationBar aria-label="Bar">
          <NavigationBarItem
            href="#home"
            icon={<Icon />}
            selectedIcon={<svg data-testid="bar-current" />}
            selected
          >
            Home
          </NavigationBarItem>
          <NavigationBarItem href="#search" icon={<Icon />} current={false} selected>
            Search
          </NavigationBarItem>
        </NavigationBar>
        <NavigationRail aria-label="Rail">
          <NavigationRailItem href="#inbox" icon={<Icon />} selected>
            Inbox
          </NavigationRailItem>
        </NavigationRail>
      </>,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('data-current');
    expect(screen.getByTestId('bar-current').parentElement).toHaveAttribute('data-shown');
    // The new name wins.
    expect(screen.getByRole('link', { name: 'Search' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveAttribute('aria-current', 'page');
  });

  it('NavigationBarItem: currentIcon wins over selectedIcon', () => {
    render(
      <NavigationBar aria-label="Bar">
        <NavigationBarItem
          href="#home"
          icon={<Icon />}
          currentIcon={<svg data-testid="new-icon" />}
          selectedIcon={<svg data-testid="old-icon" />}
          current
        >
          Home
        </NavigationBarItem>
      </NavigationBar>,
    );
    expect(screen.getByTestId('new-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('old-icon')).toBeNull();
  });

  it('Snackbar: onDismiss is onClose', async () => {
    const onDismiss = vi.fn();
    render(<Snackbar onDismiss={onDismiss}>Message archived</Snackbar>);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    // Escape calls it too, as it calls onClose.
    fireEvent.keyDown(screen.getByRole('button', { name: 'Dismiss' }), { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('Snackbar: onClose wins over onDismiss', async () => {
    const onClose = vi.fn();
    const onDismiss = vi.fn();
    render(
      <Snackbar onClose={onClose} onDismiss={onDismiss}>
        Message archived
      </Snackbar>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
