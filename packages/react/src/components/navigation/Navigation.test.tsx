import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { animate } from 'motion/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
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

  it('slides the expanded pill from the previous current item', async () => {
    // jsdom has no layout: put each item's pill 56px below the one before.
    const tops: Record<string, number> = { Inbox: 0, Sent: 56 };
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const top = tops[this.closest('a, button')?.textContent ?? ''] ?? 0;
      return DOMRect.fromRect({ x: 0, y: top, width: 56, height: 56 });
    });
    function Selectable() {
      const [current, setCurrent] = useState('inbox');
      return (
        <NavigationRail aria-label="Main" expanded>
          <NavigationRailItem
            icon={<Icon id="inbox" />}
            selected={current === 'inbox'}
            onPress={() => setCurrent('inbox')}
          >
            Inbox
          </NavigationRailItem>
          <NavigationRailItem
            icon={<Icon id="sent" />}
            selected={current === 'sent'}
            onPress={() => setCurrent('sent')}
          >
            Sent
          </NavigationRailItem>
        </NavigationRail>
      );
    }
    render(<Selectable />);
    // Nothing slides on the first render.
    expect(animate).not.toHaveBeenCalled();
    const sent = screen.getByRole('button', { name: 'Sent' });
    const sentPill = sent.querySelector('[class*="bg-secondary-container"]')!;
    expect(sentPill).toHaveClass('[transition-property:none]');
    await userEvent.click(sent);
    // Sent's pill starts at Inbox's, 56px up, and springs home.
    expect(animate).toHaveBeenCalledExactlyOnceWith(
      sentPill,
      { y: [-56, 0] },
      expect.objectContaining({ type: 'spring' }),
    );
    // Labels and icons sit above every pill in the isolated list.
    expect(sent.querySelector('.z-\\[1\\]')).not.toBeNull();
    expect(screen.getByRole('navigation').querySelector('.isolate')).not.toBeNull();
    vi.mocked(animate).mockClear();
    vi.restoreAllMocks();
  });

  it('hugs the expanded pill to its content, with the whole row as the target', () => {
    render(<Rail expanded />);
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    expect(inbox).toHaveClass('w-full', 'justify-items-start');
    expect(inbox).not.toHaveClass('justify-items-stretch');
    expect(inbox.firstElementChild).toHaveClass('h-[56px]', 'max-w-full');
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

  it('changes the pill’s width as it slides between labels of different lengths', async () => {
    const boxes: Record<string, { top: number; width: number }> = {
      Inbox: { top: 0, width: 110 },
      'Sent mail': { top: 56, width: 140 },
    };
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const box = boxes[this.closest('a, button')?.textContent ?? ''] ?? { top: 0, width: 0 };
      return DOMRect.fromRect({ x: 0, y: box.top, width: box.width, height: 56 });
    });
    vi.mocked(animate).mockReturnValue(Promise.resolve() as unknown as ReturnType<typeof animate>);
    function Selectable() {
      const [current, setCurrent] = useState('Inbox');
      return (
        <NavigationRail aria-label="Main" expanded>
          {['Inbox', 'Sent mail'].map((name) => (
            <NavigationRailItem
              key={name}
              icon={<Icon id={name} />}
              selected={current === name}
              onPress={() => setCurrent(name)}
            >
              {name}
            </NavigationRailItem>
          ))}
        </NavigationRail>
      );
    }
    render(<Selectable />);
    const sent = screen.getByRole('button', { name: 'Sent mail' });
    const pill = sent.querySelector<HTMLElement>('[class*="bg-secondary-container"]')!;
    await userEvent.click(sent);
    expect(animate).toHaveBeenCalledExactlyOnceWith(
      pill,
      { y: [-56, 0], width: [110, 140] },
      expect.objectContaining({ type: 'spring' }),
    );
    // Once settled, the pill sizes itself to its content again.
    await waitFor(() => expect(pill.style.width).toBe(''));
    vi.mocked(animate).mockReset();
    vi.restoreAllMocks();
  });

  it('grows the collapsed pill in place instead of sliding', async () => {
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

  it('puts icons beside labels in 40px pills', () => {
    render(<Bar iconPosition="start" />);
    const label = screen.getByText('Search');
    expect(label).toHaveClass('text-label-medium');
    expect(label.parentElement).toHaveClass('gap-[4px]', 'ps-[16px]');
    expect(label.parentElement!.parentElement).toHaveClass('h-[40px]');
  });

  it('centres items within Compose’s side padding', () => {
    render(<Bar arrangement="centered" />);
    // 4 items: (100 − 10 × 7) / 2 = 15%.
    expect(screen.getByRole('navigation')).toHaveStyle({ paddingInline: '15%' });
  });
});
