import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { LIVE_REGION_DELAY } from '../../utils/announce';
import { Snackbar, SnackbarHost } from './Snackbar';
import { durationMillis, SnackbarHostState } from './snackbar-state';

describe('SnackbarHostState', () => {
  it('shows snackbars one at a time and resolves how each ended', async () => {
    const state = new SnackbarHostState();
    const first = state.showSnackbar({ message: 'One', actionLabel: 'Undo' });
    const second = state.showSnackbar('Two');
    expect(state.currentSnackbarData?.visuals.message).toBe('One');
    state.currentSnackbarData!.performAction();
    await expect(first).resolves.toBe('action-performed');
    expect(state.currentSnackbarData?.visuals.message).toBe('Two');
    state.currentSnackbarData!.dismiss();
    await expect(second).resolves.toBe('dismissed');
    expect(state.currentSnackbarData).toBeNull();
  });

  it('uses Compose’s durations, and never times out a snackbar with an action', () => {
    expect(durationMillis({ message: 'a' })).toBe(4000);
    expect(durationMillis({ message: 'a', duration: 'long' })).toBe(10000);
    expect(durationMillis({ message: 'a', actionLabel: 'Undo' })).toBe(Infinity);
    expect(durationMillis({ message: 'a', actionLabel: 'Undo', duration: 'short' })).toBe(Infinity);
  });

  it('can replace the snackbar on screen instead of queueing', async () => {
    const state = new SnackbarHostState();
    const first = state.showSnackbar('Uploading 1 file');
    const later = state.showSnackbar('Queued');
    const second = state.showSnackbar('Uploading 2 files', { replace: true });
    await expect(first).resolves.toBe('dismissed');
    expect(state.currentSnackbarData?.visuals.message).toBe('Uploading 2 files');
    state.currentSnackbarData!.dismiss();
    await expect(second).resolves.toBe('dismissed');
    expect(state.currentSnackbarData?.visuals.message).toBe('Queued');
    state.currentSnackbarData!.dismiss();
    await later;
  });
});

describe('Snackbar', () => {
  it('lets consumer classes replace the token classes', () => {
    render(
      <Snackbar
        actionLabel="Undo"
        data-testid="bar"
        className="bg-surface-container text-on-surface rounded-corner-small shadow-elevation-1"
        classNames={{ action: 'text-primary' }}
      >
        Message archived
      </Snackbar>,
    );
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveClass(
      'bg-surface-container',
      'text-on-surface',
      'rounded-corner-small',
      'shadow-elevation-1',
    );
    expect(bar).not.toHaveClass(
      'bg-[var(--_md-comp-snackbar-container-color)]',
      'text-[color:var(--_md-comp-snackbar-supporting-text-color)]',
      'rounded-[var(--_md-comp-snackbar-container-shape)]',
      'shadow-[shadow:var(--_md-comp-snackbar-container-elevation)]',
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveClass('text-primary');
  });

  it('shows a message with an action and a dismiss button', async () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <Snackbar actionLabel="Undo" onAction={onAction} onDismiss={onDismiss} data-testid="bar">
        Message archived
      </Snackbar>,
    );
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveClass(
      'bg-[var(--_md-comp-snackbar-container-color)]',
      'text-[color:var(--_md-comp-snackbar-supporting-text-color)]',
      'text-body-medium',
      'rounded-[var(--_md-comp-snackbar-container-shape)]',
      'shadow-[shadow:var(--_md-comp-snackbar-container-elevation)]',
      'min-h-[48px]',
      'max-w-[600px]',
      'ps-[16px]',
    );
    expect(bar).not.toHaveClass('pe-[8px]');
    expect(bar).toHaveAttribute('data-tokens', 'md-comp-snackbar');
    const action = screen.getByRole('button', { name: 'Undo' });
    expect(action).toHaveAttribute('data-slot', 'action');
    expect(action).toHaveClass('text-[color:var(--_md-comp-snackbar-action-label-text-color)]');
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    expect(dismiss).toHaveAttribute('data-slot', 'dismiss');
    expect(dismiss).toHaveClass('text-[color:var(--_md-comp-snackbar-icon-color)]');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    screen.getByRole('button', { name: 'Undo' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledTimes(2);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('pads 8px after the action without a dismiss button, and can stack the action', () => {
    const { rerender } = render(
      <Snackbar actionLabel="Retry" data-testid="bar">
        Connection lost
      </Snackbar>,
    );
    expect(screen.getByTestId('bar')).toHaveClass('pe-[8px]', 'items-center');
    rerender(
      <Snackbar actionLabel="Open settings" actionOnNewLine data-testid="bar">
        Connection lost
      </Snackbar>,
    );
    expect(screen.getByTestId('bar')).toHaveClass('flex-col');
    expect(screen.getByRole('button', { name: 'Open settings' }).parentElement).toHaveClass(
      'self-end',
      'pb-[4px]',
      'pe-[8px]',
    );
  });
});

/** Lets a newly mounted host's live region settle, as it does before showing snackbars. */
async function hostReady() {
  if (vi.isFakeTimers()) act(() => vi.advanceTimersByTime(LIVE_REGION_DELAY));
  else await act(() => new Promise((resolve) => setTimeout(resolve, LIVE_REGION_DELAY)));
}

describe('SnackbarHost', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the current snackbar in a polite live region and resolves the action', async () => {
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} data-testid="host" />);
    await hostReady();
    expect(screen.getByTestId('host')).toHaveAttribute('aria-live', 'polite');
    let result: Promise<string> | undefined;
    act(() => {
      result = state.showSnackbar({ message: 'Archived', actionLabel: 'Undo' });
    });
    expect(screen.getByText('Archived')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect(result).resolves.toBe('action-performed');
    // The leaving snackbar is inert while it fades out.
    expect(screen.getByText('Archived').closest('[inert]')).not.toBeNull();
  });

  it('dismisses a short snackbar after 4s, pausing while hovered', async () => {
    vi.useFakeTimers();
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} />);
    await hostReady();
    const done = vi.fn();
    act(() => {
      void state.showSnackbar('Saved').then(done);
    });
    const item = screen.getByText('Saved').closest('[class*="p-[12px]"]')!;
    fireEvent.pointerEnter(item);
    act(() => vi.advanceTimersByTime(5000));
    expect(state.currentSnackbarData).not.toBeNull();
    fireEvent.pointerLeave(item);
    act(() => vi.advanceTimersByTime(3999));
    expect(state.currentSnackbarData).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(state.currentSnackbarData).toBeNull();
  });

  it('dismisses on Escape even without the × button', async () => {
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} />);
    await hostReady();
    let result: Promise<string> | undefined;
    act(() => {
      result = state.showSnackbar({ message: 'Archived', actionLabel: 'Undo' });
    });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
    act(() => screen.getByRole('button', { name: 'Undo' }).focus());
    await userEvent.keyboard('{Escape}');
    await expect(result).resolves.toBe('dismissed');
  });

  it('moves focus to an actionable snackbar with Alt+G and returns it when it leaves', async () => {
    const state = new SnackbarHostState();
    const { container } = render(
      <>
        <button type="button">Archive</button>
        <SnackbarHost state={state} data-testid="host" />
      </>,
    );
    await hostReady();
    const archive = screen.getByRole('button', { name: 'Archive' });
    archive.focus();
    act(() => {
      void state.showSnackbar({ message: 'Archived', actionLabel: 'Undo' });
    });
    const item = screen.getByText('Archived').closest('[data-snackbar-id]')!;
    expect(item).toHaveAttribute('aria-keyshortcuts', 'Alt+G');
    // Alt+G types "©" on a Mac; the physical key still matches.
    fireEvent.keyDown(document, { key: '©', code: 'KeyG', altKey: true });
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus();
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.keyboard('{Enter}');
    expect(archive).toHaveFocus();
  });

  it('can change or turn off the shortcut, and leaves snackbars without actions alone', async () => {
    const state = new SnackbarHostState();
    const { rerender } = render(<SnackbarHost state={state} focusShortcut={false} />);
    await hostReady();
    act(() => {
      void state.showSnackbar({ message: 'Archived', actionLabel: 'Undo' });
    });
    fireEvent.keyDown(document, { key: 'g', code: 'KeyG', altKey: true });
    expect(screen.getByRole('button', { name: 'Undo' })).not.toHaveFocus();
    rerender(<SnackbarHost state={state} focusShortcut="Control+Shift+S" />);
    fireEvent.keyDown(document, { key: 'S', code: 'KeyS', ctrlKey: true, shiftKey: true });
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus();
    act(() => state.currentSnackbarData!.dismiss());
    act(() => {
      void state.showSnackbar('Saved');
    });
    expect(screen.getByText('Saved').closest('[data-snackbar-id]')).not.toHaveAttribute(
      'aria-keyshortcuts',
    );
  });

  it('expands upward with a clip instead of scaling', async () => {
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} />);
    await hostReady();
    act(() => {
      void state.showSnackbar('Saved');
    });
    const item = screen.getByText('Saved').closest('[data-snackbar-id]')!;
    expect(item.className).toContain('starting:[clip-path:inset(100%_-32px_-32px_-32px)]');
    expect(item.className).not.toMatch(/scale/);
  });

  it('removes a snackbar once it has faded out', async () => {
    vi.useFakeTimers();
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} />);
    await hostReady();
    act(() => {
      void state.showSnackbar({ message: 'Bye', withDismissAction: true });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getByText('Bye')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Bye')).toBeNull();
  });

  it('renders its live region empty first, so a snackbar shown before it mounts is announced', () => {
    vi.useFakeTimers();
    const state = new SnackbarHostState();
    // Shown at launch, before the host is on the page.
    void state.showSnackbar('Welcome back');
    render(<SnackbarHost state={state} data-testid="host" />);
    const host = screen.getByTestId('host');
    expect(host).toHaveAttribute('aria-live', 'polite');
    expect(host).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(LIVE_REGION_DELAY - 1));
    expect(host).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(host).toHaveTextContent('Welcome back');
    // Its 4s starts once it's shown.
    act(() => vi.advanceTimersByTime(3999));
    expect(state.currentSnackbarData).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(state.currentSnackbarData).toBeNull();
  });

  it('announces through its own region, not a second one', async () => {
    document.querySelector('[data-windmorph-announcer]')?.remove();
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} />);
    await hostReady();
    act(() => {
      void state.showSnackbar('Saved');
    });
    await new Promise((resolve) => setTimeout(resolve, LIVE_REGION_DELAY + 50));
    expect(document.querySelector('[data-windmorph-announcer]')?.textContent ?? '').toBe('');
  });
});

describe('Snackbar without a host', () => {
  const announcer = () => document.querySelector('[data-windmorph-announcer]');
  // Earlier tests' snackbars announced into the page's region; start with none.
  beforeEach(() => announcer()?.remove());

  it('announces its message politely once the region is registered, and again when it changes', () => {
    vi.useFakeTimers();
    try {
      const { rerender, unmount } = render(
        <Snackbar actionLabel="Undo">Message archived</Snackbar>,
      );
      const region = announcer();
      expect(region).toHaveAttribute('aria-live', 'polite');
      // Empty while screen readers register it.
      expect(region).toBeEmptyDOMElement();
      act(() => vi.advanceTimersByTime(LIVE_REGION_DELAY));
      expect(region).toHaveTextContent(/^Message archived$/);
      // A re-render with the same message doesn't repeat it.
      rerender(<Snackbar actionLabel="Undo">Message archived</Snackbar>);
      expect(region?.childElementCount).toBe(1);
      rerender(<Snackbar actionLabel="Undo">2 messages archived</Snackbar>);
      expect(region?.lastElementChild).toHaveTextContent('2 messages archived');
      // Announcements are cleared after they've been read; the region stays for the next.
      act(() => vi.advanceTimersByTime(7000));
      expect(region).toBeEmptyDOMElement();
      unmount();
      render(<Snackbar>Saved</Snackbar>);
      expect(announcer()).toBe(region);
      expect(region).toHaveTextContent('Saved');
    } finally {
      vi.useRealTimers();
    }
  });
});
