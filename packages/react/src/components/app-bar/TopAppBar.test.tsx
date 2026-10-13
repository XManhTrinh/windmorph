import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { IconButton } from '../icon-button/IconButton';
import { TopAppBar } from './TopAppBar';

const Icon = () => <svg viewBox="0 0 24 24" />;
const menu = <IconButton icon={<Icon />} aria-label="Menu" />;
const search = <IconButton icon={<Icon />} aria-label="Search" />;

const nextFrame = () =>
  act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

async function scrollWindow(y: number) {
  window.scrollY = y;
  window.dispatchEvent(new Event('scroll'));
  await nextFrame();
}

afterEach(() => {
  window.scrollY = 0;
});

describe('TopAppBar', () => {
  it('renders a 64px small bar with navigation, title, subtitle and actions', async () => {
    const { container } = render(
      <TopAppBar
        title={<h1>Inbox</h1>}
        subtitle="3 unread"
        navigationIcon={menu}
        actions={search}
        className="fixed top-0"
        data-testid="bar"
      />,
    );
    const bar = screen.getByTestId('bar');
    expect(bar.tagName).toBe('HEADER');
    expect(bar).toHaveClass('fixed', 'top-0', 'w-full', 'text-on-surface');
    expect(bar).not.toHaveClass('sticky');
    const row = bar.firstElementChild!;
    expect(row).toHaveClass('h-[64px]', 'grid-cols-[auto_minmax(0,1fr)_auto]');
    expect(screen.getByRole('heading', { name: 'Inbox' }).parentElement).toHaveClass(
      'text-title-large',
      'truncate',
    );
    expect(screen.getByText('3 unread')).toHaveClass(
      'text-label-medium',
      'text-on-surface-variant',
    );
    expect(screen.getByRole('button', { name: 'Menu' }).parentElement).toHaveClass(
      'ps-[8px]',
      'pe-[4px]',
    );
    expect(screen.getByRole('button', { name: 'Search' }).parentElement).toHaveClass(
      'text-on-surface-variant',
      'gap-[8px]',
      'pe-[8px]',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('indents the title 16px without a navigation icon and centres it on request', () => {
    render(<TopAppBar title="Title" titleAlign="center" data-testid="bar" />);
    const title = screen.getByText('Title').parentElement!;
    expect(title).toHaveClass('ps-[16px]', 'items-center');
    expect(screen.getByTestId('bar').firstElementChild).toHaveClass(
      'grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)]',
    );
  });

  it.each([
    ['medium', false, 'min-h-[48px]', 'text-headline-medium'],
    ['medium', true, 'min-h-[72px]', 'text-headline-medium'],
    ['large', false, 'min-h-[56px]', 'text-display-small'],
    ['large', true, 'min-h-[88px]', 'text-display-small'],
  ] as const)(
    'sizes the %s bar (subtitle: %s) from Compose',
    (variant, withSubtitle, rowHeight, font) => {
      render(
        <TopAppBar
          variant={variant}
          title="Inbox"
          subtitle={withSubtitle ? 'All mail' : undefined}
          data-testid="bar"
        />,
      );
      const [row, expanded] = Array.from(screen.getByTestId('bar').children) as [
        HTMLElement,
        HTMLElement,
      ];
      expect(row).toHaveClass('h-[64px]');
      expect(expanded).toHaveClass(rowHeight, 'ps-[16px]');
      expect(expanded.firstElementChild).toHaveClass(font);
      // Only the expanded title is announced while expanded.
      expect(row.querySelector('[aria-hidden]')).not.toBe(null);
      expect(expanded).not.toHaveAttribute('aria-hidden');
    },
  );

  it('sticks and changes colour when content scrolls under a pinned small bar', async () => {
    render(<TopAppBar title="Inbox" scrollBehavior="pinned" data-testid="bar" />);
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveClass('sticky', 'top-(--m3-app-bar-offset)', 'z-(--md-sys-z-sticky)');
    await nextFrame();
    expect(bar.style.getPropertyValue('--m3-app-bar-scrolled')).toBe('0%');
    await scrollWindow(10);
    expect(bar).toHaveAttribute('data-scrolled', 'true');
    expect(bar.style.getPropertyValue('--m3-app-bar-scrolled')).toBe('100%');
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('0px');
  });

  it('hides an enter-always bar on scroll down and brings it back on any scroll up', async () => {
    render(<TopAppBar title="Inbox" scrollBehavior="enter-always" data-testid="bar" />);
    const bar = screen.getByTestId('bar');
    Object.defineProperty(bar, 'offsetHeight', { configurable: true, value: 64 });
    await scrollWindow(40);
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('-40px');
    await scrollWindow(400);
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('-64px');
    await scrollWindow(380);
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('-44px');
  });

  it('collapses a two-row bar with the scroll and swaps the announced title', async () => {
    render(
      <TopAppBar
        variant="large"
        title="Inbox"
        scrollBehavior="exit-until-collapsed"
        data-testid="bar"
      />,
    );
    const bar = screen.getByTestId('bar');
    const [row, expanded] = Array.from(bar.children) as [HTMLElement, HTMLElement];
    Object.defineProperty(expanded, 'offsetHeight', { configurable: true, value: 56 });
    await scrollWindow(28);
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('-28px');
    expect(Number(bar.style.getPropertyValue('--m3-app-bar-bottom-alpha'))).toBeCloseTo(0.5);
    expect(bar).toHaveAttribute('data-collapsed', 'true');
    expect(row.querySelector('[aria-hidden]')).toBe(null);
    expect(expanded).toHaveAttribute('aria-hidden', 'true');
    await scrollWindow(500);
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('-56px');
    expect(bar.style.getPropertyValue('--m3-app-bar-scrolled')).toBe('100%');
    expect(Number(bar.style.getPropertyValue('--m3-app-bar-top-alpha'))).toBeCloseTo(1);
    // Exit-until-collapsed stays collapsed until the content is back near the top.
    await scrollWindow(100);
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('-56px');
    await scrollWindow(0);
    expect(bar.style.getPropertyValue('--m3-app-bar-offset')).toBe('0px');
    expect(bar).not.toHaveAttribute('data-collapsed');
  });
});
