import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Button } from '../button/Button';
import { Dialog, DialogActions, DialogTitle, DialogTrigger } from '../dialog/Dialog';
import { IconButton } from '../icon-button/IconButton';
import { BottomSheet } from '../sheet/BottomSheet';
import { SheetTrigger } from '../sheet/SheetTrigger';
import {
  RichTooltip,
  RichTooltipTrigger,
  Tooltip,
  TooltipPlacementContext,
  TooltipTrigger,
} from './Tooltip';

const Icon = () => <svg viewBox="0 0 24 24" />;

/**
 * React Aria counts a hover only once a pointer move has set the interaction modality;
 * user-event's hover fires pointerenter before any move.
 */
async function hover(element: Element) {
  fireEvent.pointerMove(document.body);
  await userEvent.hover(element);
}

const gone = (role: string) =>
  waitFor(() => expect(screen.queryByRole(role)).toBeNull(), { timeout: 1500 });

describe('Tooltip', () => {
  function Favourite(props: { caret?: boolean; closeDelay?: number }) {
    return (
      <TooltipTrigger closeDelay={props.closeDelay ?? 0}>
        <IconButton icon={<Icon />} aria-label="Favourite" />
        <Tooltip caret={props.caret}>Add to favourites</Tooltip>
      </TooltipTrigger>
    );
  }

  it('stays 1.5s after the pointer leaves', async () => {
    render(
      <TooltipTrigger>
        <IconButton icon={<Icon />} aria-label="Favourite" />
        <Tooltip>Add to favourites</Tooltip>
      </TooltipTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'Favourite' });
    await hover(trigger);
    await screen.findByRole('tooltip');
    await userEvent.unhover(trigger);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull(), { timeout: 2000 });
  });

  it('opens on a touch long press without pressing the button, closing 1.5s after release', () => {
    vi.useFakeTimers();
    try {
      const onPress = vi.fn();
      render(
        <TooltipTrigger>
          <IconButton icon={<Icon />} aria-label="Favourite" onPress={onPress} />
          <Tooltip>Add to favourites</Tooltip>
        </TooltipTrigger>,
      );
      const trigger = screen.getByRole('button', { name: 'Favourite' });
      fireEvent.pointerDown(trigger, { pointerType: 'touch', pointerId: 1, button: 0 });
      act(() => vi.advanceTimersByTime(500));
      expect(screen.getByRole('tooltip')).toHaveTextContent('Add to favourites');
      fireEvent.pointerUp(window, { pointerType: 'touch', pointerId: 1 });
      act(() => vi.advanceTimersByTime(1400));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      // Then the exit transition (or its fallback) runs.
      act(() => vi.advanceTimersByTime(200));
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.queryByRole('tooltip')).toBeNull();
      expect(onPress).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows on hover and describes its trigger', async () => {
    const { container } = render(<Favourite />);
    const trigger = screen.getByRole('button', { name: 'Favourite' });
    await hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Add to favourites');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveAttribute('data-tokens', 'md-comp-plain-tooltip');
    expect(tooltip).toHaveClass(
      'bg-[var(--_md-comp-plain-tooltip-container-color)]',
      'text-[color:var(--_md-comp-plain-tooltip-supporting-text-color)]',
      'text-body-small',
      'rounded-[var(--_md-comp-plain-tooltip-container-shape)]',
      'px-[8px]',
      'py-[4px]',
      'w-max',
      'max-w-[200px]',
      'starting:opacity-0',
    );
    // It expands along one axis from the anchor's side instead of scaling.
    expect(tooltip.className).toContain(
      'data-[placement=top]:starting:[clip-path:inset(100%_-16px_-16px_-16px)]',
    );
    expect(tooltip.className).not.toMatch(/scale/);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.unhover(trigger);
    await gone('tooltip');
  });

  it('shows on keyboard focus and hides on Escape', async () => {
    render(<Favourite />);
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await gone('tooltip');
  });

  it('draws a caret', async () => {
    render(<Favourite caret />);
    await hover(screen.getByRole('button'));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.querySelector('[aria-hidden="true"]')).toHaveClass(
      'border-t-[color:var(--_md-comp-plain-tooltip-container-color)]',
    );
  });

  it('lets consumer panel classes replace the token classes', async () => {
    render(
      <TooltipTrigger defaultOpen>
        <IconButton icon={<svg />} aria-label="Favourite" />
        <Tooltip classNames={{ panel: 'bg-primary text-on-primary rounded-corner-small' }}>
          Add
        </Tooltip>
      </TooltipTrigger>,
    );
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveClass('bg-primary', 'text-on-primary', 'rounded-corner-small');
    expect(tooltip).not.toHaveClass(
      'bg-[var(--_md-comp-plain-tooltip-container-color)]',
      'text-[color:var(--_md-comp-plain-tooltip-supporting-text-color)]',
      'rounded-[var(--_md-comp-plain-tooltip-container-shape)]',
    );
  });

  it('puts className on the placed outermost element; the surface keeps its size', async () => {
    render(
      <>
        <TooltipTrigger defaultOpen>
          <IconButton icon={<svg />} aria-label="Favourite" />
          <Tooltip className="fixed right-4 bottom-4">Add</Tooltip>
        </TooltipTrigger>
        <RichTooltipTrigger defaultOpen persistent>
          <Button>Info</Button>
          <RichTooltip title="Grouped tabs" className="static w-full">
            Tabs stay together.
          </RichTooltip>
        </RichTooltipTrigger>
      </>,
    );
    const plain = await screen.findByRole('tooltip');
    const rich = screen.getByRole('dialog', { name: 'Grouped tabs' });
    for (const [panel, layout] of [
      [plain, ['fixed', 'right-4', 'bottom-4']],
      [rich, ['static', 'w-full']],
    ] as const) {
      const positioner = panel.parentElement!;
      expect(positioner).toHaveClass(...layout);
      // React Aria places the outermost element; the surface has no inset of its own.
      expect(positioner.style.position).toBe('absolute');
      expect(panel).not.toHaveClass(...layout);
      expect(panel).toHaveClass('relative', 'w-max');
      expect(panel.style.position).toBe('');
    }
  });

  it('takes its default placement from TooltipPlacementContext; its own placement wins', async () => {
    render(
      <TooltipPlacementContext value="bottom">
        <TooltipTrigger defaultOpen>
          <IconButton icon={<Icon />} aria-label="Edit" tooltip={false} />
          <Tooltip>Edit message</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger defaultOpen placement="right">
          <IconButton icon={<Icon />} aria-label="Share" tooltip={false} />
          <Tooltip>Share message</Tooltip>
        </TooltipTrigger>
      </TooltipPlacementContext>,
    );
    expect(screen.getByText('Edit message')).toHaveAttribute('data-placement', 'bottom');
    expect(screen.getByText('Share message')).toHaveAttribute('data-placement', 'right');
  });

  it('requires a trigger', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tooltip>Lost</Tooltip>)).toThrow(/inside a TooltipTrigger/);
  });
});

describe('RichTooltip', () => {
  function Rich() {
    return (
      <RichTooltipTrigger persistent>
        <Button variant="text">What’s this?</Button>
        <RichTooltip title="Grouped tabs" action={<Button variant="text">Learn more</Button>}>
          Tabs from the same site stay together.
        </RichTooltip>
      </RichTooltipTrigger>
    );
  }

  it('opens on press as a non-modal popover named by its subhead', async () => {
    render(<Rich />);
    const trigger = screen.getByRole('button', { name: 'What’s this?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Grouped tabs' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toHaveAttribute('data-tokens', 'md-comp-rich-tooltip');
    expect(dialog).toHaveClass(
      'bg-[var(--_md-comp-rich-tooltip-container-color)]',
      'shadow-[shadow:var(--_md-comp-rich-tooltip-container-elevation)]',
      'rounded-[var(--_md-comp-rich-tooltip-container-shape)]',
      'text-[color:var(--_md-comp-rich-tooltip-supporting-text-color)]',
      'w-max',
      'max-w-[min(320px,100vw_-_16px)]',
      'px-[16px]',
    );
    expect(screen.getByText('Grouped tabs')).toHaveClass(
      'text-title-small',
      'pt-[13px]',
      'text-[color:var(--_md-comp-rich-tooltip-subhead-color)]',
    );
    expect(screen.getByText('Grouped tabs')).toHaveAttribute('data-slot', 'subhead');
    expect(screen.getByText('Tabs from the same site stay together.')).toHaveClass(
      'text-body-medium',
      'pt-[9px]',
      'pb-[16px]',
    );
    expect(screen.getByRole('button', { name: 'Learn more' }).parentElement).toHaveClass(
      'min-h-[36px]',
      'pb-[8px]',
    );
    await userEvent.keyboard('{Escape}');
    await gone('dialog');
  });

  it('leaves focus on its trigger, as a non-modal dialog the trigger controls', async () => {
    const { container } = render(<Rich />);
    const trigger = screen.getByRole('button', { name: 'What’s this?' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Grouped tabs' });
    expect(trigger).toHaveFocus();
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('is next in the Tab order after its trigger, both ways, without trapping focus', async () => {
    render(
      <>
        <button type="button">Before</button>
        <RichTooltipTrigger persistent defaultOpen>
          <Button variant="text">What’s this?</Button>
          <RichTooltip
            title="Grouped tabs"
            action={
              <>
                <a href="#help">Help</a>
                <Button variant="text">Got it</Button>
              </>
            }
          >
            Tabs from the same site stay together.
          </RichTooltip>
        </RichTooltipTrigger>
        <button type="button">After</button>
      </>,
    );
    const focused = () => document.activeElement?.textContent;
    await screen.findByRole('dialog');
    // Shift+Tab from what follows the trigger enters the tooltip from its end.
    act(() => screen.getByRole('button', { name: 'After' }).focus());
    await userEvent.tab({ shift: true });
    expect(focused()).toBe('Got it');
    await userEvent.tab({ shift: true });
    expect(focused()).toBe('Help');
    await userEvent.tab({ shift: true });
    expect(focused()).toBe('What’s this?');
    await userEvent.tab({ shift: true });
    expect(focused()).toBe('Before');
    // And forwards: trigger, link, button, then on to the page, which closes it (focus moved
    // to another element).
    await userEvent.tab();
    await userEvent.tab();
    expect(focused()).toBe('Help');
    await userEvent.tab();
    expect(focused()).toBe('Got it');
    await userEvent.tab();
    expect(focused()).toBe('After');
    await gone('dialog');
  });

  it('closes on Escape from its trigger or from inside, with focus on the trigger', async () => {
    render(<Rich />);
    const trigger = screen.getByRole('button', { name: 'What’s this?' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await gone('dialog');
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Learn more' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await gone('dialog');
    expect(trigger).toHaveFocus();
  });

  it('closes on a press outside', async () => {
    render(
      <>
        <button type="button">Elsewhere</button>
        <Rich />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'What’s this?' }));
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    await gone('dialog');
  });

  it('closes on a press on empty space, where focus does not move', async () => {
    render(
      <>
        <p>Plain text</p>
        <Rich />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'What’s this?' }));
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByText('Plain text'));
    await gone('dialog');
  });

  it('stays open on a press inside it, and a press on its trigger closes it', async () => {
    render(<Rich />);
    const trigger = screen.getByRole('button', { name: 'What’s this?' });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByText('Tabs from the same site stay together.'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(trigger);
    await gone('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('pads 12px above and 8px below without a subhead or action', async () => {
    render(
      <RichTooltipTrigger persistent defaultOpen>
        <Button>Info</Button>
        <RichTooltip aria-label="Info">Just text</RichTooltip>
      </RichTooltipTrigger>,
    );
    expect(await screen.findByRole('dialog', { name: 'Info' })).toHaveClass(
      'pt-[12px]',
      'pb-[8px]',
    );
  });

  it('is transient by default: a tooltip on hover, below and to the end of its trigger', async () => {
    const { container } = render(
      <RichTooltipTrigger closeDelay={0}>
        <Button variant="text">What’s this?</Button>
        <RichTooltip title="Grouped tabs">Tabs from the same site stay together.</RichTooltip>
      </RichTooltipTrigger>,
    );
    const trigger = screen.getByRole('button', { name: 'What’s this?' });
    expect(trigger).not.toHaveAttribute('aria-expanded');
    await hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Grouped tabs');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    // `bottom start` is below the anchor.
    expect(tooltip).toHaveAttribute('data-placement', 'bottom');
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.unhover(trigger);
    await gone('tooltip');
  });

  it('keeps a transient tooltip open while focus is inside it', async () => {
    render(
      <RichTooltipTrigger closeDelay={0}>
        <Button variant="text">What’s this?</Button>
        <RichTooltip title="Grouped tabs" action={<Button variant="text">Learn more</Button>}>
          Tabs from the same site stay together.
        </RichTooltip>
      </RichTooltipTrigger>,
    );
    await userEvent.tab();
    await screen.findByRole('tooltip');
    act(() => screen.getByRole('button', { name: 'Learn more' }).focus());
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    act(() => screen.getByRole('button', { name: 'Learn more' }).blur());
    await gone('tooltip');
  });
});

/** Whether the element, or any ancestor, is hidden from assistive technology. */
const hiddenFromAT = (element: Element) => element.closest('[aria-hidden="true"], [inert]') != null;

describe('tooltips inside a modal', () => {
  function Favourite() {
    return (
      <TooltipTrigger closeDelay={0}>
        <IconButton icon={<Icon />} aria-label="Favourite" />
        <Tooltip>Add to favourites</Tooltip>
      </TooltipTrigger>
    );
  }

  it('stay visible to assistive technology in a Dialog, which still traps focus', async () => {
    const { baseElement } = render(
      <DialogTrigger>
        <Button>Open</Button>
        <Dialog>
          {({ close }) => (
            <>
              <DialogTitle>Photo</DialogTitle>
              <DialogActions>
                <Favourite />
                <Button variant="text" onPress={close}>
                  Done
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </DialogTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Photo' });
    const trigger = screen.getByRole('button', { name: 'Favourite' });
    await hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(dialog).not.toContainElement(tooltip);
    expect(hiddenFromAT(tooltip)).toBe(false);
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    // Content outside the modal is still hidden.
    expect(hiddenFromAT(screen.getByRole('button', { name: 'Open', hidden: true }))).toBe(true);
    expect(await axeViolations(baseElement)).toEqual([]);

    // Focus stays inside the dialog, wrapping from its last control to its first.
    await userEvent.unhover(trigger);
    await gone('tooltip');
    screen.getByRole('button', { name: 'Done' }).focus();
    await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    // Keyboard focus shows the tooltip, still visible; Escape hides it, then closes the dialog.
    trigger.focus();
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    const focusTooltip = await screen.findByRole('tooltip');
    expect(hiddenFromAT(focusTooltip)).toBe(false);
    await userEvent.keyboard('{Escape}');
    await gone('tooltip');
    expect(screen.getByRole('alertdialog', { name: 'Photo' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: 1500 });
  });

  it('stay visible to assistive technology in a modal BottomSheet', async () => {
    const { baseElement } = render(
      <SheetTrigger>
        <Button>Share</Button>
        <BottomSheet aria-label="Share options">
          <Favourite />
        </BottomSheet>
      </SheetTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    const sheet = screen.getByRole('dialog', { name: 'Share options' });
    const trigger = screen.getByRole('button', { name: 'Favourite' });
    await hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(sheet).not.toContainElement(tooltip);
    expect(hiddenFromAT(tooltip)).toBe(false);
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(await axeViolations(baseElement)).toEqual([]);
  });

  it('keep a RichTooltip visible and reachable in a Dialog', async () => {
    const { baseElement } = render(
      <DialogTrigger>
        <Button>Open</Button>
        <Dialog>
          <DialogTitle>Settings</DialogTitle>
          <DialogActions>
            <RichTooltipTrigger persistent>
              <Button variant="text">What’s this?</Button>
              <RichTooltip title="Grouped tabs" action={<Button variant="text">Learn more</Button>}>
                Tabs from the same site stay together.
              </RichTooltip>
            </RichTooltipTrigger>
          </DialogActions>
        </Dialog>
      </DialogTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('button', { name: 'What’s this?' }));
    const rich = await screen.findByRole('dialog', { name: 'Grouped tabs' });
    expect(hiddenFromAT(rich)).toBe(false);
    expect(await axeViolations(baseElement)).toEqual([]);
    // A press inside the rich tooltip neither closes it nor the dialog under it.
    await userEvent.click(screen.getByText('Tabs from the same site stay together.'));
    expect(screen.getByRole('dialog', { name: 'Grouped tabs' })).toBeInTheDocument();
    expect(screen.getByRole('alertdialog', { name: 'Settings' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Grouped tabs' })).toBeNull(), {
      timeout: 1500,
    });
    expect(screen.getByRole('alertdialog', { name: 'Settings' })).toBeInTheDocument();
  });
});
