import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
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

  it('uses Compose’s durations', () => {
    expect(durationMillis({ message: 'a' })).toBe(4000);
    expect(durationMillis({ message: 'a', duration: 'long' })).toBe(10000);
    expect(durationMillis({ message: 'a', actionLabel: 'Undo' })).toBe(Infinity);
    expect(durationMillis({ message: 'a', actionLabel: 'Undo', duration: 'short' })).toBe(4000);
  });
});

describe('Snackbar', () => {
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
      'bg-inverse-surface',
      'text-inverse-on-surface',
      'text-body-medium',
      'rounded-corner-extra-small',
      'shadow-elevation-3',
      'min-h-[48px]',
      'max-w-[600px]',
      'ps-[16px]',
    );
    expect(bar).not.toHaveClass('pe-[8px]');
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveClass('text-inverse-primary');
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

describe('SnackbarHost', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the current snackbar in a polite live region and resolves the action', async () => {
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} data-testid="host" />);
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

  it('dismisses a short snackbar after 4s, pausing while hovered', () => {
    vi.useFakeTimers();
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} />);
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

  it('removes a snackbar once it has faded out', () => {
    vi.useFakeTimers();
    const state = new SnackbarHostState();
    render(<SnackbarHost state={state} />);
    act(() => {
      void state.showSnackbar({ message: 'Bye', withDismissAction: true });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getByText('Bye')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Bye')).toBeNull();
  });
});
