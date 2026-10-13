import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
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

const gone = (name: string) =>
  waitFor(() => expect(screen.queryByRole('dialog', { name })).not.toBeInTheDocument(), {
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
  it('opens from its trigger, is named by its title and takes focus', async () => {
    render(<DeleteDialog />);
    const trigger = screen.getByRole('button', { name: 'Delete' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Delete file?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(dialog).toHaveAccessibleName('Delete file?');
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

  it('closes when pressing outside, unless it is an alert dialog', async () => {
    const { unmount } = render(<DeleteDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByTestId('panel').parentElement!.parentElement!);
    await gone('Delete file?');
    unmount();

    render(<DeleteDialog role="alertdialog" />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByTestId('panel').parentElement!.parentElement!);
    expect(screen.getByRole('alertdialog', { name: 'Delete file?' })).toBeInTheDocument();
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
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
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
    expect(screen.getByRole('dialog', { name: 'About' })).toBeInTheDocument();
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
    const scope = screen.getByRole('dialog').closest('[data-overlay-scope]');
    expect(scope).toHaveAttribute('data-theme', 'forest');
    expect(scope).toHaveAttribute('data-mode', 'dark');
  });

  it('puts className, style and data-* on the panel', async () => {
    render(<DeleteDialog className="max-w-[400px]" style={{ padding: 32 }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const panel = screen.getByTestId('panel');
    expect(panel).toBe(screen.getByRole('dialog'));
    expect(panel).toHaveClass(
      'max-w-[400px]',
      'bg-surface-container-high',
      'rounded-corner-extra-large',
    );
    expect(panel).not.toHaveClass('max-w-[560px]');
    expect(panel).toHaveStyle({ padding: '32px' });
  });

  it('has no axe violations when open', async () => {
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
    expect(panel).toHaveClass('size-full', 'bg-surface', 'rounded-none');
    expect(screen.getByRole('heading', { name: 'Edit name' })).toHaveClass('text-title-large');
    expect(screen.getByTestId('actions')).toHaveClass('hidden');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('closes from the header and restores focus to the trigger', async () => {
    render(<EditDialog fullScreen="always" />);
    const trigger = screen.getByRole('button', { name: 'Edit name' });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await gone('Edit name');
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
  });

  it('is a plain title without close or action when never full screen', async () => {
    render(<EditDialog fullScreen="never" />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit name' }));
    expect(screen.getByRole('heading', { name: 'Edit name' })).toHaveClass('text-headline-small');
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-full-screen');
  });

  it('has no axe violations in full screen', async () => {
    const { baseElement } = render(<EditDialog fullScreen="always" />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit name' }));
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});
