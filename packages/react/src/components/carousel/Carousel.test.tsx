import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Carousel } from './Carousel';

const reducedMotion = vi.hoisted(() => ({ value: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useReducedMotion: () => reducedMotion.value,
}));

afterEach(() => {
  vi.restoreAllMocks();
  reducedMotion.value = false;
});

const slides = (n: number) =>
  Array.from({ length: n }, (_, i) => <div key={i} data-testid={`slide-${i}`}>{`Slide ${i}`}</div>);

const mask = (index: number) => screen.getByTestId(`slide-${index}`).parentElement!;

describe('Carousel', () => {
  it('is a named carousel region of slides', async () => {
    const { container } = render(
      <Carousel aria-label="Photos" className="h-[200px]" data-testid="carousel">
        {slides(4)}
      </Carousel>,
    );
    const region = screen.getByRole('region', { name: 'Photos' });
    expect(region).toBe(screen.getByTestId('carousel'));
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    expect(region).toHaveClass('h-[200px]');
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(4);
    expect(groups[0]).toHaveAttribute('aria-label', '1 of 4');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('takes its slide labels from `labels`, with numbers in the locale', () => {
    render(
      <Carousel
        aria-label="Photos"
        labels={{ slide: (position, count) => `Photo ${position} / ${count}` }}
      >
        {slides(2)}
      </Carousel>,
    );
    expect(screen.getAllByRole('group')[1]).toHaveAttribute('aria-label', 'Photo 2 / 2');
  });

  it('takes the role descriptions from `labels` too', () => {
    render(
      <Carousel aria-label="Photos" labels={{ carousel: 'gallery', item: 'photo' }}>
        {slides(2)}
      </Carousel>,
    );
    expect(screen.getByRole('region', { name: 'Photos' })).toHaveAttribute(
      'aria-roledescription',
      'gallery',
    );
    expect(screen.getAllByRole('group')[0]).toHaveAttribute('aria-roledescription', 'photo');
  });

  it('sizes slots and masks items from the keylines, inside the content padding', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    render(
      <Carousel aria-label="Photos" preferredItemSize={186}>
        {slides(6)}
      </Carousel>,
    );
    const groups = screen.getAllByRole('group');
    expect(groups[0]!.style.width).toBe('186px');
    // The 16px leading padding comes out of the large and medium items (8px each), so the
    // first item's mask is 178px and moves in by 16px; the small item stays 40px.
    const first = mask(0).style;
    expect(first.clipPath).toMatch(/^inset\(0 4px 0 4px round/);
    expect(first.translate).toBe('12px 0');
    // The scroller pads only across the carousel: the keylines handle the main-axis padding.
    const scroller = groups[0]!.parentElement!;
    expect(scroller.style.paddingBlock).toBe('8px');
    expect(scroller.style.paddingInlineStart).toBe('0px');
  });

  it('lets multi-browse fling across items; hero stops at each one', () => {
    const { rerender } = render(<Carousel aria-label="Photos">{slides(3)}</Carousel>);
    expect(screen.getAllByRole('group')[0]).toHaveClass('snap-start');
    expect(screen.getAllByRole('group')[0]).not.toHaveClass('snap-always');
    rerender(
      <Carousel aria-label="Photos" variant="hero">
        {slides(3)}
      </Carousel>,
    );
    expect(screen.getAllByRole('group')[0]).toHaveClass('snap-start', 'snap-always');
  });

  it('keeps uncontained items one size, unmasked, flowing past the end edge', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(412);
    render(
      <Carousel aria-label="Cards" variant="uncontained" itemSize={188}>
        {slides(5)}
      </Carousel>,
    );
    const groups = screen.getAllByRole('group');
    const scroller = groups[0]!.parentElement!;
    expect(groups.every((group) => group.style.width === '188px')).toBe(true);
    // CSS corners only: no keyline mask, translation or size.
    expect(mask(0)).toHaveClass('[clip-path:inset(0_round_var(--m3-carousel-item-corner))]');
    expect(mask(4).style.clipPath).toBe('');
    expect(mask(4).style.translate).toBe('');
    // Leading padding only.
    expect(scroller.style.paddingInlineStart).toBe('16px');
    expect(scroller.style.paddingInlineEnd).toBe('0px');
    vi.restoreAllMocks();
  });

  it('masks items with the item shape token, which a consumer class beats', () => {
    const { rerender } = render(
      <Carousel aria-label="Photos" data-testid="carousel">
        {slides(3)}
      </Carousel>,
    );
    const region = screen.getByTestId('carousel');
    expect(region).toHaveAttribute('data-tokens', 'md-comp-carousel');
    expect(region).toHaveAttribute('data-variant', 'multi-browse');
    expect(region).toHaveClass(
      '[--m3-carousel-corner:var(--_md-comp-carousel-item-container-shape)]',
    );
    expect(screen.getAllByRole('group')[0]).toHaveAttribute('data-slot', 'item');
    rerender(
      <Carousel
        aria-label="Photos"
        variant="hero"
        data-testid="carousel"
        className="[--m3-carousel-corner:12px]"
        classNames={{ item: 'rounded-corner-small' }}
      >
        {slides(3)}
      </Carousel>,
    );
    expect(region).toHaveAttribute('data-variant', 'hero');
    expect(region).toHaveClass('[--m3-carousel-corner:12px]');
    expect(region).not.toHaveClass(
      '[--m3-carousel-corner:var(--_md-comp-carousel-item-container-shape)]',
    );
    expect(screen.getAllByRole('group')[0]).toHaveClass('rounded-corner-small');
    expect(screen.getAllByRole('group')[0]).not.toHaveClass('rounded-(--m3-carousel-corner)');
  });

  it('fills every item with the surface colour', () => {
    render(<Carousel aria-label="Photos">{slides(3)}</Carousel>);
    expect(mask(0)).toHaveClass('bg-surface');
  });

  it('uncontained carousels snap only when asked; vertical ones scroll on y', () => {
    const { rerender } = render(
      <Carousel aria-label="Cards" variant="uncontained">
        {slides(3)}
      </Carousel>,
    );
    expect(screen.getAllByRole('group')[0]).not.toHaveClass('snap-start');
    rerender(
      <Carousel aria-label="Cards" variant="uncontained" snap="item">
        {slides(3)}
      </Carousel>,
    );
    expect(screen.getAllByRole('group')[0]).toHaveClass('snap-start');
    rerender(
      <Carousel aria-label="Cards" orientation="vertical">
        {slides(3)}
      </Carousel>,
    );
    expect(screen.getAllByRole('group')[0]!.parentElement).toHaveClass(
      'flex-col',
      'overflow-y-auto',
      'snap-y',
    );
  });

  it('shows full-screen items one at a time, vertically, with no padding', () => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(640);
    render(
      <Carousel aria-label="Stories" variant="full-screen">
        {slides(3)}
      </Carousel>,
    );
    const groups = screen.getAllByRole('group');
    const scroller = groups[0]!.parentElement!;
    expect(scroller).toHaveClass('flex-col', 'snap-y');
    expect(scroller.style.gap).toBe('16px');
    expect(scroller.style.paddingInline).toBe('0px');
    expect(groups[0]!.style.height).toBe('640px');
    expect(groups[0]).toHaveClass('snap-always', 'focus-ring-inset');
    expect(mask(0).style.clipPath).toBe('');
    // Edge to edge: no corners, pressed or not.
    expect(screen.getByRole('region')).toHaveClass(
      '[--m3-carousel-corner:0px]',
      '[--m3-carousel-pressed-corner:0px]',
    );
  });

  it('lets multi-aspect items keep their own width between 9:16 and 16:9', () => {
    render(
      <Carousel aria-label="Clips" variant="multi-aspect">
        {slides(2)}
      </Carousel>,
    );
    const group = screen.getAllByRole('group')[0]!;
    expect(group.style.width).toBe('');
    expect(group).toHaveClass(
      'w-max',
      'min-w-[calc(var(--m3-carousel-cross-size)*9/16)]',
      'max-w-[calc(var(--m3-carousel-cross-size)*16/9)]',
    );
    expect(group.parentElement!.style.paddingInlineStart).toBe('16px');
  });

  it('keeps every item large and unmasked under reduced motion', () => {
    reducedMotion.value = true;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    render(<Carousel aria-label="Photos">{slides(6)}</Carousel>);
    const groups = screen.getAllByRole('group');
    expect(groups.map((group) => group.style.width)).toEqual(Array(6).fill('186px'));
    expect(mask(1).style.clipPath).toBe('');
    expect(mask(1).style.translate).toBe('');
    // The scroller pads the items itself, and snaps them inside the padding.
    const scroller = groups[0]!.parentElement!;
    expect(scroller.style.paddingInlineStart).toBe('16px');
    expect(scroller.style.scrollPaddingInlineStart).toBe('16px');
  });

  it('moves focus between items with Tab and the arrow keys, and leaves with Down', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Carousel aria-label="Photos">{slides(3)}</Carousel>
        <button type="button">Show all</button>
      </>,
    );
    const groups = screen.getAllByRole('group');
    await user.tab();
    await user.tab();
    // The container never takes focus: Tab lands on the first item.
    expect(groups[0]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(groups[1]).toHaveFocus();
    await user.tab();
    expect(groups[2]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(groups[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(groups[2]).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(groups[1]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    act(() => groups[1]!.focus());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Show all' })).toHaveFocus();
  });

  it('mirrors the arrow keys right to left', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <Carousel aria-label="Photos">{slides(3)}</Carousel>
      </div>,
    );
    const groups = screen.getAllByRole('group');
    act(() => groups[0]!.focus());
    await user.keyboard('{ArrowLeft}');
    expect(groups[1]).toHaveFocus();
  });

  it('activates items with a press, Enter or Space, and shows their states', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { container } = render(
      <Carousel aria-label="Photos" onAction={onAction} disabledIndexes={[2]}>
        {slides(3)}
      </Carousel>,
    );
    const groups = screen.getAllByRole('group');
    await user.click(screen.getByTestId('slide-1'));
    expect(onAction).toHaveBeenLastCalledWith(1);
    act(() => groups[0]!.focus());
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenLastCalledWith(0);
    await user.keyboard(' ');
    expect(onAction).toHaveBeenCalledTimes(3);
    await user.click(screen.getByTestId('slide-2'));
    expect(onAction).toHaveBeenCalledTimes(3);
    expect(groups[2]).toHaveAttribute('aria-disabled', 'true');
    expect(mask(2)).toHaveAttribute('data-disabled');
    const stateLayer = mask(0).lastElementChild!;
    expect(stateLayer).toHaveAttribute('aria-hidden', 'true');
    expect(stateLayer).toHaveClass('state-layer');
    fireEvent.pointerDown(groups[0]!, { pointerType: 'mouse', button: 0, pointerId: 1 });
    expect(mask(0)).toHaveAttribute('data-pressed');
    fireEvent.pointerUp(groups[0]!, { pointerType: 'mouse', button: 0, pointerId: 1 });
    expect(await axeViolations(container)).toEqual([]);
  });

  // An actionable item's press handler stops the pointer events and focuses the item on
  // pointer down; the scroller missed both, so a press scrolled the carousel and a drag
  // opened the item (2026-10-17).
  it('never scrolls on a press of an actionable item, and a mouse drag never activates it', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollTo = scrollTo;
    Element.prototype.scrollIntoView = scrollIntoView;
    const onAction = vi.fn();
    render(
      <Carousel aria-label="Photos" onAction={onAction}>
        {slides(3)}
      </Carousel>,
    );
    const item = screen.getAllByRole('group')[1]!;
    const scroller = item.parentElement!;
    await user.click(item);
    expect(onAction).toHaveBeenCalledWith(1);
    expect(item).toHaveFocus();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();

    onAction.mockClear();
    await user.pointer([
      { keys: '[MouseLeft>]', target: item, coords: { clientX: 100, clientY: 10 } },
      { target: item, coords: { clientX: 60, clientY: 10 } },
    ]);
    expect(scroller.scrollLeft).toBe(40);
    expect(scroller).toHaveAttribute('data-dragging');
    await user.pointer({
      keys: '[/MouseLeft]',
      target: item,
      coords: { clientX: 60, clientY: 10 },
    });
    expect(scroller).not.toHaveAttribute('data-dragging');
    expect(onAction).not.toHaveBeenCalled();
  });

  it('has no state layer when items are not actionable', () => {
    render(<Carousel aria-label="Photos">{slides(1)}</Carousel>);
    expect(mask(0).children).toHaveLength(1);
  });
});
