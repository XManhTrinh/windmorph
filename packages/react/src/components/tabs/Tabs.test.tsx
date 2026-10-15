import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { Badge } from '../badge/Badge';
import { Tab, Tabs, type TabsProps } from './Tabs';

const Icon = ({ id }: { id: string }) => <svg data-testid={id} viewBox="0 0 24 24" />;

function Trip(props: Partial<TabsProps>) {
  return (
    <Tabs aria-label="Trip" {...props}>
      <Tab key="flights" title="Flights">
        Flight details
      </Tab>
      <Tab key="hotels" title="Hotels">
        Hotel details
      </Tab>
      <Tab key="cars" title="Cars">
        Car details
      </Tab>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders a tab list with the first tab selected and its panel', async () => {
    const { container } = render(<Trip />);
    const list = screen.getByRole('tablist', { name: 'Trip' });
    const tabs = within(list).getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Flight details');
    expect(tabs[0]).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
    expect(list).toHaveClass(
      'auto-cols-fr',
      'bg-[var(--_md-comp-tabs-container-color)]',
      'shadow-[inset_0_-1px_0_var(--_md-comp-tabs-divider-color)]',
    );
    expect(tabs[1]).toHaveAttribute('data-tokens', 'md-comp-tabs');
    expect(tabs[1]).toHaveAttribute('data-variant', 'primary');
    expect(tabs[1]).toHaveClass(
      'min-h-[calc(48px+var(--md-sys-density,0)*4px)]',
      'text-title-small',
      'text-[color:var(--_md-comp-tabs-with-label-text-inactive-label-text-color)]',
      'data-selected:text-[color:var(--_md-comp-tabs-with-label-text-active-label-text-color)]',
      'px-[16px]',
    );
    expect(tabs[1]).toHaveStyle({ gridColumnStart: '2' });
    expect(await axeViolations(container)).toEqual([]);
  });

  it('selects with a press; arrows move focus and Space / Enter select (the M3 keyboard)', async () => {
    const onSelectionChange = vi.fn();
    render(<Trip onSelectionChange={onSelectionChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Hotels' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith('hotels');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Hotel details');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Cars' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Hotels' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(onSelectionChange).toHaveBeenLastCalledWith('cars');
    await userEvent.keyboard('{Home}{ }');
    expect(screen.getByRole('tab', { name: 'Flights' })).toHaveAttribute('aria-selected', 'true');
  });

  it('selects on focus with keyboardActivation="automatic"', async () => {
    render(<Trip keyboardActivation="automatic" />);
    await userEvent.click(screen.getByRole('tab', { name: 'Flights' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Hotels' })).toHaveAttribute('aria-selected', 'true');
  });

  it('draws a 3px indicator with top corners on primary tabs and a 2px one on secondary', () => {
    const { container, unmount } = render(<Trip />);
    const indicator = () => container.querySelector('[role="tablist"] > span[aria-hidden]');
    expect(indicator()).toHaveClass('h-[3px]', 'rounded-t-[3px]');
    unmount();
    const { container: secondary } = render(<Trip variant="secondary" />);
    const line = secondary.querySelector('[role="tablist"] > span[aria-hidden]');
    expect(line).toHaveClass('h-[2px]');
    expect(line).not.toHaveClass('h-[3px]', 'rounded-t-[3px]');
  });

  it('aligns fixed tabs as wide as the widest at the start or centre', () => {
    const { rerender } = render(<Trip align="center" />);
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('auto-cols-fr', 'w-max', 'max-w-full', 'mx-auto');
    expect(list.parentElement).toHaveClass('bg-[var(--_md-comp-tabs-container-color)]');
    rerender(<Trip align="start" />);
    expect(screen.getByRole('tablist')).not.toHaveClass('mx-auto');
    rerender(<Trip align="center" scrollable />);
    expect(screen.getByRole('tablist')).not.toHaveClass('max-w-full');
  });

  it('shows badges after the label or on a stacked icon, and describes the tab with them', async () => {
    const { container, unmount } = render(
      <Tabs aria-label="Mail">
        <Tab key="inbox" title="Inbox" badge={<Badge>3</Badge>} />
        <Tab key="sent" title="Sent" />
      </Tabs>,
    );
    const inbox = screen.getByRole('tab', { name: 'Inbox' });
    expect(inbox).toHaveAccessibleDescription('3');
    // The badge (inside the describing wrapper) follows the label, 4px away.
    const described = document.getElementById(inbox.getAttribute('aria-describedby')!)!;
    expect(described).toContainElement(screen.getByText('3'));
    expect(described.parentElement).toHaveClass('gap-[4px]');
    expect(await axeViolations(container)).toEqual([]);
    unmount();
    render(
      <Tabs aria-label="Mail">
        <Tab key="inbox" title="Inbox" icon={<Icon id="i" />} badge={<Badge>12</Badge>} />
        <Tab key="sent" title="Sent" icon={<Icon id="s" />} />
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Inbox' })).toHaveAccessibleDescription('12');
    // BadgedBox hangs the badge from the icon's top end.
    expect(screen.getByTestId('i').parentElement?.parentElement).toContainElement(
      screen.getByText('12'),
    );
  });

  it('changes tab with a horizontal swipe on a swipeable panel', () => {
    const onSelectionChange = vi.fn();
    render(<Trip swipeable disabledKeys={['hotels']} onSelectionChange={onSelectionChange} />);
    const swipe = (dx: number, dy = 0, pointerType = 'touch') => {
      const panel = screen.getByRole('tabpanel');
      fireEvent.pointerDown(panel, { pointerId: 1, pointerType, clientX: 200, clientY: 100 });
      fireEvent.pointerUp(panel, {
        pointerId: 1,
        pointerType,
        clientX: 200 + dx,
        clientY: 100 + dy,
      });
    };
    expect(screen.getByRole('tabpanel')).toHaveClass('touch-pan-y');
    onSelectionChange.mockClear();
    swipe(-30);
    swipe(-80, 120);
    swipe(-120, 0, 'mouse');
    expect(onSelectionChange).not.toHaveBeenCalled();
    // Swiping towards the start shows the next tab, skipping the disabled one.
    swipe(-80);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Car details');
    swipe(-80);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Car details');
    swipe(80);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Flight details');
  });

  it('mirrors the swipe in right-to-left layouts', () => {
    render(
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <Trip swipeable />
      </div>,
    );
    const panel = screen.getByRole('tabpanel');
    fireEvent.pointerDown(panel, { pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 0 });
    fireEvent.pointerUp(panel, { pointerId: 1, pointerType: 'touch', clientX: 200, clientY: 0 });
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Hotel details');
  });

  it('can be controlled and disable tabs', async () => {
    render(<Trip selectedKey="cars" disabledKeys={['hotels']} />);
    expect(screen.getByRole('tab', { name: 'Cars' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Hotels' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'Flights' }));
    expect(screen.getByRole('tab', { name: 'Cars' })).toHaveAttribute('aria-selected', 'true');
  });

  it('uses 64px tabs (the M3 token) for icons above labels and 48px for icons before them', () => {
    const { unmount } = render(
      <Tabs aria-label="Media">
        <Tab key="photos" title="Photos" icon={<Icon id="p" />} />
        <Tab key="videos" title="Videos" icon={<Icon id="v" />} />
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Photos' })).toHaveClass(
      'min-h-[calc(64px+var(--md-sys-density,0)*4px)]',
      'flex-col',
      'justify-center',
      'gap-[2px]',
    );
    expect(screen.getByTestId('p').parentElement).toHaveAttribute('aria-hidden', 'true');
    unmount();
    render(
      <Tabs aria-label="Media" iconPlacement="start" variant="secondary">
        <Tab key="photos" title="Photos" icon={<Icon id="p" />} />
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Photos' })).toHaveClass(
      'min-h-[calc(48px+var(--md-sys-density,0)*4px)]',
      'gap-[8px]',
      'text-[color:var(--_md-comp-tabs-inactive-label-text-color)]',
      'data-selected:text-[color:var(--_md-comp-tabs-active-label-text-color)]',
    );
    expect(screen.getByRole('tab', { name: 'Photos' })).toHaveAttribute(
      'data-variant',
      'secondary',
    );
  });

  it('omits the panel and aria-controls for navigation-only tabs', async () => {
    const { container } = render(
      <Tabs aria-label="Sections">
        <Tab key="a" title="Overview" />
        <Tab key="b" title="Specs" />
      </Tabs>,
    );
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('aria-controls');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('scrolls when scrollable', () => {
    render(<Trip scrollable />);
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('auto-cols-max', 'ps-[52px]');
    expect(list.parentElement).toHaveClass('overflow-x-auto');
    expect(screen.getByRole('tab', { name: 'Flights' })).toHaveClass('min-w-[90px]');
  });

  it("places the indicator in the list's own pixels while an ancestor scales in (a dialog opening)", () => {
    // The row is laid out 300px wide with 100px tabs, but drawn at half size.
    const tabs = ['flights', 'hotels', 'cars'];
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const index = tabs.indexOf(this.dataset.key ?? '');
      const box =
        this.getAttribute('role') === 'tab' && index >= 0
          ? { left: index * 50, width: 50 }
          : { left: 0, width: 150 };
      return DOMRect.fromRect({ x: box.left, y: 0, width: box.width, height: 24 });
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.getAttribute('role') === 'tab' ? 100 : 300;
    });
    const { container } = render(<Trip variant="secondary" defaultSelectedKey="hotels" />);
    const indicator = container.querySelector<HTMLElement>('[data-ready]');
    expect(indicator?.style.translate).toBe('100px 0');
    expect(indicator?.style.width).toBe('100px');
    vi.restoreAllMocks();
  });

  it('moves the indicator with its tab when tabs are added (the row keeps its width)', () => {
    // Fixed tabs split the 300px row evenly, so each new tab narrows the others.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const list = this.closest('[role="tablist"]');
      const tabs = list ? [...list.querySelectorAll('[role="tab"]')] : [];
      const index = tabs.indexOf(this);
      const width = 300 / Math.max(tabs.length, 1);
      const box =
        this.getAttribute('role') === 'tab' && index >= 0
          ? { left: index * width, width }
          : { left: 0, width: 300 };
      return DOMRect.fromRect({ x: box.left, y: 0, width: box.width, height: 24 });
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.getAttribute('role') === 'tab' ? 100 : 300;
    });
    const Row = ({ keys }: { keys: string[] }) => (
      <Tabs aria-label="Trip" variant="secondary" defaultSelectedKey="all">
        {keys.map((key) => (
          <Tab key={key} title={key} />
        ))}
      </Tabs>
    );
    const { container, rerender } = render(<Row keys={['all']} />);
    const indicator = () => container.querySelector<HTMLElement>('[data-ready]');
    expect(indicator()?.style.width).toBe('300px');
    rerender(<Row keys={['all', 'flights', 'hotels']} />);
    expect(indicator()?.style.translate).toBe('0px 0');
    expect(indicator()?.style.width).toBe('100px');
    vi.restoreAllMocks();
  });

  it('animates only selection changes: the first placement appears in place', async () => {
    const tabs = ['flights', 'hotels', 'cars'];
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const index = tabs.indexOf(this.dataset.key ?? '');
      const box =
        this.getAttribute('role') === 'tab' && index >= 0
          ? { left: index * 100, width: 100 }
          : { left: 0, width: 300 };
      return DOMRect.fromRect({ x: box.left, y: 0, width: box.width, height: 48 });
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.getAttribute('role') === 'tab' ? 100 : 300;
    });
    const { container } = render(<Trip variant="secondary" />);
    const list = screen.getByRole('tablist');
    const indicator = container.querySelector<HTMLElement>('[data-ready]')!;
    // Transitions are gated on the row's data-animate.
    expect(indicator).toHaveClass('group-data-animate/tabs:[transition-property:translate,width]');
    // Colour fades are gated on data-recolour.
    expect(screen.getByRole('tab', { name: 'Flights' })).toHaveClass(
      'group-data-recolour/tabs:[--m3-transition-property:color]',
    );
    expect(indicator.style.translate).toBe('0px 0');
    expect(list).not.toHaveAttribute('data-animate');
    expect(list).not.toHaveAttribute('data-recolour');
    await userEvent.click(screen.getByRole('tab', { name: 'Hotels' }));
    expect(indicator.style.translate).toBe('100px 0');
    expect(list).toHaveAttribute('data-animate', 'true');
    vi.restoreAllMocks();
  });

  it('reveals the row at the nearest position, so arrow keys never centre the page on it', () => {
    const scrollIntoView = vi.fn();
    const original = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    render(<Trip scrollable />);
    const list = screen.getByRole('tablist');
    // React Aria's call when keyboard focus moves to a tab the row has to scroll to.
    list.scrollIntoView({ block: 'center', inline: 'center' });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    expect(scrollIntoView.mock.contexts[0]).toBe(list);
    if (original) Object.defineProperty(Element.prototype, 'scrollIntoView', original);
    else Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('turns the colour fade on in the render that changes the selection', async () => {
    // The indicator's measuring reads layout, which commits the tabs' new colours: the fade
    // must already be on then, or the first selection recolours in one frame.
    const seen: (string | undefined)[] = [];
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.getAttribute('role') === 'tab' && this.hasAttribute('data-selected')) {
        seen.push(this.closest<HTMLElement>('[role="tablist"]')!.dataset.recolour);
      }
      return DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 48 });
    });
    render(<Trip variant="secondary" />);
    expect(seen.every((value) => value === undefined)).toBe(true);
    seen.length = 0;
    await userEvent.click(screen.getByRole('tab', { name: 'Hotels' }));
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((value) => value === 'true')).toBe(true);
    vi.restoreAllMocks();
  });

  it('re-measures the indicator when the selected tab’s content resizes on its own', () => {
    const observed: Element[] = [];
    let notify = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe(element: Element) {
          observed.push(element);
        }
        disconnect() {
          observed.length = 0;
        }
      },
    );
    let labelWidth = 40;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.hasAttribute('data-tab-part'))
        return DOMRect.fromRect({ x: 50 - labelWidth / 2, y: 0, width: labelWidth, height: 20 });
      const tab = this.getAttribute('role') === 'tab';
      return DOMRect.fromRect({ x: 0, y: 0, width: tab ? 100 : 300, height: 48 });
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.getAttribute('role') === 'tab' ? 100 : 300;
    });
    const { container } = render(<Trip />);
    const flights = screen.getByRole('tab', { name: 'Flights' });
    expect(observed).toContain(flights.querySelector('[data-tab-part]'));
    const indicator = container.querySelector<HTMLElement>('[data-ready]')!;
    expect(indicator.style.width).toBe('40px');
    // A web font loads: the label widens but the row doesn't resize.
    labelWidth = 48;
    act(() => notify());
    expect(indicator.style.width).toBe('48px');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('puts className, style and data-* on the root', () => {
    render(<Trip className="w-80" style={{ marginTop: 4 }} data-testid="tabs" />);
    const root = screen.getByTestId('tabs');
    expect(root).toHaveClass('w-80', 'flex-col');
    expect(root).toHaveStyle({ marginTop: '4px' });
    expect(root).toContainElement(screen.getByRole('tablist'));
  });
});

describe('Tabs component tokens', () => {
  it('marks the root and each tab, and lets consumer classes replace the token classes', () => {
    render(
      <Tabs
        aria-label="Trip"
        data-testid="tabs"
        classNames={{ list: 'bg-tertiary', tab: 'text-on-tertiary' }}
      >
        <Tab key="flights" title="Flights" icon={<svg data-testid="icon" />} />
        <Tab key="hotels" title="Hotels" />
      </Tabs>,
    );
    const root = screen.getByTestId('tabs');
    expect(root).toHaveAttribute('data-tokens', 'md-comp-tabs');
    expect(root).toHaveAttribute('data-variant', 'primary');
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('bg-tertiary');
    expect(list).not.toHaveClass('bg-[var(--_md-comp-tabs-container-color)]');
    const tab = screen.getByRole('tab', { name: 'Hotels' });
    expect(tab).toHaveClass('text-on-tertiary');
    expect(tab).not.toHaveClass(
      'text-[color:var(--_md-comp-tabs-with-label-text-inactive-label-text-color)]',
    );
    expect(screen.getByTestId('icon').parentElement).toHaveClass(
      'text-[color:var(--m3-tab-icon-color)]',
    );
  });
});

describe('Tabs classNames', () => {
  it('puts the scroller, icon and label slots on their parts', () => {
    render(
      <Tabs
        aria-label="Trips"
        classNames={{ scroller: 'scroller-x', icon: 'icon-x', label: 'label-x' }}
      >
        <Tab key="flights" title="Flights" icon={<svg data-testid="icon" />} />
        <Tab key="hotels" title="Hotels" />
      </Tabs>,
    );
    expect(screen.getByRole('tablist').parentElement).toHaveClass('scroller-x');
    expect(screen.getByTestId('icon').parentElement).toHaveClass('icon-x');
    expect(screen.getByText('Hotels')).toHaveClass('label-x');
  });
});

describe('Tabs density', () => {
  it('sets density on the tab row, not on the panels', async () => {
    const { container } = render(
      <ThemeScope density={-1}>
        <Tabs aria-label="Inbox" density={-3}>
          <Tab key="a" title="All">
            <p>Everything</p>
          </Tab>
          <Tab key="b" title="Sent">
            <p>Sent mail</p>
          </Tab>
        </Tabs>
      </ThemeScope>,
    );
    const list = screen.getByRole('tablist');
    expect(list.parentElement).toHaveAttribute('data-density', '-3');
    expect(screen.getByRole('tabpanel').closest('[data-density="-3"]')).toBeNull();
    expect(screen.getByRole('tab', { name: 'All' })).toHaveClass(
      'min-h-[calc(48px+var(--md-sys-density,0)*4px)]',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it("follows its scope's density when it sets none", () => {
    render(
      <ThemeScope density={-2}>
        <Tabs aria-label="Inbox">
          <Tab key="a" title="All" />
        </Tabs>
      </ThemeScope>,
    );
    expect(screen.getByRole('tablist').closest('[data-density]')).toHaveAttribute(
      'data-density',
      '-2',
    );
  });
});
