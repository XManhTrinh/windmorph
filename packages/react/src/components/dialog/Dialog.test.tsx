import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogFullScreen,
} from './Dialog';

const gone = (name: string, role = 'alertdialog') =>
  waitFor(() => expect(screen.queryByRole(role, { name })).not.toBeInTheDocument(), {
    timeout: 1500,
  });

function DeleteDialog(props: Partial<React.ComponentProps<typeof Dialog>>) {
  return (
    <DialogTrigger>
      <Button>Delete</Button>
      <Dialog data-testid="panel" {...props}>
        {({ close }) => (
          <>
            <DialogTitle>Delete file?</DialogTitle>
            <DialogContent>It will be removed from all devices.</DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text">Delete forever</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

describe('Dialog', () => {
  it('opens from its trigger as an alert dialog, named and described, focusing its first action', async () => {
    render(<DeleteDialog />);
    const trigger = screen.getByRole('button', { name: 'Delete' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    const dialog = screen.getByRole('alertdialog', { name: 'Delete file?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    expect(dialog).toHaveAccessibleName('Delete file?');
    expect(dialog).toHaveAccessibleDescription('It will be removed from all devices.');
    // The spec: focus lands on the first interactive element.
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('respects autoFocus inside, and falls back to the panel without controls', async () => {
    const { unmount } = render(
      <Dialog defaultOpen aria-label="Rename">
        <DialogContent>
          <button type="button">First</button>
          <input aria-label="Name" autoFocus />
        </DialogContent>
      </Dialog>,
    );
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus());
    unmount();
    render(
      <Dialog defaultOpen aria-label="Notice">
        <DialogContent>Nothing to press.</DialogContent>
      </Dialog>,
    );
    await waitFor(() => expect(screen.getByRole('alertdialog', { name: 'Notice' })).toHaveFocus());
  });

  it('has no dangling description without DialogContent', async () => {
    render(
      <Dialog defaultOpen aria-label="Empty">
        <DialogActions>
          <Button variant="text">OK</Button>
        </DialogActions>
      </Dialog>,
    );
    expect(await screen.findByRole('alertdialog', { name: 'Empty' })).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.keyboard('{Escape}');
    await gone('Delete file?');
    // React Aria restores focus in an animation frame after the dialog unmounts.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus());
  });

  it('closes from the render prop, and buttons inside are not triggers', async () => {
    render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect(cancel).not.toHaveAttribute('aria-haspopup');
    await userEvent.click(cancel);
    await gone('Delete file?');
  });

  it('stays when pressing outside, unless it is a plain dialog or dismissable', async () => {
    const { unmount } = render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByTestId('panel').parentElement!.parentElement!);
    expect(screen.getByRole('alertdialog', { name: 'Delete file?' })).toBeInTheDocument();
    unmount();

    const { unmount: unmountPlain } = render(<DeleteDialog role="dialog" />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByTestId('panel').parentElement!.parentElement!);
    await gone('Delete file?', 'dialog');
    unmountPlain();

    render(<DeleteDialog dismissable />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByTestId('panel').parentElement!.parentElement!);
    await gone('Delete file?');
  });

  it('expands from its top edge instead of scaling, keeping 56px from wide windows', async () => {
    render(<DeleteDialog placement="top" />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const motion = screen.getByTestId('panel').parentElement!;
    expect(motion).toHaveClass(
      '[--m3-dialog-collapsed:inset(-32px_-32px_100%_-32px)]',
      'starting:[clip-path:var(--m3-dialog-collapsed)]',
      'data-exiting:[clip-path:var(--m3-dialog-collapsed)]',
    );
    expect(motion.className).not.toMatch(/scale/);
    expect(motion.parentElement).toHaveClass('items-start', 'medium:p-[56px]', 'p-[24px]');
  });

  it.each([
    ['bottom', ['[--m3-dialog-collapsed:inset(100%_-32px_-32px_-32px)]']],
    [
      'start',
      [
        '[--m3-dialog-collapsed:inset(-32px_100%_-32px_-32px)]',
        'rtl:[--m3-dialog-collapsed:inset(-32px_-32px_-32px_100%)]',
      ],
    ],
    [
      'end',
      [
        '[--m3-dialog-collapsed:inset(-32px_-32px_-32px_100%)]',
        'rtl:[--m3-dialog-collapsed:inset(-32px_100%_-32px_-32px)]',
      ],
    ],
  ] as const)('expands away from the %s edge', async (placement, classes) => {
    render(<DeleteDialog placement={placement} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const motion = screen.getByTestId('panel').parentElement!;
    expect(motion).toHaveClass(...classes);
    expect(motion).not.toHaveClass('[--m3-dialog-collapsed:inset(-32px_-32px_100%_-32px)]');
  });

  it('keeps only the fades under reduced motion, and is at least 280px wide', async () => {
    render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const panel = screen.getByTestId('panel');
    expect(panel.parentElement).toHaveClass(
      'motion-reduce:[transition-property:opacity]',
      'motion-reduce:starting:[clip-path:inset(-32px)]',
      'motion-reduce:data-exiting:[clip-path:inset(-32px)]',
    );
    // The minimum is capped by the window's margins, not by the content-sized wrapper.
    expect(panel).toHaveClass('min-w-[min(280px,calc(100vw-48px))]');
  });

  it('keeps the dialog mounted while it animates out', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DeleteDialog />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('panel')).toHaveAttribute('data-exiting');
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('can be controlled without a trigger', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Dialog open={open} onOpenChange={setOpen} aria-label="Settings">
            <DialogContent>Body</DialogContent>
          </Dialog>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('alertdialog', { name: 'Settings' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await gone('Settings');
  });

  it('opens from an icon button too', async () => {
    render(
      <DialogTrigger>
        <IconButton icon={<svg />} aria-label="Info" />
        <Dialog aria-label="About">
          <DialogContent>Version 1</DialogContent>
        </Dialog>
      </DialogTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Info' }));
    expect(screen.getByRole('alertdialog', { name: 'About' })).toBeInTheDocument();
  });

  it('centres the title under an icon', async () => {
    render(<DeleteDialog icon={<svg data-testid="icon" />} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('heading', { name: 'Delete file?' })).toHaveClass('text-center');
  });

  it('keeps the theme of where it was rendered', async () => {
    render(
      <ThemeScope theme="forest" mode="dark">
        <DeleteDialog />
      </ThemeScope>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const scope = screen.getByRole('alertdialog').closest('[data-overlay-scope]');
    expect(scope).toHaveAttribute('data-theme', 'forest');
    expect(scope).toHaveAttribute('data-mode', 'dark');
  });

  it('puts className, style and data-* on the panel', async () => {
    render(<DeleteDialog className="max-w-[400px]" style={{ padding: 32 }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const panel = screen.getByTestId('panel');
    expect(panel).toBe(screen.getByRole('alertdialog'));
    expect(panel).toHaveClass(
      'max-w-[400px]',
      'bg-surface-container-high',
      'rounded-corner-extra-large',
    );
    expect(panel).not.toHaveClass('max-w-[560px]');
    expect(panel).toHaveStyle({ padding: '32px' });
  });

  it('merges classNames.positioner into the positioner, so it can sit anywhere', async () => {
    render(<DeleteDialog classNames={{ positioner: 'items-start justify-end' }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const positioner = screen.getByTestId('panel').parentElement!.parentElement!;
    expect(positioner).toHaveClass(
      'items-start',
      'justify-end',
      'fixed',
      'inset-0',
      'p-[24px]',
      'medium:p-[56px]',
    );
    expect(positioner).not.toHaveClass('items-center');
    expect(positioner).not.toHaveClass('justify-center');
  });

  it('draws the optional dividers around its content', async () => {
    render(
      <Dialog defaultOpen aria-label="Ringtone">
        <DialogContent dividers data-testid="content">
          Options
        </DialogContent>
      </Dialog>,
    );
    expect(await screen.findByTestId('content')).toHaveClass(
      'border-y',
      'border-outline-variant',
      '-mx-[24px]',
      'px-[24px]',
    );
  });

  it('has no axe violations when open', async () => {
    const { baseElement } = render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});

describe('Dialog scrolling content', () => {
  /** Content taller than its box, and a `ResizeObserver` that reports at once. */
  function overflowEverything() {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        observe() {
          this.callback();
        }
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200);
  }
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is focusable while it scrolls, after the first control, with a focus ring', async () => {
    overflowEverything();
    render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const content = screen.getByText('It will be removed from all devices.');
    expect(content).toHaveAttribute('tabindex', '0');
    expect(content).toHaveAttribute('data-scrollable');
    expect(content).toHaveClass('focus-ring');
    // Initial focus still goes to the first control.
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(content).toHaveFocus();
    expect(content).toHaveAttribute('data-focus-visible');
  });

  it('is not focusable when it fits', async () => {
    render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const content = screen.getByText('It will be removed from all devices.');
    expect(content).not.toHaveAttribute('tabindex');
    expect(content).not.toHaveAttribute('data-scrollable');
  });

  it('has no axe violations while it scrolls', async () => {
    overflowEverything();
    const { baseElement } = render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});

describe('Dialog full screen', () => {
  function EditDialog({
    fullScreen,
    onSave,
  }: {
    fullScreen: DialogFullScreen;
    onSave?: () => void;
  }) {
    return (
      <DialogTrigger>
        <Button>Edit name</Button>
        <Dialog fullScreen={fullScreen} data-testid="panel">
          {({ close }) => (
            <>
              <DialogHeader
                closeLabel="Close"
                action={
                  <Button variant="text" onPress={onSave}>
                    Save
                  </Button>
                }
              >
                Edit name
              </DialogHeader>
              <DialogContent>Name field</DialogContent>
              <DialogActions data-testid="actions">
                <Button variant="text" onPress={close}>
                  Cancel
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </DialogTrigger>
    );
  }

  it('fills the window with a header of close, headline and action', async () => {
    const onSave = vi.fn();
    render(<EditDialog fullScreen="always" onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit name' }));
    const panel = screen.getByRole('dialog', { name: 'Edit name' });
    expect(panel).toHaveAttribute('data-full-screen', 'always');
    expect(panel).toHaveClass('size-full', 'bg-surface-container-high', 'rounded-none');
    expect(screen.getByRole('heading', { name: 'Edit name' }).parentElement).toHaveClass(
      'h-[56px]',
    );
    expect(screen.getByRole('heading', { name: 'Edit name' })).toHaveClass('text-title-large');
    expect(screen.getByTestId('actions')).toHaveClass('hidden');
    // The spec: 24px top, left and right padding; an on-surface close icon.
    expect(screen.getByText('Name field')).toHaveClass('pt-[24px]', 'px-[24px]');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass(
      '[--md-comp-icon-button-icon-color:var(--md-sys-color-on-surface)]',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('closes from the header and restores focus to the trigger', async () => {
    render(<EditDialog fullScreen="always" />);
    const trigger = screen.getByRole('button', { name: 'Edit name' });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await gone('Edit name', 'dialog');
    // React Aria restores focus in an animation frame after the dialog unmounts.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('is full screen only on compact windows with "compact"', async () => {
    render(<EditDialog fullScreen="compact" />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit name' }));
    const panel = screen.getByRole('dialog', { name: 'Edit name' });
    expect(panel).toHaveAttribute('data-full-screen', 'compact');
    expect(panel).toHaveClass('max-medium:size-full', 'rounded-corner-extra-large');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('medium:hidden');
    expect(screen.getByTestId('actions')).toHaveClass('max-medium:hidden');
    expect(screen.getByText('Name field')).toHaveClass('max-medium:pt-[24px]');
  });

  it('focuses the first rendered control, skipping the hidden close button on wide windows', async () => {
    // jsdom has no layout: report the `medium:hidden` header parts as not rendered.
    Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
      configurable: true,
      value(this: HTMLElement) {
        return this.closest('.medium\\:hidden') === null;
      },
    });
    try {
      render(<EditDialog fullScreen="compact" />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit name' }));
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    } finally {
      Reflect.deleteProperty(HTMLElement.prototype, 'checkVisibility');
    }
  });

  it('is a plain title without close or action when never full screen', async () => {
    render(<EditDialog fullScreen="never" />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit name' }));
    expect(screen.getByRole('heading', { name: 'Edit name' })).toHaveClass('text-headline-small');
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).not.toHaveAttribute('data-full-screen');
  });

  it('shows the actions as a 56px bottom bar without a header action, and a divider', async () => {
    render(
      <Dialog defaultOpen fullScreen="always">
        <DialogHeader closeLabel="Close" divider>
          Filters
        </DialogHeader>
        <DialogContent>Options</DialogContent>
        <DialogActions data-testid="actions">
          <Button variant="text">Apply</Button>
        </DialogActions>
      </Dialog>,
    );
    const panel = await screen.findByRole('dialog', { name: 'Filters' });
    expect(screen.getByTestId('actions')).toHaveClass('flex', 'h-[56px]');
    expect(screen.getByTestId('actions')).not.toHaveClass('hidden');
    expect(screen.getByRole('heading', { name: 'Filters' }).parentElement).toHaveClass(
      'border-b',
      'border-outline-variant',
    );
    // A full-screen dialog focuses its first interactive element: the close button.
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(panel.parentElement!.className).toContain('spatial-slow-duration');
  });

  it('has no axe violations in full screen', async () => {
    const { baseElement } = render(<EditDialog fullScreen="always" />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit name' }));
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});

describe('Dialog container transform', () => {
  function NewEvent({
    origin,
    fullScreen = 'always',
  }: {
    origin: React.ComponentProps<typeof Dialog>['origin'];
    fullScreen?: DialogFullScreen;
  }) {
    return (
      <DialogTrigger>
        <Button>New event</Button>
        <Dialog fullScreen={fullScreen} origin={origin} data-testid="panel">
          <DialogHeader closeLabel="Close">New event</DialogHeader>
          <DialogContent>Title field</DialogContent>
        </Dialog>
      </DialogTrigger>
    );
  }
  const rect = (left: number, top: number, size: number) =>
    ({
      left,
      top,
      right: left + size,
      bottom: top + size,
      width: size,
      height: size,
    }) as DOMRectReadOnly;

  afterEach(() => vi.restoreAllMocks());

  it('starts on an origin element: its box, corners and container colour', async () => {
    const fab = document.createElement('button');
    fab.style.borderTopLeftRadius = '16px';
    fab.style.backgroundColor = 'rgb(1, 2, 3)';
    document.body.append(fab);
    vi.spyOn(fab, 'getBoundingClientRect').mockReturnValue(rect(952, 696, 56) as DOMRect);
    render(<NewEvent origin={fab} />);
    await userEvent.click(screen.getByRole('button', { name: 'New event' }));
    const panel = screen.getByTestId('panel');
    const motion = panel.parentElement!;
    // jsdom's window is 1024 × 768.
    expect(motion.style.getPropertyValue('--m3-dialog-origin')).toBe(
      'inset(696px 16px 16px 952px round 16px)',
    );
    expect(motion.style.getPropertyValue('--m3-dialog-origin-color')).toBe('rgb(1, 2, 3)');
    expect(panel).toHaveAttribute('data-origin');
    expect(motion).toHaveClass(
      'starting:[clip-path:var(--m3-dialog-origin)]',
      'motion-safe:data-exiting:[clip-path:var(--m3-dialog-origin)]',
      'starting:translate-none',
    );
    expect(panel).toHaveClass('starting:bg-(--m3-dialog-origin-color)', '*:starting:opacity-0');
    fab.remove();
  });

  it('starts on the trigger, or on a box, with the dialog colour when it has none', async () => {
    const { unmount } = render(<NewEvent origin="trigger" />);
    const trigger = screen.getByRole('button', { name: 'New event' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rect(16, 16, 40) as DOMRect);
    await userEvent.click(trigger);
    const motion = screen.getByTestId('panel').parentElement!;
    expect(motion.style.getPropertyValue('--m3-dialog-origin')).toMatch(
      /^inset\(16px 968px 712px 16px round /,
    );
    unmount();

    render(<NewEvent origin={rect(100, 50, 20)} />);
    await userEvent.click(screen.getByRole('button', { name: 'New event' }));
    const boxMotion = screen.getByTestId('panel').parentElement!;
    expect(boxMotion.style.getPropertyValue('--m3-dialog-origin')).toBe(
      'inset(50px 904px 698px 100px round 0px)',
    );
    expect(boxMotion.style.getPropertyValue('--m3-dialog-origin-color')).toBe(
      'var(--md-sys-color-surface-container-high)',
    );
  });

  it('applies only below 600px with "compact", and never to a basic dialog', async () => {
    const { unmount } = render(<NewEvent origin={rect(0, 0, 56)} fullScreen="compact" />);
    await userEvent.click(screen.getByRole('button', { name: 'New event' }));
    expect(screen.getByTestId('panel').parentElement).toHaveClass(
      'max-medium:starting:[clip-path:var(--m3-dialog-origin)]',
    );
    unmount();

    render(<NewEvent origin={rect(0, 0, 56)} fullScreen="never" />);
    await userEvent.click(screen.getByRole('button', { name: 'New event' }));
    const panel = screen.getByTestId('panel');
    expect(panel).not.toHaveAttribute('data-origin');
    expect(panel.parentElement!.style.getPropertyValue('--m3-dialog-origin')).toBe('');
  });

  it('opens without a transform when "trigger" has no trigger', async () => {
    render(
      <Dialog defaultOpen fullScreen="always" origin="trigger" data-testid="panel">
        <DialogHeader closeLabel="Close">New event</DialogHeader>
      </Dialog>,
    );
    expect(await screen.findByTestId('panel')).not.toHaveAttribute('data-origin');
  });

  it('has no axe violations', async () => {
    const { baseElement } = render(<NewEvent origin="trigger" />);
    await userEvent.click(screen.getByRole('button', { name: 'New event' }));
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});

describe('DialogActions with more than two actions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function Actions({ children }: { children: React.ReactNode }) {
    return (
      <Dialog defaultOpen aria-label="Share">
        <DialogActions>{children}</DialogActions>
      </Dialog>
    );
  }

  const ok = <Button variant="text">OK</Button>;
  const cancel = <Button variant="text">Cancel</Button>;
  const learnMore = <Button variant="text">Learn more</Button>;

  it('warns once in development when it holds three actions, counting inside fragments', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <Actions>
        {learnMore}
        <>
          {cancel}
          {ok}
        </>
      </Actions>,
    );
    await screen.findByRole('alertdialog');
    rerender(
      <Actions>
        {learnMore}
        {cancel}
        {ok}
      </Actions>,
    );
    const warnings = warn.mock.calls.filter(([message]) =>
      String(message).includes('DialogActions'),
    );
    expect(warnings).toEqual([
      [
        '[@windmorph/react] DialogActions holds 3 actions; M3 dialogs have at most two ' +
          '(no third such as "Learn more"). Show more inline, or before the dialog opens.',
      ],
    ]);
  });

  it('stays silent with one or two actions, ignoring null and false', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(<Actions>{ok}</Actions>);
    await screen.findByRole('alertdialog');
    rerender(
      <Actions>
        {null}
        {cancel}
        {false}
        {ok}
      </Actions>,
    );
    expect(
      warn.mock.calls.filter(([message]) => String(message).includes('DialogActions')),
    ).toEqual([]);
  });

  it('stays silent in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Actions>
        {learnMore}
        {cancel}
        {ok}
      </Actions>,
    );
    await screen.findByRole('alertdialog');
    expect(
      warn.mock.calls.filter(([message]) => String(message).includes('DialogActions')),
    ).toEqual([]);
  });
});
