import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Button } from '../button/Button';
import { BottomSheet } from './BottomSheet';
import { SheetTrigger } from './SheetTrigger';
import { SideSheet } from './SideSheet';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Ends the exit transition (jsdom fires no transition events). */
function finishExit() {
  const motion = document.querySelector('[data-exiting][data-dragging], [data-exiting]');
  if (motion) {
    const event = new Event('transitionend', { bubbles: true }) as TransitionEvent;
    Object.defineProperty(event, 'propertyName', { value: 'translate' });
    act(() => {
      document.querySelectorAll('[data-exiting]').forEach((el) => el.dispatchEvent(event));
    });
  }
}

describe('BottomSheet', () => {
  it('opens from a trigger as a named modal dialog with a drag handle', async () => {
    const { baseElement } = render(
      <SheetTrigger>
        <Button>Share</Button>
        <BottomSheet
          aria-label="Share options"
          className="custom"
          style={{ outline: '1px solid' }}
          classNames={{ panel: 'panel-x' }}
        >
          <p>Contents</p>
        </BottomSheet>
      </SheetTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    const dialog = screen.getByRole('dialog', { name: 'Share options' });
    // `className` and `style` go on the outermost container, around the layer that moves.
    const container = dialog.parentElement!.parentElement!;
    expect(container).toHaveClass('custom', 'fixed', 'bottom-0', 'items-end');
    expect(container).toHaveStyle({ outline: '1px solid' });
    expect(dialog.parentElement).not.toHaveClass('custom');
    expect(dialog.parentElement!.className).toContain('translate-y-(--m3-sheet-offset)');
    expect(container.className).not.toContain('translate');
    expect(dialog).not.toHaveClass('custom');
    expect(dialog).not.toHaveStyle({ outline: '1px solid' });
    expect(dialog).toHaveClass(
      'panel-x',
      'rounded-t-[var(--_md-comp-sheet-bottom-docked-container-shape)]',
      'bg-[var(--_md-comp-sheet-bottom-docked-container-color)]',
    );
    expect(dialog).toHaveClass(
      'shadow-[shadow:var(--_md-comp-sheet-bottom-docked-container-elevation)]',
      'max-h-[calc(100dvh-72px)]',
    );
    expect(dialog).toHaveAttribute('data-tokens', 'md-comp-sheet-bottom-docked');
    expect(dialog).toHaveAttribute('data-variant', 'modal');
    expect(container).toHaveClass(
      'max-w-[640px]',
      'bottom-0',
      'min-[641px]:max-w-[min(640px,calc(100%-112px))]',
      'min-[641px]:max-h-[calc(100dvh-56px)]',
    );
    const handle = screen.getByRole('button', { name: 'Close sheet' });
    // Initial focus is the first interactive element (the handle), as in a Dialog.
    expect(handle).toHaveFocus();
    expect(handle.firstElementChild).toHaveClass(
      'h-[4px]',
      'w-[32px]',
      'bg-[var(--_md-comp-sheet-bottom-docked-drag-handle-color)]',
    );
    expect(handle).toHaveClass('pt-[22px]', 'pb-[22px]');
    expect(await axeViolations(baseElement)).toEqual([]);
    // Pressing the handle of a fully open sheet closes it.
    await userEvent.click(handle);
    expect(dialog).toHaveAttribute('data-exiting');
    finishExit();
    expect(screen.queryByRole('dialog')).toBe(null);
  });

  it('opens a tall sheet halfway; the handle expands it and one Escape closes it', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(700);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onOpenChange = vi.fn();
    render(
      <BottomSheet aria-label="Details" defaultOpen onOpenChange={onOpenChange}>
        Tall content
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-detent', 'partial');
    // Half the window shows: offset = 700 − 400.
    expect(dialog.parentElement!.style.getPropertyValue('--m3-sheet-offset')).toBe('300px');
    await userEvent.click(screen.getByRole('button', { name: 'Expand sheet' }));
    expect(dialog).toHaveAttribute('data-detent', 'expanded');
    expect(dialog.parentElement!.style.getPropertyValue('--m3-sheet-offset')).toBe('0px');
    // Escape is a close request: a fully open modal sheet closes in one press (APG modal dialog).
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('with closedBy="none", Escape and a drag down leave a modal sheet open', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onOpenChange = vi.fn();
    render(
      <BottomSheet aria-label="Details" closedBy="none" defaultOpen onOpenChange={onOpenChange}>
        Short content
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    const handle = screen.getByRole('button', { name: 'Close sheet' });
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientY: 500 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 780 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 780 });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes when dragged down past the threshold', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onOpenChange = vi.fn();
    render(
      <BottomSheet aria-label="Details" defaultOpen onOpenChange={onOpenChange}>
        Content
      </BottomSheet>,
    );
    const handle = screen.getByRole('button', { name: 'Close sheet' });
    fireEvent.pointerDown(handle, { button: 0, clientY: 500, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 540, pointerId: 1 });
    expect(handle).toHaveAttribute('data-dragging', 'true');
    fireEvent.pointerMove(handle, { clientY: 600, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 600, pointerId: 1 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('leaves from where a drag let it go, and springs back when the app keeps it open', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const motionOf = () => screen.getByRole('dialog').parentElement!;
    const dragClosed = () => {
      const handle = screen.getByRole('button', { name: 'Close sheet' });
      fireEvent.pointerDown(handle, { button: 0, clientY: 500, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientY: 540, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientY: 620, pointerId: 1 });
      fireEvent.pointerUp(handle, { clientY: 620, pointerId: 1 });
    };
    // Closed: the exit keeps the release offset (under reduced motion it fades there) and
    // is no longer a drag, so its transition runs.
    const { unmount } = render(
      <BottomSheet aria-label="Details" defaultOpen>
        Content
      </BottomSheet>,
    );
    dragClosed();
    expect(motionOf()).toHaveAttribute('data-exiting');
    expect(motionOf()).not.toHaveAttribute('data-dragging');
    expect(motionOf().style.getPropertyValue('--m3-sheet-offset')).toBe('120px');
    unmount();
    // Refused: a controlled `open` left `true` returns the sheet to rest.
    const onOpenChange = vi.fn();
    render(
      <BottomSheet aria-label="Details" open onOpenChange={onOpenChange}>
        Content
      </BottomSheet>,
    );
    dragClosed();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(motionOf()).not.toHaveAttribute('data-exiting');
    expect(motionOf()).not.toHaveAttribute('data-dragging');
    expect(motionOf().style.getPropertyValue('--m3-sheet-offset')).toBe('0px');
  });

  it('with swipeable={false}, dragging does nothing and the handle stays a button', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onOpenChange = vi.fn();
    render(
      <BottomSheet aria-label="Details" swipeable={false} defaultOpen onOpenChange={onOpenChange}>
        <p>Content</p>
      </BottomSheet>,
    );
    const handle = screen.getByRole('button', { name: 'Close sheet' });
    expect(handle).not.toHaveClass('touch-none');
    fireEvent.pointerDown(handle, { button: 0, clientY: 500, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 600, pointerId: 1 });
    expect(handle).not.toHaveAttribute('data-dragging');
    const content = screen.getByText('Content');
    fireEvent.pointerDown(content, { button: 0, pointerType: 'touch', clientY: 500, pointerId: 2 });
    fireEvent.pointerMove(content, { pointerType: 'touch', clientY: 700, pointerId: 2 });
    fireEvent.pointerUp(content, { pointerType: 'touch', clientY: 700, pointerId: 2 });
    expect(onOpenChange).not.toHaveBeenCalled();
    // A press on the handle still works (it closes a fully open modal sheet).
    fireEvent.pointerDown(handle, { button: 0, clientY: 500, pointerId: 3 });
    fireEvent.pointerUp(handle, { clientY: 500, pointerId: 3 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('passes a close function to render-prop children', async () => {
    render(
      <BottomSheet aria-label="Pick" defaultOpen dragHandle={false}>
        {({ close }) => <Button onPress={close}>Done</Button>}
      </BottomSheet>,
    );
    expect(screen.queryByRole('button', { name: 'Close sheet' })).toBe(null);
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-exiting');
  });

  it('drags from the top 48px of a sheet without a handle', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onOpenChange = vi.fn();
    render(
      <BottomSheet aria-label="Details" defaultOpen dragHandle={false} onOpenChange={onOpenChange}>
        Content
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ top: 500 } as DOMRect);
    // A drag starting below the zone does nothing.
    fireEvent.pointerDown(dialog, { button: 0, clientY: 600, pointerId: 1 });
    fireEvent.pointerMove(dialog, { clientY: 700, pointerId: 1 });
    expect(dialog).not.toHaveAttribute('data-dragging');
    fireEvent.pointerUp(dialog, { clientY: 700, pointerId: 1 });
    fireEvent.pointerDown(dialog, { button: 0, clientY: 520, pointerId: 2 });
    fireEvent.pointerMove(dialog, { clientY: 560, pointerId: 2 });
    expect(dialog).toHaveAttribute('data-dragging', 'true');
    fireEvent.pointerMove(dialog, { clientY: 640, pointerId: 2 });
    fireEvent.pointerUp(dialog, { clientY: 640, pointerId: 2 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows a close button once a modal sheet fills the window', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(728);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(412);
    const onOpenChange = vi.fn();
    render(
      <BottomSheet
        aria-label="Details"
        defaultOpen
        onOpenChange={onOpenChange}
        labels={{ expand: 'Agrandir', close: 'Fermer' }}
      >
        Tall content
      </BottomSheet>,
    );
    // Half open: no close button yet.
    expect(screen.queryByRole('button', { name: 'Fermer' })).toBe(null);
    await userEvent.click(screen.getByRole('button', { name: 'Agrandir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('a standard sheet sits over the page without a scrim, collapsed to its peek height', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const { container } = render(
      <>
        <Button>Page action</Button>
        <BottomSheet variant="standard" aria-label="Now playing" peekHeight={80}>
          Player
        </BottomSheet>
      </>,
    );
    const sheet = screen.getByRole('dialog', { name: 'Now playing' });
    // Rendered in place, not portalled, with no scrim and no aria-modal.
    expect(container).toContainElement(sheet);
    expect(sheet).not.toHaveAttribute('aria-modal');
    expect(document.querySelector('.bg-scrim\\/32')).toBe(null);
    expect(sheet.parentElement!.parentElement).toHaveClass('z-(--md-sys-z-sticky)');
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    expect(sheet.parentElement!.style.getPropertyValue('--m3-sheet-offset')).toBe('320px');
    // The page stays usable: focus is not moved into the sheet.
    expect(document.activeElement).toBe(document.body);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Expand sheet' }));
    expect(sheet).toHaveAttribute('data-detent', 'expanded');
    expect(sheet.parentElement!.style.getPropertyValue('--m3-sheet-offset')).toBe('0px');
    // Escape and the handle collapse it again; it never closes by itself.
    fireEvent.keyDown(sheet, { key: 'Escape' });
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    await userEvent.click(screen.getByRole('button', { name: 'Expand sheet' }));
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sheet' }));
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    expect(screen.getByRole('dialog')).toBe(sheet);
  });

  it('a standard sheet can open expanded and collapse to its peek, reporting each change', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onDetentChange = vi.fn();
    const { container } = render(
      <BottomSheet
        variant="standard"
        aria-label="Directions"
        defaultDetent="expanded"
        onDetentChange={onDetentChange}
      >
        Route
      </BottomSheet>,
    );
    const sheet = screen.getByRole('dialog', { name: 'Directions' });
    expect(sheet).toHaveAttribute('data-detent', 'expanded');
    expect(sheet.parentElement!.style.getPropertyValue('--m3-sheet-offset')).toBe('0px');
    expect(await axeViolations(container)).toEqual([]);
    // The handle collapses it to the 56px peek.
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sheet' }));
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    expect(sheet.parentElement!.style.getPropertyValue('--m3-sheet-offset')).toBe('344px');
    expect(onDetentChange).toHaveBeenLastCalledWith('collapsed');
    // Enter on the handle expands it; Escape collapses it.
    screen.getByRole('button', { name: 'Expand sheet' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(sheet).toHaveAttribute('data-detent', 'expanded');
    expect(onDetentChange).toHaveBeenLastCalledWith('expanded');
    fireEvent.keyDown(sheet, { key: 'Escape' });
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    expect(onDetentChange).toHaveBeenCalledTimes(3);
    // Escape on a collapsed sheet changes nothing, so it reports nothing.
    fireEvent.keyDown(sheet, { key: 'Escape' });
    expect(onDetentChange).toHaveBeenCalledTimes(3);
  });

  it('a controlled standard sheet follows `detent`, its handle only reporting the change', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onDetentChange = vi.fn();
    const { rerender } = render(
      <BottomSheet
        variant="standard"
        aria-label="Directions"
        detent="collapsed"
        onDetentChange={onDetentChange}
      >
        Route
      </BottomSheet>,
    );
    const sheet = screen.getByRole('dialog', { name: 'Directions' });
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    await userEvent.click(screen.getByRole('button', { name: 'Expand sheet' }));
    expect(onDetentChange).toHaveBeenCalledWith('expanded');
    // Not changed until the app passes the new detent.
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    rerender(
      <BottomSheet
        variant="standard"
        aria-label="Directions"
        detent="expanded"
        onDetentChange={onDetentChange}
      >
        Route
      </BottomSheet>,
    );
    expect(sheet).toHaveAttribute('data-detent', 'expanded');
    expect(sheet.parentElement!.style.getPropertyValue('--m3-sheet-offset')).toBe('0px');
    expect(onDetentChange).toHaveBeenCalledTimes(1);
  });

  it('a standard sheet no taller than its peek is always expanded and reports no change', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onDetentChange = vi.fn();
    render(
      <BottomSheet
        variant="standard"
        aria-label="Status"
        detent="collapsed"
        onDetentChange={onDetentChange}
      >
        Saved
      </BottomSheet>,
    );
    const sheet = screen.getByRole('dialog', { name: 'Status' });
    expect(sheet).toHaveAttribute('data-detent', 'expanded');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sheet' }));
    expect(onDetentChange).not.toHaveBeenCalled();
  });

  it('a modal sheet ignores the standard detent props', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(600);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const onDetentChange = vi.fn();
    render(
      <BottomSheet aria-label="Share" defaultOpen detent="expanded" onDetentChange={onDetentChange}>
        Options
      </BottomSheet>,
    );
    const sheet = screen.getByRole('dialog', { name: 'Share' });
    expect(sheet).toHaveAttribute('data-detent', 'partial');
    await userEvent.click(screen.getByRole('button', { name: 'Expand sheet' }));
    expect(sheet).toHaveAttribute('data-detent', 'expanded');
    expect(onDetentChange).not.toHaveBeenCalled();
  });

  it('makes what lies below a collapsed standard sheet’s peek inert', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    // Layout: the panel's top at 0, a 72px summary row, then the track list below it.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      const bottom = this.id === 'summary' ? 120 : this.id === 'tracks' ? 400 : 0;
      return { top: 0, bottom } as DOMRect;
    });
    render(
      <BottomSheet variant="standard" aria-label="Now playing" peekHeight={120}>
        <div id="summary">
          <Button>Pause</Button>
        </div>
        <div id="tracks">
          <Button>Next track</Button>
        </div>
      </BottomSheet>,
    );
    const sheet = screen.getByRole('dialog');
    expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    // The summary fits in the peek; the track list doesn't.
    expect(document.getElementById('summary')).not.toHaveAttribute('inert');
    expect(document.getElementById('tracks')).toHaveAttribute('inert');
    await userEvent.click(screen.getByRole('button', { name: 'Expand sheet' }));
    expect(document.getElementById('tracks')).not.toHaveAttribute('inert');
    // Collapsing with focus in the hidden part hands focus to the handle.
    act(() => screen.getByRole('button', { name: 'Next track' }).focus());
    fireEvent.keyDown(sheet, { key: 'Escape' });
    expect(document.getElementById('tracks')).toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Expand sheet' })).toHaveFocus();
  });
});

describe('SideSheet', () => {
  it('opens a modal sheet named by its title with header actions', async () => {
    const { baseElement } = render(
      <SheetTrigger>
        <Button>Filters</Button>
        <SideSheet
          title="Filters"
          footer={({ close }) => <Button onPress={close}>Apply</Button>}
          footerDivider
        >
          Options
        </SideSheet>
      </SheetTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveClass(
      'w-[256px]',
      'bg-[var(--_md-comp-sheet-side-container-color)]',
      'shadow-[shadow:var(--_md-comp-sheet-side-container-elevation)]',
      'rounded-s-[var(--_md-comp-sheet-side-container-shape)]',
    );
    expect(dialog).toHaveAttribute('data-tokens', 'md-comp-sheet-side');
    expect(dialog).toHaveAttribute('data-variant', 'modal');
    expect(screen.getByRole('heading', { name: 'Filters' })).toHaveClass('text-title-large');
    const footer = screen.getByRole('button', { name: 'Apply' }).parentElement!;
    expect(footer).toHaveClass(
      'min-h-[72px]',
      'pt-[16px]',
      'pb-[24px]',
      'justify-start',
      'border-t',
      'border-outline-variant',
    );
    // M3: focus lands on the first (non-disabled) icon button, not the panel.
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(await axeViolations(baseElement)).toEqual([]);
    // M3 requires a close button in every side sheet; it is built in.
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog).toHaveAttribute('data-exiting');
  });

  it('shows a back button with a 16px header inset, and localises its words', async () => {
    const onBack = vi.fn();
    const { baseElement } = render(
      <SideSheet
        title="Sort"
        defaultOpen
        onBack={onBack}
        labels={{ close: 'Fermer', back: 'Retour' }}
        actions={<Button variant="text">Reset</Button>}
      >
        Options
      </SideSheet>,
    );
    const back = screen.getByRole('button', { name: 'Retour' });
    expect(back.closest('.min-h-\\[72px\\]')).toHaveClass('ps-[16px]');
    const close = screen.getByRole('button', { name: 'Fermer' });
    // Header actions come before the close button, at the end of the header.
    expect(close.parentElement).toHaveClass('ms-auto');
    expect(close.parentElement!.firstElementChild).toBe(
      screen.getByRole('button', { name: 'Reset' }),
    );
    await userEvent.click(back);
    expect(onBack).toHaveBeenCalledOnce();
    expect(await axeViolations(baseElement)).toEqual([]);
  });

  it('detaches with corners all round', () => {
    render(
      <SideSheet title="Info" detached defaultOpen>
        Info
      </SideSheet>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('rounded-[var(--_md-comp-sheet-side-container-shape)]');
    expect(dialog).toHaveAttribute('data-detached', 'true');
    expect(dialog.parentElement).toHaveClass('pt-[16px]', 'pe-[16px]');
  });

  it('returns focus to where it came from when its close button closes it', async () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Show details
          </button>
          <SideSheet variant="standard" title="Details" open={open} onOpenChange={setOpen}>
            Body
          </SideSheet>
          <button type="button">After</button>
        </>
      );
    }
    render(<Demo />);
    const show = screen.getByRole('button', { name: 'Show details' });
    show.focus();
    await userEvent.tab();
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(show).toHaveFocus();
  });

  it('moves focus to the control before it when closed without a focus origin', async () => {
    render(
      <>
        <button type="button">Before</button>
        <SideSheet variant="standard" title="Details" defaultOpen>
          Body
        </SideSheet>
      </>,
    );
    const close = screen.getByRole('button', { name: 'Close' });
    close.focus();
    fireEvent.click(close);
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
  });

  it('renders a standard sheet in the layout that opens and closes its width', async () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen((v) => !v)}>
            Toggle
          </button>
          <SideSheet
            variant="standard"
            title="Details"
            open={open}
            onOpenChange={setOpen}
            data-testid="sheet"
          >
            Body
          </SideSheet>
        </>
      );
    }
    const { container } = render(<Demo />);
    const sheet = screen.getByTestId('sheet');
    // Its width (a measured length) opens and closes, so the panel stays on its edge.
    expect(sheet).toHaveClass('w-[var(--m3-side-sheet-width,auto)]', 'data-closed:w-0');
    expect(sheet.style.getPropertyValue('--m3-side-sheet-width')).toBe('0px');
    // A non-modal dialog: named, not aria-modal, focus left where it was.
    expect(sheet).toHaveAttribute('role', 'dialog');
    expect(sheet).not.toHaveAttribute('aria-modal');
    expect(sheet).toHaveAccessibleName('Details');
    expect(sheet).toHaveAttribute('data-tokens', 'md-comp-sheet-side');
    expect(sheet).toHaveAttribute('data-variant', 'standard');
    const panel = screen.getByText('Body').closest('[data-slot="panel"]');
    expect(panel).toHaveClass(
      'bg-[var(--_md-comp-sheet-side-container-color)]',
      'border-s',
      'border-outline-variant',
    );
    expect(await axeViolations(container)).toEqual([]);
    // Its close button reports onOpenChange(false).
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(sheet).toHaveAttribute('data-closed', 'true');
    expect(sheet).toHaveAttribute('inert');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(sheet).not.toHaveAttribute('data-closed');
  });

  it('restyles each part through classNames', () => {
    render(
      <>
        <SideSheet
          variant="standard"
          title="Details"
          onBack={() => undefined}
          footer={<Button>Save</Button>}
          classNames={{
            back: 'back-x',
            close: 'close-x',
            headerActions: 'actions-x',
            footer: 'footer-x',
            panel: 'panel-x',
          }}
        >
          Body
        </SideSheet>
        <BottomSheet
          variant="standard"
          aria-label="Player"
          classNames={{ container: 'absolute', handleBar: 'bar-x' }}
        >
          Player
        </BottomSheet>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Back' })).toHaveClass('back-x');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('close-x');
    expect(screen.getByRole('button', { name: 'Close' }).parentElement).toHaveClass('actions-x');
    expect(screen.getByRole('button', { name: 'Save' }).parentElement).toHaveClass('footer-x');
    // A standard side sheet's panel slot is on its surface; its layout box keeps `className`.
    const panel = screen.getByText('Body').closest('[data-slot="panel"]')!;
    expect(panel).toHaveClass('panel-x');
    expect(screen.getByRole('dialog', { name: 'Details' })).not.toHaveClass('panel-x');
    expect(document.querySelector('[data-slot="drag-handle"]')).toHaveClass('bar-x');
    // A consumer position replaces the default `fixed` (e.g. inside a bounded region).
    const container = screen.getByRole('dialog', { name: 'Player' }).parentElement!.parentElement!;
    expect(container).toHaveClass('absolute');
    expect(container).not.toHaveClass('fixed');
  });

  it('detaches a standard sheet and can drop its divider', () => {
    const { rerender } = render(
      <SideSheet variant="standard" aria-label="Details" detached>
        Body
      </SideSheet>,
    );
    const panel = screen.getByText('Body').closest('[data-slot="panel"]')!;
    expect(panel).toHaveClass('rounded-[var(--_md-comp-sheet-side-container-shape)]');
    expect(panel).not.toHaveClass('border-s');
    expect(panel.parentElement).toHaveClass('pt-[16px]', 'ps-[16px]', 'pe-[16px]', 'pb-[16px]');
    rerender(
      <SideSheet variant="standard" aria-label="Details" divider={false}>
        Body
      </SideSheet>,
    );
    expect(screen.getByText('Body').closest('[data-slot="panel"]')).not.toHaveClass('border-s');
  });
  it("lets consumer classes replace both sheets' token classes", () => {
    render(
      <>
        <BottomSheet
          aria-label="Bottom"
          defaultOpen
          classNames={{ panel: 'bg-surface-container rounded-t-corner-large shadow-elevation-3' }}
        >
          Bottom
        </BottomSheet>
        <SideSheet
          title="Side"
          defaultOpen
          classNames={{ panel: 'bg-surface-container rounded-s-corner-small' }}
        >
          Side
        </SideSheet>
      </>,
    );
    const bottom = screen.getByText('Bottom').closest('[data-tokens]')!;
    expect(bottom).toHaveClass(
      'bg-surface-container',
      'rounded-t-corner-large',
      'shadow-elevation-3',
    );
    expect(bottom).not.toHaveClass(
      'bg-[var(--_md-comp-sheet-bottom-docked-container-color)]',
      'rounded-t-[var(--_md-comp-sheet-bottom-docked-container-shape)]',
      'shadow-[shadow:var(--_md-comp-sheet-bottom-docked-container-elevation)]',
    );
    const side = screen.getByText('Side', { selector: 'div' }).closest('[data-tokens]')!;
    expect(side).toHaveClass('bg-surface-container', 'rounded-s-corner-small');
    expect(side).not.toHaveClass(
      'bg-[var(--_md-comp-sheet-side-container-color)]',
      'rounded-s-[var(--_md-comp-sheet-side-container-shape)]',
    );
  });

  it("puts a modal side sheet's className and style on its outermost element", () => {
    render(
      <SideSheet title="Filters" defaultOpen className="absolute" style={{ outline: '1px solid' }}>
        Filters
      </SideSheet>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    const container = dialog.parentElement!.parentElement!;
    expect(container).toHaveClass('absolute', 'end-0', 'inset-y-0');
    expect(container).not.toHaveClass('fixed');
    expect(container).toHaveStyle({ outline: '1px solid' });
    expect(container.className).not.toContain('translate');
    // The layer inside moves the sheet.
    expect(dialog.parentElement!.className).toContain('starting:translate-x-full');
    expect(dialog).not.toHaveClass('absolute');
    expect(dialog).not.toHaveStyle({ outline: '1px solid' });
  });

  it('puts classNames.container on the outermost element of both variants', () => {
    const { unmount } = render(
      <SideSheet title="Filters" defaultOpen classNames={{ container: 'container-x' }}>
        Filters
      </SideSheet>,
    );
    const modal = screen.getByRole('dialog', { name: 'Filters' });
    expect(modal.parentElement!.parentElement).toHaveClass('container-x', 'fixed');
    expect(modal).not.toHaveClass('container-x');
    unmount();
    render(
      <SideSheet
        variant="standard"
        aria-label="Details"
        className="h-full"
        classNames={{ container: 'container-y' }}
      >
        Details
      </SideSheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveClass('container-y', 'h-full');
  });

  describe('edge and swipe to dismiss', () => {
    /** A touch swipe on `target` through `xs` (clientX), at a steady y. */
    function swipe(target: Element, xs: number[], pointerType = 'touch') {
      const init = { pointerId: 7, pointerType, button: 0, clientY: 300 };
      fireEvent.pointerDown(target, { ...init, clientX: xs[0] });
      for (const x of xs.slice(1, -1)) fireEvent.pointerMove(target, { ...init, clientX: x });
      fireEvent.pointerUp(target, { ...init, clientX: xs.at(-1) });
    }
    const offset = (dialog: HTMLElement) =>
      dialog.parentElement!.style.getPropertyValue('--m3-side-sheet-offset');

    it('puts a start-edge sheet on the start edge, corners and border on its free edge', async () => {
      const { baseElement, unmount } = render(
        <SideSheet title="Filters" edge="start" defaultOpen>
          Options
        </SideSheet>,
      );
      const dialog = screen.getByRole('dialog', { name: 'Filters' });
      expect(dialog).toHaveAttribute('data-edge', 'start');
      expect(dialog).toHaveClass(
        'rounded-e-[var(--_md-comp-sheet-side-container-shape)]',
        'after:end-full',
        'forced-colors:border-e',
      );
      expect(dialog).not.toHaveClass('rounded-s-[var(--_md-comp-sheet-side-container-shape)]');
      const container = dialog.parentElement!.parentElement!;
      expect(container).toHaveClass('start-0');
      expect(container).not.toHaveClass('end-0');
      expect(dialog.parentElement!.className).toContain('motion-safe:starting:-translate-x-full');
      expect(dialog.parentElement!.className).toContain(
        'motion-safe:rtl:data-exiting:translate-x-[112%]',
      );
      expect(await axeViolations(baseElement)).toEqual([]);
      unmount();
      render(
        <SideSheet title="Info" edge="start" detached defaultOpen>
          Info
        </SideSheet>,
      );
      expect(screen.getByRole('dialog').parentElement).toHaveClass('ps-[16px]');
    });

    it('puts a standard sheet’s divider on its content side for each edge', () => {
      const { rerender } = render(
        <SideSheet variant="standard" aria-label="Details" edge="start" swipeable>
          Body
        </SideSheet>,
      );
      const root = screen.getByRole('dialog');
      expect(root).toHaveAttribute('data-edge', 'start');
      const panel = () => screen.getByText('Body').closest('[data-slot="panel"]')!;
      expect(panel()).toHaveClass('border-e');
      // The panel rides the root's inner edge, so the sheet slides in with its edge leading.
      expect(panel().parentElement!.parentElement).toHaveClass('justify-end');
      // A standard sheet sits in the layout: no swipe, no touch-action of its own.
      expect(panel().className).not.toContain('touch-action');
      rerender(
        <SideSheet variant="standard" aria-label="Details">
          Body
        </SideSheet>,
      );
      expect(panel()).toHaveClass('border-s');
      expect(panel().parentElement!.parentElement).toHaveClass('justify-start');
      expect(screen.getByRole('dialog')).toHaveAttribute('data-edge', 'end');
    });

    it('closes on a touch swipe past half its width toward its edge, in both edges and directions', () => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(256);
      const cases = [
        ['end', 'ltr', 1],
        ['end', 'rtl', -1],
        ['start', 'ltr', -1],
        ['start', 'rtl', 1],
      ] as const;
      for (const [edge, dir, sign] of cases) {
        const onOpenChange = vi.fn();
        const { unmount } = render(
          <div dir={dir}>
            <SideSheet title="Filters" edge={edge} defaultOpen onOpenChange={onOpenChange}>
              <p>Options</p>
            </SideSheet>
          </div>,
        );
        const dialog = screen.getByRole('dialog');
        vi.spyOn(window, 'getComputedStyle').mockImplementation(
          (el) =>
            ({
              direction: dir,
              touchAction: el === dialog ? 'pan-y pinch-zoom' : 'auto',
            }) as CSSStyleDeclaration,
        );
        const text = screen.getByText('Options');
        const start = 200;
        fireEvent.pointerDown(text, {
          pointerId: 7,
          pointerType: 'touch',
          button: 0,
          clientX: start,
          clientY: 300,
        });
        fireEvent.pointerMove(text, {
          pointerId: 7,
          pointerType: 'touch',
          clientX: start + sign * 60,
          clientY: 302,
        });
        expect(dialog).toHaveAttribute('data-dragging', 'true');
        expect(offset(dialog)).toBe(`${sign * 60}px`);
        fireEvent.pointerMove(dialog, {
          pointerId: 7,
          pointerType: 'touch',
          clientX: start + sign * 180,
          clientY: 302,
        });
        fireEvent.pointerUp(dialog, {
          pointerId: 7,
          pointerType: 'touch',
          clientX: start + sign * 180,
          clientY: 302,
        });
        expect(onOpenChange, `${edge} ${dir}`).toHaveBeenCalledWith(false);
        vi.mocked(window.getComputedStyle).mockRestore();
        unmount();
      }
    });

    it('springs back after a short swipe, and when a controlled sheet stays open', () => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(256);
      const onOpenChange = vi.fn();
      render(
        <SideSheet title="Edit details" open onOpenChange={onOpenChange}>
          <p>Fields</p>
        </SideSheet>,
      );
      const dialog = screen.getByRole('dialog');
      const text = screen.getByText('Fields');
      // Out 100px and back past where it started: it returns.
      swipe(text, [100, 200, 90]);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(dialog).not.toHaveAttribute('data-dragging');
      expect(offset(dialog)).toBe('0px');
      // Past half: it asks to close, the app keeps `open`, and the sheet returns.
      swipe(text, [100, 200, 300]);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(dialog).not.toHaveAttribute('data-exiting');
      expect(offset(dialog)).toBe('0px');
    });

    it('ignores mouse drags, vertical moves, moves away from the edge, and swipeable={false} or closedBy="none"', () => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(256);
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <SideSheet title="Filters" defaultOpen onOpenChange={onOpenChange}>
          <p>Options</p>
        </SideSheet>,
      );
      const text = screen.getByText('Options');
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('[touch-action:pan-y_pinch-zoom]');
      swipe(text, [100, 200, 300], 'mouse');
      swipe(text, [300, 200, 100]);
      fireEvent.pointerDown(text, {
        pointerId: 8,
        pointerType: 'touch',
        button: 0,
        clientX: 100,
        clientY: 100,
      });
      fireEvent.pointerMove(text, {
        pointerId: 8,
        pointerType: 'touch',
        clientX: 104,
        clientY: 160,
      });
      fireEvent.pointerMove(text, {
        pointerId: 8,
        pointerType: 'touch',
        clientX: 300,
        clientY: 170,
      });
      fireEvent.pointerUp(text, { pointerId: 8, pointerType: 'touch', clientX: 300, clientY: 170 });
      expect(onOpenChange).not.toHaveBeenCalled();
      for (const props of [{ swipeable: false }, { closedBy: 'none' as const }]) {
        rerender(
          <SideSheet title="Filters" defaultOpen onOpenChange={onOpenChange} {...props}>
            <p>Options</p>
          </SideSheet>,
        );
        expect(screen.getByRole('dialog')).not.toHaveClass('[touch-action:pan-y_pinch-zoom]');
        swipe(screen.getByText('Options'), [100, 200, 300]);
        expect(onOpenChange).not.toHaveBeenCalled();
      }
    });

    it('a swipe that starts on a button never presses it, and leaves fields alone', async () => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(256);
      const onPress = vi.fn();
      const onOpenChange = vi.fn();
      const { baseElement } = render(
        <SideSheet title="Filters" defaultOpen onOpenChange={onOpenChange}>
          <Button onPress={onPress}>Reset</Button>
          <input aria-label="Name" />
        </SideSheet>,
      );
      swipe(screen.getByRole('textbox', { name: 'Name' }), [100, 200, 300]);
      expect(onOpenChange).not.toHaveBeenCalled();
      swipe(screen.getByRole('button', { name: 'Reset' }), [100, 200, 300]);
      expect(onPress).not.toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(await axeViolations(baseElement)).toEqual([]);
    });
  });
});
