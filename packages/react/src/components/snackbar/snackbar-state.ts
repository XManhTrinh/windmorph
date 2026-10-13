/*
 * Port of Compose's SnackbarHostState: snackbars are queued and shown one at a time;
 * `showSnackbar` resolves when the shown snackbar is acted on, dismissed or times out.
 */

export type SnackbarDuration = 'short' | 'long' | 'indefinite';
export type SnackbarResult = 'action-performed' | 'dismissed';

export interface SnackbarVisuals {
  message: string;
  /** Label of the action button. */
  actionLabel?: string;
  /** Show a dismiss (×) button. */
  withDismissAction?: boolean;
  /** Put the action under the message, for long action labels. */
  actionOnNewLine?: boolean;
  /** @default "indefinite" with an action, otherwise "short" */
  duration?: SnackbarDuration;
}

export interface SnackbarData {
  /** Unique per shown snackbar. */
  id: number;
  visuals: SnackbarVisuals;
  performAction: () => void;
  dismiss: () => void;
}

/** Compose `SnackbarDuration.toMillis` (without the platform accessibility multiplier). */
export function durationMillis({ duration, actionLabel }: SnackbarVisuals): number {
  const resolved = duration ?? (actionLabel ? 'indefinite' : 'short');
  return resolved === 'short' ? 4000 : resolved === 'long' ? 10000 : Infinity;
}

let nextId = 1;

/**
 * Holds the snackbar queue for a {@link SnackbarHost}. Create one per host with
 * `useSnackbarHostState()`.
 */
export class SnackbarHostState {
  private current: SnackbarData | null = null;
  private queue: (() => void)[] = [];
  private listeners = new Set<() => void>();

  /** The snackbar being shown, if any. */
  get currentSnackbarData(): SnackbarData | null {
    return this.current;
  }

  /**
   * Shows a snackbar once any current one has gone, and resolves with how it ended.
   *
   * @example
   * const result = await snackbar.showSnackbar({ message: 'Archived', actionLabel: 'Undo' });
   * if (result === 'action-performed') unarchive();
   */
  showSnackbar(visuals: SnackbarVisuals | string): Promise<SnackbarResult> {
    const resolved = typeof visuals === 'string' ? { message: visuals } : visuals;
    return new Promise((resolve) => {
      const show = () => {
        const finish = (result: SnackbarResult) => {
          if (this.current?.id !== data.id) return;
          this.current = null;
          this.emit();
          resolve(result);
          this.queue.shift()?.();
        };
        const data: SnackbarData = {
          id: nextId++,
          visuals: resolved,
          performAction: () => finish('action-performed'),
          dismiss: () => finish('dismissed'),
        };
        this.current = data;
        this.emit();
      };
      if (this.current) this.queue.push(show);
      else show();
    });
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.current;

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}
