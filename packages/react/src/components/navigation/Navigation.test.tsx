import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { animate } from 'motion/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Badge } from '../badge/Badge';
import { NavigationBar, NavigationBarItem } from './NavigationBar';
import { NavigationRail, NavigationRailItem, type NavigationRailProps } from './NavigationRail';

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  animate: vi.fn(),
}));

const Icon = ({ id }: { id: string }) => <svg data-testid={id} viewBox="0 0 24 24" />;

function Rail(props: Partial<NavigationRailProps> & { onNavigate?: () => void }) {
  const { onNavigate, ...rest } = props;
  return (
    <NavigationRail
      aria-label="Main"
      header={({ toggle, expanded }) => (
        <button type="button" onClick={toggle}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      )}
      {...(rest as object)}
    >
      <NavigationRailItem href="/inbox" icon={<Icon id="inbox" />} selected>
        Inbox
      </NavigationRailItem>
      <NavigationRailItem icon={<Icon id="sent" />} onPress={onNavigate}>
        Sent
      </NavigationRailItem>
    </NavigationRail>
  );
}

describe('NavigationRail', () => {
  it('is a collapsed navigation landmark with stacked items', async () => {
    const { container } = render(<Rail />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveStyle({ '--m3-rail-width': 'var(--m3-rail-collapsed-width)' });
    expect(nav).toHaveClass('bg-surface', 'w-(--m3-rail-width)');
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    expect(inbox).toHaveAttribute('aria-current', 'page');
    expect(inbox).toHaveAttribute('data-current', 'true');
    // As wide as the collapsed rail, never the animated width, so the icon stays put.
    expect(inbox).toHaveClass('min-h-[64px]', 'w-(--m3-rail-collapsed-width)');
    expect(inbox).not.toHaveClass('w-full');
    expect(screen.getByRole('button', { name: 'Sent' })).not.toHaveAttribute('aria-current');
    // The label sits below the 56×32 pill.
    const pill = screen.getByTestId('inbox').closest('[class*="w-[56px]"]')!;
    expect(pill).toHaveClass('h-[32px]', 'w-[56px]', 'rounded-full');
    expect(pill.nextElementSibling).toHaveTextContent('Inbox');
    expect(pill.nextElementSibling).toHaveClass('text-label-medium');
    expect(screen.getByTestId('inbox').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('expands from its header, moving labels beside the icons', async () => {
    const onExpandedChange = vi.fn();
    render(<Rail onExpandedChange={onExpandedChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('data-expanded', 'true');
    // jsdom measures 0px labels, so the width is the 220px minimum.
    expect(nav).toHaveStyle({ '--m3-rail-width': '220px' });
    const label = screen.getByText('Inbox');
    expect(label).toHaveClass('text-label-large', 'starting:opacity-0');
    expect(label.parentElement).toHaveClass('gap-[8px]', 'ps-[16px]');
    // The item inset puts the icon on the collapsed rail's centre line.
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveClass('px-(--m3-rail-item-inset)');
    expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
  });

  it('keeps its header on the icon line in both states', async () => {
    render(<Rail />);
    const header = () => screen.getByRole('button', { name: /Expand|Collapse/ }).parentElement!;
    const anchored = ['grid-cols-[56px]', 'justify-items-center-safe', 'ps-(--m3-rail-item-inset)'];
    expect(header()).toHaveClass(...anchored);
    expect(header()).not.toHaveClass('items-center');
    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    expect(header()).toHaveClass(...anchored);
  });

  it('derives its insets from --m3-rail-collapsed-width', () => {
    render(<Rail />);
    expect(screen.getByRole('navigation')).toHaveClass(
      '[--m3-rail-item-inset:calc((var(--m3-rail-collapsed-width)_-_56px)/2)]',
    );
  });

  it('gives the modal sheet the collapsed width set on the rail', async () => {
    function Modal() {
      const [expanded, setExpanded] = useState(false);
      return (
        <Rail
          modal
          expanded={expanded}
          onExpandedChange={setExpanded}
          style={{ '--m3-rail-collapsed-width': '80px' } as React.CSSProperties}
        />
      );
    }
    render(<Modal />);
    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    const sheet = screen.getByRole('dialog', { name: 'Main' });
    expect(sheet.style.getPropertyValue('--m3-rail-collapsed-width')).toBe('80px');
    expect(sheet).toHaveClass('starting:w-(--m3-rail-collapsed-width)');
  });

  it('expands the expanded rail’s pill from the centre of the icon', async () => {
    function Selectable() {
      const [current, setCurrent] = useState('inbox');
      return (
        <NavigationRail aria-label="Main" expanded>
          {['inbox', 'sent'].map((id) => (
            <NavigationRailItem
              key={id}
              icon={<Icon id={id} />}
              selected={current === id}
              onPress={() => setCurrent(id)}
            >
              {id}
            </NavigationRailItem>
          ))}
        </NavigationRail>
      );
    }
    render(<Selectable />);
    const sent = screen.getByRole('button', { name: 'sent' });
    const pill = sent.querySelector('[class*="bg-secondary-container"]')!;
    // Collapsed to the icon's centre (16px padding + 12px) until current, then it opens and
    // fades in on the default spatial spring; nothing slides between items.
    expect(pill).toHaveClass(
      '[clip-path:inset(0_calc(100%_-_28px)_0_28px_round_9999px)]',
      'group-data-current/nav:[clip-path:inset(0_0_round_9999px)]',
      '[transition-property:clip-path,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
    );
    await userEvent.click(sent);
    expect(sent).toHaveAttribute('data-current', 'true');
    expect(animate).not.toHaveBeenCalled();
  });

  it('hugs the expanded pill to its content, with the whole row as the target', () => {
    render(<Rail expanded />);
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    expect(inbox).toHaveClass('w-full', 'justify-items-start');
    expect(inbox).not.toHaveClass('justify-items-stretch');
    expect(inbox.firstElementChild).toHaveClass('min-h-[56px]', 'max-w-full');
  });

  it('can still stretch an item’s pill across the row', () => {
    render(
      <NavigationRail aria-label="Main" expanded>
        <NavigationRailItem
          icon={<Icon id="inbox" />}
          classNames={{ root: 'justify-items-stretch' }}
        >
          Inbox
        </NavigationRailItem>
      </NavigationRail>,
    );
    const inbox = screen.getByRole('button', { name: 'Inbox' });
    expect(inbox).toHaveClass('justify-items-stretch');
    expect(inbox).not.toHaveClass('justify-items-start');
  });

  it('grows the collapsed pill from its centre', async () => {
    function Selectable() {
      const [current, setCurrent] = useState('inbox');
      return (
        <NavigationRail aria-label="Main">
          {['inbox', 'sent'].map((id) => (
            <NavigationRailItem
              key={id}
              icon={<Icon id={id} />}
              selected={current === id}
              onPress={() => setCurrent(id)}
            >
              {id}
            </NavigationRailItem>
          ))}
        </NavigationRail>
      );
    }
    render(<Selectable />);
    await userEvent.click(screen.getByRole('button', { name: 'sent' }));
    expect(animate).not.toHaveBeenCalled();
    const pill = screen
      .getByRole('button', { name: 'sent' })
      .querySelector('[class*="bg-secondary-container"]')!;
    expect(pill).toHaveClass('[transition-property:clip-path,opacity]');
  });

  it('can be controlled', () => {
    render(<Rail expanded />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-expanded', 'true');
  });

  it('opens a modal sheet that closes on Escape and after navigating', async () => {
    const onNavigate = vi.fn();
    function Modal() {
      const [expanded, setExpanded] = useState(false);
      return (
        <Rail modal expanded={expanded} onExpandedChange={setExpanded} onNavigate={onNavigate} />
      );
    }
    const { container } = render(<Modal />);
    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    const sheet = screen.getByRole('dialog', { name: 'Main' });
    expect(sheet).toHaveClass(
      'bg-surface-container',
      'shadow-elevation-2',
      'rounded-e-corner-large',
    );
    expect(within(sheet).getByRole('link', { name: 'Inbox' })).toBeInTheDocument();
    // The in-flow rail stays collapsed.
    expect(container.querySelector('nav')).not.toHaveAttribute('data-expanded');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });

    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sent' }));
    expect(onNavigate).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
  });

  it('lets classNames.body replace the top inset', () => {
    render(<Rail classNames={{ body: 'pt-2' }} />);
    const body = screen.getByRole('navigation').firstElementChild!;
    expect(body).toHaveClass('pt-2');
    expect(body).not.toHaveClass('pt-[44px]');
  });

  it('hides the collapsed rail with hideOnCollapse', () => {
    render(<Rail modal hideOnCollapse />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('wraps long labels instead of truncating them, and bolds the current one', () => {
    const { rerender } = render(<Rail />);
    const label = screen.getByText('Inbox');
    expect(label).not.toHaveClass('truncate');
    expect(label).toHaveClass('text-balance', '[overflow-wrap:anywhere]');
    expect(label).toHaveClass('group-data-current/nav:text-label-medium-emphasized');
    rerender(<Rail expanded />);
    expect(screen.getByText('Inbox')).toHaveClass(
      'group-data-current/nav:text-label-large-emphasized',
    );
    // The expanded pill grows taller with a wrapped label.
    expect(screen.getByRole('link', { name: 'Inbox' }).firstElementChild).not.toHaveClass(
      'h-[56px]',
    );
  });

  it('measures expanded labels on one line', () => {
    let seen = '';
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.hasAttribute('data-nav-label')) seen = this.style.whiteSpace;
      return this.hasAttribute('data-nav-label') && this.style.whiteSpace === 'nowrap' ? 200 : 0;
    });
    render(<Rail expanded />);
    // 200px + 104px of chrome.
    expect(screen.getByRole('navigation')).toHaveStyle({ '--m3-rail-width': '304px' });
    expect(seen).toBe('nowrap');
    expect(screen.getByText('Inbox').style.whiteSpace).toBe('');
    vi.restoreAllMocks();
  });

  it('centres its items with itemAlignment, keeping the header at the top', () => {
    render(<Rail itemAlignment="center" />);
    const items = screen.getByRole('link', { name: 'Inbox' }).parentElement!;
    expect(items).toHaveAttribute('data-item-alignment', 'center');
    expect(items).toHaveClass('my-auto');
    expect(screen.getByRole('button', { name: 'Expand' }).parentElement).not.toHaveClass('my-auto');
  });

  it('draws a divider on its content edge', () => {
    const { rerender } = render(<Rail />);
    expect(screen.getByRole('navigation')).not.toHaveClass('border-e');
    rerender(<Rail divider />);
    expect(screen.getByRole('navigation')).toHaveClass('border-e', 'border-outline-variant');
  });

  it('moves focus between items with the arrow keys without changing the selection', async () => {
    const onNavigate = vi.fn();
    render(<Rail onNavigate={onNavigate} />);
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    const sent = screen.getByRole('button', { name: 'Sent' });
    // Tab moves from the header to the items.
    await userEvent.tab();
    await userEvent.tab();
    expect(inbox).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(sent).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(inbox).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(sent).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(inbox).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(sent).toHaveFocus();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(inbox).toHaveAttribute('aria-current', 'page');
  });

  it('focuses the modal sheet’s first interactive element when it opens', async () => {
    function Modal() {
      const [expanded, setExpanded] = useState(false);
      return <Rail modal expanded={expanded} onExpandedChange={setExpanded} />;
    }
    render(<Modal />);
    await userEvent.click(screen.getByRole('button', { name: 'Expand' }));
    const sheet = screen.getByRole('dialog', { name: 'Main' });
    // The header's menu button comes first.
    await waitFor(() =>
      expect(within(sheet).getByRole('button', { name: 'Collapse' })).toHaveFocus(),
    );
  });

  it('places badges on the icon collapsed and after the label expanded', async () => {
    function Badged({ expanded }: { expanded?: boolean }) {
      return (
        <NavigationRail aria-label="Main" expanded={expanded}>
          <NavigationRailItem
            icon={<Icon id="inbox" />}
            badge={<Badge>3</Badge>}
            badgeLabel="3 new messages"
          >
            Inbox
          </NavigationRailItem>
          <NavigationRailItem icon={<Icon id="chat" />} badge={<Badge />}>
            Chat
          </NavigationRailItem>
        </NavigationRail>
      );
    }
    const { container, rerender } = render(<Badged />);
    const inbox = screen.getByRole('button', { name: 'Inbox' });
    expect(inbox).toHaveAccessibleDescription('3 new messages');
    // Collapsed: the badge hangs from the icon, inside the hidden icon.
    expect(within(inbox).getByText('3').closest('[aria-hidden="true"]')).toHaveClass('size-[24px]');
    // A small badge without a label adds no description.
    expect(screen.getByRole('button', { name: 'Chat' })).not.toHaveAttribute('aria-describedby');
    expect(await axeViolations(container)).toEqual([]);
    rerender(<Badged expanded />);
    const badge = within(screen.getByRole('button', { name: 'Inbox' })).getByText('3');
    expect(badge.parentElement).toHaveClass('-ms-[4px]');
    expect(badge.parentElement!.previousElementSibling).toHaveTextContent('Inbox');
  });

  it('calls onReselect when the current item is pressed again', async () => {
    const onReselect = vi.fn();
    render(
      <NavigationRail aria-label="Main">
        <NavigationRailItem icon={<Icon id="inbox" />} selected onReselect={onReselect}>
          Inbox
        </NavigationRailItem>
        <NavigationRailItem icon={<Icon id="sent" />} onReselect={onReselect}>
          Sent
        </NavigationRailItem>
      </NavigationRail>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sent' }));
    expect(onReselect).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Inbox' }));
    expect(onReselect).toHaveBeenCalledOnce();
  });

  it('requires items inside a rail', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<NavigationRailItem icon={<Icon id="x" />}>Lost</NavigationRailItem>),
    ).toThrow(/inside a NavigationRail/);
  });
});

describe('NavigationBar', () => {
  function Bar(props: Partial<React.ComponentProps<typeof NavigationBar>>) {
    return (
      <NavigationBar aria-label="Main" {...(props as object)}>
        <NavigationBarItem
          href="/"
          icon={<Icon id="home" />}
          selectedIcon={<Icon id="home-filled" />}
          selected
        >
          Home
        </NavigationBarItem>
        <NavigationBarItem href="/search" icon={<Icon id="search" />}>
          Search
        </NavigationBarItem>
        <NavigationBarItem href="/library" icon={<Icon id="library" />}>
          Library
        </NavigationBarItem>
        <NavigationBarItem href="/you" icon={<Icon id="you" />}>
          You
        </NavigationBarItem>
      </NavigationBar>
    );
  }

  it('shares the width equally with stacked items', async () => {
    const { container } = render(<Bar />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveClass('min-h-[64px]', 'bg-surface-container');
    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveClass('flex-1', 'py-[6px]');
    expect(home).toHaveAttribute('aria-current', 'page');
    // The outline and filled icons share a cell and cross-fade; the selected one shows.
    expect(screen.getByTestId('home-filled').parentElement).toHaveAttribute('data-shown', 'true');
    expect(screen.getByTestId('home').parentElement).not.toHaveAttribute('data-shown');
    expect(screen.getByTestId('home').parentElement).toHaveClass('col-start-1', 'row-start-1');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('puts icons beside labels in 40px pills, centred and sized to their content', () => {
    render(<Bar iconPosition="start" />);
    const label = screen.getByText('Search');
    expect(label).toHaveClass('text-label-medium');
    expect(label.parentElement).toHaveClass('gap-[4px]', 'ps-[16px]');
    expect(label.parentElement!.parentElement).toHaveClass('min-h-[40px]');
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('justify-center');
    // No side padding: the extra space goes to the bar's ends.
    expect(nav.style.paddingInline).toBe('');
    const search = screen.getByRole('link', { name: 'Search' });
    expect(search).toHaveClass('flex-initial');
    expect(search).not.toHaveClass('flex-1');
  });

  it('can still share the width equally with icons beside labels', () => {
    render(<Bar iconPosition="start" arrangement="equal" />);
    expect(screen.getByRole('link', { name: 'Search' })).toHaveClass('flex-1');
  });

  it('wraps labels and bolds the current one', () => {
    render(<Bar />);
    const label = screen.getByText('Home');
    expect(label).not.toHaveClass('truncate');
    expect(label).toHaveClass(
      'text-balance',
      'group-data-current/nav:text-label-medium-emphasized',
    );
    expect(screen.getByRole('navigation')).toHaveClass('min-h-[64px]');
  });

  it('moves focus along the bar with the arrow keys, mirrored right to left', async () => {
    const { rerender } = render(<Bar />);
    const home = screen.getByRole('link', { name: 'Home' });
    const search = screen.getByRole('link', { name: 'Search' });
    const you = screen.getByRole('link', { name: 'You' });
    act(() => home.focus());
    await userEvent.keyboard('{ArrowRight}');
    expect(search).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(you).toHaveFocus();
    rerender(
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <Bar />
      </div>,
    );
    const rtlHome = screen.getByRole('link', { name: 'Home' });
    act(() => rtlHome.focus());
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('link', { name: 'Search' })).toHaveFocus();
  });

  it('hides on scroll down and returns on scroll up', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(64);
    render(<Bar scrollBehavior="hide-on-scroll" />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('sticky', 'bottom-(--m3-nav-bar-offset)');
    expect(nav.style.getPropertyValue('--m3-nav-bar-offset')).toBe('0px');
    const scrollTo = (y: number) => {
      Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
      fireEvent.scroll(window);
    };
    scrollTo(40);
    expect(nav.style.getPropertyValue('--m3-nav-bar-offset')).toBe('-40px');
    scrollTo(200);
    expect(nav.style.getPropertyValue('--m3-nav-bar-offset')).toBe('-64px');
    scrollTo(180);
    expect(nav.style.getPropertyValue('--m3-nav-bar-offset')).toBe('-44px');
    scrollTo(0);
    vi.restoreAllMocks();
  });

  it('stays pinned by default', () => {
    render(<Bar />);
    const nav = screen.getByRole('navigation');
    expect(nav).not.toHaveClass('sticky');
    expect(nav.style.getPropertyValue('--m3-nav-bar-offset')).toBe('');
  });

  it('centres items within Compose’s side padding', () => {
    render(<Bar arrangement="centered" />);
    // 4 items: (100 − 10 × 7) / 2 = 15%.
    expect(screen.getByRole('navigation')).toHaveStyle({ paddingInline: '15%' });
  });
});
