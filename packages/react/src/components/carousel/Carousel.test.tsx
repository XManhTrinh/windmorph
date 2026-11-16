import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Carousel } from './Carousel';

const reducedMotion = vi.hoisted(() => ({ value: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useReducedMotion: () => reducedMotion.value,
}));

afterEach(() => {
  vi.useRealTimers();
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

  // The drag flag stayed set until the next press inside the carousel, so the next Enter or
  // Space on an item was dropped as if it had ended the drag (2026-11-16).
  it('activates an item from the keyboard after a mouse drag', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <Carousel aria-label="Photos" onAction={onAction}>
        {slides(3)}
      </Carousel>,
    );
    const item = screen.getAllByRole('group')[1]!;
    await user.pointer([
      { keys: '[MouseLeft>]', target: item, coords: { clientX: 100, clientY: 10 } },
      { target: item, coords: { clientX: 60, clientY: 10 } },
      { keys: '[/MouseLeft]', target: item, coords: { clientX: 60, clientY: 10 } },
    ]);
    expect(onAction).not.toHaveBeenCalled();
    act(() => item.focus());
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith(1);
    // A click from assistive technology, with no key pressed, isn't a pointer's either.
    await user.pointer([
      { keys: '[MouseLeft>]', target: item, coords: { clientX: 100, clientY: 10 } },
      { target: item, coords: { clientX: 60, clientY: 10 } },
      { keys: '[/MouseLeft]', target: item, coords: { clientX: 60, clientY: 10 } },
    ]);
    fireEvent.click(item);
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('has no state layer when items are not actionable', () => {
    render(<Carousel aria-label="Photos">{slides(1)}</Carousel>);
    expect(mask(0).children).toHaveLength(1);
  });
});

describe('Carousel items that are links', () => {
  it('makes an item a real link named by its content, routed by a RouterProvider', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <Carousel
          aria-label="Recipes"
          itemHref={(index) => (index === 1 ? undefined : `/recipes/${index}`)}
          itemTarget="_self"
        >
          {slides(3)}
        </Carousel>
      </RouterProvider>,
    );
    const link = screen.getByRole('link', { name: 'Slide 0' });
    expect(link).toHaveAttribute('href', '/recipes/0');
    expect(link).toHaveAttribute('target', '_self');
    // The slide stays a group named by its place; the link, not the slide, takes focus.
    const slide = link.closest('[data-slot="item"]')!;
    expect(slide).toHaveAttribute('role', 'group');
    expect(slide).not.toHaveAttribute('tabindex');
    // An item without an address stays a plain slide.
    expect(screen.queryByRole('link', { name: 'Slide 1' })).toBeNull();
    await userEvent.click(screen.getByText('Slide 2'));
    expect(navigate).toHaveBeenCalledWith('/recipes/2', undefined);
  });

  it('puts `classNames.link` and `itemRel` on the link, and passes axe', async () => {
    const { container } = render(
      <Carousel
        aria-label="Recipes"
        itemHref={(index) => (index === 1 ? undefined : `/recipes/${index}`)}
        itemRel="nofollow"
        disabledIndexes={[2]}
        classNames={{ link: 'rounded-corner-small' }}
      >
        {slides(4)}
      </Carousel>,
    );
    const link = screen.getByRole('link', { name: 'Slide 0' });
    expect(link).toHaveClass('rounded-corner-small');
    expect(link).toHaveAttribute('rel', 'nofollow');
    expect(await axeViolations(container)).toEqual([]);
  });

  // A new tab opened from a link with `target="_blank"` could reach back to the page through
  // `window.opener`, as List's and Menu's link items guard against (2026-11-16).
  it('keeps a link that opens a new tab from reaching back to the page', () => {
    const { rerender } = render(
      <Carousel aria-label="Recipes" itemHref={(index) => `/recipes/${index}`} itemTarget="_blank">
        {slides(2)}
      </Carousel>,
    );
    expect(screen.getByRole('link', { name: 'Slide 0' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    rerender(
      <Carousel
        aria-label="Recipes"
        itemHref={(index) => `/recipes/${index}`}
        itemTarget="_blank"
        itemRel="noopener"
      >
        {slides(2)}
      </Carousel>,
    );
    expect(screen.getByRole('link', { name: 'Slide 0' })).toHaveAttribute('rel', 'noopener');
  });

  // A link's own drag and drop, or its picture's, would take a mouse drag that starts on it,
  // which then never scrolls the carousel (2026-11-16).
  it('leaves a mouse drag that starts on a link or its picture to the carousel', () => {
    render(
      <Carousel aria-label="Recipes" itemHref={(index) => `/recipes/${index}`}>
        {['Soup', 'Salad'].map((name) => (
          <img key={name} alt={name} src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
        ))}
      </Carousel>,
    );
    expect(screen.getByRole('link', { name: 'Soup' })).toHaveAttribute('draggable', 'false');
    const picture = screen.getByRole('img', { name: 'Soup' });
    // Without a mouse drag under way, a picture's drag and drop is left alone.
    expect(fireEvent.dragStart(picture)).toBe(true);
    fireEvent.pointerDown(picture, { pointerType: 'mouse', button: 0, pointerId: 1 });
    expect(fireEvent.dragStart(picture)).toBe(false);
    fireEvent.pointerUp(picture, { pointerType: 'mouse', button: 0, pointerId: 1 });
  });

  // A disabled link kept its address, so a middle click or "Open in new tab" still went there
  // (2026-11-16). As ButtonBase's disabled link: no address, still named and a tab stop.
  it('gives a disabled link item no address', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <Carousel
          aria-label="Recipes"
          itemHref={(index) => `/recipes/${index}`}
          disabledIndexes={[1]}
        >
          {slides(3)}
        </Carousel>
      </RouterProvider>,
    );
    const link = screen.getByRole('link', { name: 'Slide 1' });
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link.tabIndex).toBe(0);
    await userEvent.click(screen.getByText('Slide 1'));
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Slide 0' })).toHaveAttribute('href', '/recipes/0');
  });

  // The pointer cursor said every item could be pressed, even one without an address in a
  // carousel without `onAction` (2026-11-16).
  it('shows the pointer cursor only on items that are links or act', () => {
    render(
      <Carousel
        aria-label="Recipes"
        itemHref={(index) => (index === 1 ? undefined : `/recipes/${index}`)}
      >
        {slides(3)}
      </Carousel>,
    );
    const groups = screen.getAllByRole('group');
    expect(groups[0]).toHaveClass('cursor-pointer');
    expect(groups[1]).not.toHaveClass('cursor-pointer');
    expect(groups[2]).toHaveClass('cursor-pointer');
  });

  // The keys looked for the focused element among the slots, but a link item's tab stop is
  // its link, so the arrows, Home, End and the leave keys did nothing on one (2026-11-16).
  it('moves between link items with the arrow keys, Home and End, and leaves with Up and Down', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Carousel aria-label="Recipes" itemHref={(index) => `/recipes/${index}`}>
          {slides(3)}
        </Carousel>
        <button type="button">Show all</button>
      </>,
    );
    const link = (index: number) => screen.getByRole('link', { name: `Slide ${index}` });
    await user.tab();
    await user.tab();
    expect(link(0)).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(link(1)).toHaveFocus();
    await user.keyboard('{End}');
    expect(link(2)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(link(0)).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    act(() => link(1).focus());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Show all' })).toHaveFocus();
  });

  it('moves between link items and plain items in one carousel', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    Element.prototype.scrollTo = scrollTo;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    render(
      <Carousel
        aria-label="Recipes"
        itemHref={(index) => (index % 2 === 1 ? undefined : `/recipes/${index}`)}
      >
        {slides(4)}
      </Carousel>,
    );
    const groups = screen.getAllByRole('group');
    const link = (index: number) => screen.getByRole('link', { name: `Slide ${index}` });
    act(() => link(0).focus());
    await user.keyboard('{ArrowRight}');
    expect(groups[1]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(link(2)).toHaveFocus();
    // The link took focus, not the slot behind it, and the carousel brought it into view.
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    await user.keyboard('{ArrowLeft}');
    expect(groups[1]).toHaveFocus();
    await user.keyboard('{End}');
    expect(groups[3]).toHaveFocus();
  });

  // A link item's slot never saw its own focus (the link took it), so Tab to a link item that
  // was small or off screen never brought it into view (2026-11-16).
  it('brings a link item into view when Tab reaches it', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    Element.prototype.scrollTo = scrollTo;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    render(
      <Carousel aria-label="Recipes" itemHref={(index) => `/recipes/${index}`}>
        {slides(6)}
      </Carousel>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Slide 1' })).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo.mock.calls[1]![0].left).toBeGreaterThan(0);
  });

  // A press set the flag that keeps a press's focus from moving the carousel, and only a key
  // inside the carousel cleared it, so after a press and a press elsewhere, Tab back in left the
  // item out of view (2026-11-16).
  it('brings an item into view when Tab comes back after a press elsewhere', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    Element.prototype.scrollTo = scrollTo;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    render(
      <>
        <Carousel aria-label="Recipes" itemHref={(index) => `/recipes/${index}`}>
          {slides(6)}
        </Carousel>
        <button type="button">After</button>
      </>,
    );
    await user.click(screen.getByRole('link', { name: 'Slide 3' }));
    await user.click(screen.getByRole('button', { name: 'After' }));
    scrollTo.mockClear();
    await user.tab({ shift: true });
    expect(screen.getByRole('link', { name: 'Slide 5' })).toHaveFocus();
    expect(scrollTo).toHaveBeenCalled();
  });

  // The drag flag stayed set until the next press, so Enter on a link after a mouse drag
  // across the carousel opened nothing (2026-11-16).
  it('follows a link with Enter after a mouse drag across the carousel', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <Carousel aria-label="Recipes" itemHref={(index) => `/recipes/${index}`}>
          {slides(3)}
        </Carousel>
      </RouterProvider>,
    );
    const link = screen.getByRole('link', { name: 'Slide 1' });
    const dragAcross = () =>
      user.pointer([
        { keys: '[MouseLeft>]', target: link, coords: { clientX: 100, clientY: 10 } },
        { target: link, coords: { clientX: 60, clientY: 10 } },
        { keys: '[/MouseLeft]', target: link, coords: { clientX: 60, clientY: 10 } },
      ]);
    await dragAcross();
    expect(navigate).not.toHaveBeenCalled();
    act(() => link.focus());
    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledWith('/recipes/1', undefined);
    // A click from assistive technology, with no key pressed (`detail` 0).
    await dragAcross();
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledTimes(2);
    // A key press clears the drag, even where the browser counts Enter's click as one click.
    await dragAcross();
    fireEvent.keyDown(link, { key: 'Enter' });
    fireEvent.click(link, { detail: 1 });
    fireEvent.keyUp(link, { key: 'Enter' });
    expect(navigate).toHaveBeenCalledTimes(3);
  });
});

describe('Carousel item sizes', () => {
  it('marks each item large, medium or small with its openness, and reports the focal item', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(412);
    const onFocalChange = vi.fn();
    render(
      <Carousel aria-label="Photos" onFocalChange={onFocalChange}>
        {slides(6)}
      </Carousel>,
    );
    const items = screen.getAllByRole('group');
    expect(items[0]).toHaveAttribute('data-size', 'large');
    expect(items[0]!.style.getPropertyValue('--m3-carousel-item-openness')).toBe('1');
    const last = items.at(-1)!;
    expect(last).toHaveAttribute('data-size', 'small');
    expect(last.style.getPropertyValue('--m3-carousel-item-openness')).toBe('0');
    // Scrolled by two items, another item is large; once scrolling settles, it is reported.
    const scroller = items[0]!.parentElement!;
    Object.defineProperty(scroller, 'scrollLeft', { value: 372, configurable: true });
    fireEvent.scroll(scroller);
    await vi.waitFor(() => expect(onFocalChange).toHaveBeenCalledOnce());
    const focal = onFocalChange.mock.calls[0]![0] as number;
    expect(focal).toBeGreaterThan(0);
    expect(items[focal]).toHaveAttribute('data-size', 'large');
  });

  it('keeps every item large under reduced motion', () => {
    reducedMotion.value = true;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(412);
    render(<Carousel aria-label="Photos">{slides(4)}</Carousel>);
    for (const item of screen.getAllByRole('group')) {
      expect(item).toHaveAttribute('data-size', 'large');
    }
  });

  // Every render restarted the 150ms wait, so a parent re-rendering faster than that (a clock,
  // a progress bar) kept the focal item from ever being reported (2026-11-16).
  it('reports the focal item while the parent re-renders faster than scrolling settles', () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(412);
    const onFocalChange = vi.fn();
    const carousel = (tick: number) => (
      <Carousel aria-label="Photos" onFocalChange={onFocalChange} data-tick={tick}>
        {slides(6)}
      </Carousel>
    );
    const { rerender } = render(carousel(0));
    const scroller = screen.getAllByRole('group')[0]!.parentElement!;
    Object.defineProperty(scroller, 'scrollLeft', { value: 372, configurable: true });
    fireEvent.scroll(scroller);
    act(() => vi.advanceTimersByTime(16));
    for (let tick = 1; tick <= 10; tick++) {
      rerender(carousel(tick));
      act(() => vi.advanceTimersByTime(50));
    }
    expect(onFocalChange).toHaveBeenCalledOnce();
  });

  // Each scroll frame rewrote every item's size and openness, changed or not (2026-11-16).
  it('writes each item size and openness only when they change', () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(412);
    render(<Carousel aria-label="Photos">{slides(6)}</Carousel>);
    const items = screen.getAllByRole('group');
    const observer = new MutationObserver(() => {});
    for (const item of items) {
      observer.observe(item, { attributes: true, attributeFilter: ['data-size'] });
    }
    const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty');
    // A scroll frame at the same place.
    fireEvent.scroll(items[0]!.parentElement!);
    act(() => vi.advanceTimersByTime(16));
    expect(observer.takeRecords()).toEqual([]);
    expect(
      setProperty.mock.calls.filter(([name]) => name === '--m3-carousel-item-openness'),
    ).toEqual([]);
    // A scroll that changes them still writes them.
    Object.defineProperty(items[0]!.parentElement!, 'scrollLeft', {
      value: 372,
      configurable: true,
    });
    fireEvent.scroll(items[0]!.parentElement!);
    act(() => vi.advanceTimersByTime(16));
    expect(observer.takeRecords().length).toBeGreaterThan(0);
    observer.disconnect();
  });
});
