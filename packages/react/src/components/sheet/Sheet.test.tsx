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
        <BottomSheet aria-label="Share options" className="custom">
          <p>Contents</p>
        </BottomSheet>
      </SheetTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    const dialog = screen.getByRole('dialog', { name: 'Share options' });
    expect(dialog).toHaveClass(
      'custom',
      'rounded-t-corner-extra-large',
      'bg-surface-container-low',
    );
    expect(dialog.parentElement).toHaveClass('max-w-[640px]', 'bottom-0');
    const handle = screen.getByRole('button', { name: 'Close sheet' });
    expect(handle.firstElementChild).toHaveClass('h-[4px]', 'w-[32px]', 'bg-on-surface-variant');
    expect(handle).toHaveClass('pt-[22px]', 'pb-[22px]');
    expect(await axeViolations(baseElement)).toEqual([]);
    // Pressing the handle of a fully open sheet closes it.
    await userEvent.click(handle);
    expect(dialog).toHaveAttribute('data-exiting');
    finishExit();
    expect(screen.queryByRole('dialog')).toBe(null);
  });

  it('opens a tall sheet halfway; the handle expands it and Escape returns it to half', async () => {
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
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(dialog).toHaveAttribute('data-detent', 'partial');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
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
});

describe('SideSheet', () => {
  it('opens a modal sheet named by its title with header actions', async () => {
    const { baseElement } = render(
      <SheetTrigger>
        <Button>Filters</Button>
        <SideSheet title="Filters" actions={({ close }) => <Button onPress={close}>Close</Button>}>
          Options
        </SideSheet>
      </SheetTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveClass(
      'w-[256px]',
      'bg-surface-container-low',
      'shadow-elevation-1',
      'rounded-s-corner-large',
    );
    expect(screen.getByRole('heading', { name: 'Filters' })).toHaveClass('text-title-large');
    expect(await axeViolations(baseElement)).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog).toHaveAttribute('data-exiting');
  });

  it('detaches with corners all round', () => {
    render(
      <SideSheet title="Info" detached defaultOpen>
        Info
      </SideSheet>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('rounded-corner-large');
    expect(dialog.parentElement).toHaveClass('pt-[16px]', 'pe-[16px]');
  });

  it('renders a standard sheet in the layout that opens and closes its width', () => {
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
    render(<Demo />);
    const sheet = screen.getByTestId('sheet');
    expect(sheet).toHaveClass('grid-cols-[1fr]', 'data-closed:grid-cols-[0fr]');
    expect(sheet).toHaveAccessibleName('Details');
    expect(screen.getByText('Body').closest('.bg-surface')).not.toBe(null);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(sheet).toHaveAttribute('data-closed', 'true');
    expect(sheet).toHaveAttribute('inert');
  });
});
