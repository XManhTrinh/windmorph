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
  /**
   * How long it stays without an action. A snackbar with an action always stays until it's
   * acted on or dismissed, as the spec requires, so this is ignored then.
   * @default "short"
   */
  duration?: SnackbarDuration;
}

export interface ShowSnackbarOptions {
  /**
   * Replace the snackbar on screen (which resolves `'dismissed'`) instead of queueing behind
   * it, for a snackbar with updated information.
   */
  replace?: boolean;
}

export interface SnackbarData {
  /** Unique per shown snackbar. */
  id: number;
  visuals: SnackbarVisuals;
  performAction: () => void;
  dismiss: () => void;
}

/**
 * Compose `SnackbarDuration.toMillis` (without the platform accessibility multiplier). A
 * snackbar with an action never times out: "Snackbars with actions shouldn't auto-dismiss."
 */
export function durationMillis({ duration = 'short', actionLabel }: SnackbarVisuals): number {
  if (actionLabel !== undefined) return Infinity;
  return duration === 'short' ? 4000 : duration === 'long' ? 10000 : Infinity;
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
   * Shows a snackbar once any current one has gone (or at once with `replace`), and resolves
   * with how it ended.
   *
   * @example
   * const result = await snackbar.showSnackbar({ message: 'Archived', actionLabel: 'Undo' });
   * if (result === 'action-performed') unarchive();
   * snackbar.showSnackbar('3 files uploaded', { replace: true });
   */
  showSnackbar(
    visuals: SnackbarVisuals | string,
    { replace = false }: ShowSnackbarOptions = {},
  ): Promise<SnackbarResult> {
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
      if (!this.current) show();
      else if (replace) {
        this.queue.unshift(show);
        this.current.dismiss();
      } else this.queue.push(show);
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
