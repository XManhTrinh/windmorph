import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Button } from '../button/Button';
import { Dialog, DialogActions, DialogTitle, DialogTrigger } from '../dialog/Dialog';
import { IconButton } from '../icon-button/IconButton';
import { BottomSheet } from '../sheet/BottomSheet';
import { SheetTrigger } from '../sheet/SheetTrigger';
import { RichTooltip, RichTooltipTrigger, Tooltip, TooltipTrigger } from './Tooltip';

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
  function Favourite(props: { caret?: boolean }) {
    return (
      <TooltipTrigger>
        <IconButton icon={<Icon />} aria-label="Favourite" />
        <Tooltip caret={props.caret}>Add to favourites</Tooltip>
      </TooltipTrigger>
    );
  }

  it('shows on hover and describes its trigger', async () => {
    const { container } = render(<Favourite />);
    const trigger = screen.getByRole('button', { name: 'Favourite' });
    await hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Add to favourites');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveClass(
      'bg-inverse-surface',
      'text-inverse-on-surface',
      'text-body-small',
      'rounded-corner-extra-small',
      'px-[8px]',
      'py-[4px]',
      'max-w-[200px]',
      'starting:scale-80',
    );
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
    expect(tooltip.querySelector('[aria-hidden="true"]')).toHaveClass('border-t-inverse-surface');
  });

  it('requires a trigger', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tooltip>Lost</Tooltip>)).toThrow(/inside a TooltipTrigger/);
  });
});

describe('RichTooltip', () => {
  function Rich() {
    return (
      <RichTooltipTrigger>
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
    expect(dialog).toHaveClass(
      'bg-surface-container',
      'shadow-elevation-2',
      'rounded-corner-medium',
      'max-w-[320px]',
      'px-[16px]',
    );
    expect(screen.getByText('Grouped tabs')).toHaveClass('text-title-small', 'pt-[13px]');
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

  it('pads plain text 4px without a subhead or action', async () => {
    render(
      <RichTooltipTrigger defaultOpen>
        <Button>Info</Button>
        <RichTooltip aria-label="Info">Just text</RichTooltip>
      </RichTooltipTrigger>,
    );
    expect(await screen.findByRole('dialog', { name: 'Info' })).toBeInTheDocument();
    expect(screen.getByText('Just text')).toHaveClass('py-[4px]');
  });
});

/** Whether the element, or any ancestor, is hidden from assistive technology. */
const hiddenFromAT = (element: Element) => element.closest('[aria-hidden="true"], [inert]') != null;

describe('tooltips inside a modal', () => {
  function Favourite() {
    return (
      <TooltipTrigger>
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
    const dialog = screen.getByRole('dialog', { name: 'Photo' });
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
    expect(screen.getByRole('dialog', { name: 'Photo' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 1500 });
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
            <RichTooltipTrigger>
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
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Grouped tabs' })).toBeNull(), {
      timeout: 1500,
    });
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });
});
