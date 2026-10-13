'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from 'react';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { durationMillis, SnackbarHostState, type SnackbarData } from './snackbar-state';
import { snackbarHostStyles, snackbarStyles } from './snackbar-styles';

/** Material Symbols "close" (Apache-2.0). */
function CloseIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

export interface SnackbarClassNames {
  root?: string;
  message?: string;
  actions?: string;
  action?: string;
  dismiss?: string;
}

interface SnackbarOwnProps {
  /** The message. */
  children: React.ReactNode;
  /** Label of the action button. */
  actionLabel?: string;
  onAction?: () => void;
  /** Shows a dismiss (×) button that calls this. */
  onDismiss?: () => void;
  /** Name of the dismiss button. @default "Dismiss" */
  dismissLabel?: string;
  /** Put the actions under the message, for long action labels. */
  actionOnNewLine?: boolean;
  classNames?: SnackbarClassNames;
}

export type SnackbarProps = SnackbarOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof SnackbarOwnProps>;

/**
 * M3 snackbar: a brief message about an app process, with an optional action and dismiss
 * button. Usually shown through a {@link SnackbarHost}; render it directly for custom
 * placement. Escape dismisses it while focus is inside.
 *
 * @example
 * <Snackbar actionLabel="Undo" onAction={undo} onDismiss={close}>Message archived</Snackbar>
 */
export function Snackbar({
  children,
  actionLabel,
  onAction,
  onDismiss,
  dismissLabel = 'Dismiss',
  actionOnNewLine = false,
  classNames,
  className,
  onKeyDown,
  ...rest
}: SnackbarProps) {
  const styles = snackbarStyles({
    newLine: actionOnNewLine && actionLabel !== undefined,
    dismissible: onDismiss !== undefined,
  });
  const hasActions = actionLabel !== undefined || onDismiss !== undefined;
  return (
    <div
      {...rest}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.key === 'Escape' && onDismiss) {
          event.stopPropagation();
          onDismiss();
        }
      }}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div className={styles.message({ class: classNames?.message })}>{children}</div>
      {hasActions && (
        <div className={styles.actions({ class: classNames?.actions })}>
          {actionLabel !== undefined && (
            <Button
              variant="text"
              onPress={onAction}
              className={styles.action({ class: classNames?.action })}
            >
              {actionLabel}
            </Button>
          )}
          {onDismiss && (
            <IconButton
              icon={<CloseIcon />}
              aria-label={dismissLabel}
              onPress={onDismiss}
              className={styles.dismiss({ class: classNames?.dismiss })}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** A {@link SnackbarHostState} that lives as long as the component. */
export function useSnackbarHostState(): SnackbarHostState {
  const [state] = useState(() => new SnackbarHostState());
  return state;
}

export interface SnackbarHostProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  state: SnackbarHostState;
  /** Renders each snackbar; defaults to {@link Snackbar}. */
  snackbar?: (data: SnackbarData) => React.ReactNode;
  /** Name of the dismiss button. @default "Dismiss" */
  dismissLabel?: string;
}

/**
 * Shows the snackbars of a {@link SnackbarHostState} one at a time, in a polite live
 * region. Position it with `className` (e.g. `fixed inset-x-0 bottom-0`). Snackbars without
 * an action leave after 4s (`short`) or 10s (`long`); the timer pauses while the pointer or
 * focus is on the snackbar.
 *
 * @example
 * const snackbar = useSnackbarHostState();
 * <SnackbarHost state={snackbar} className="fixed inset-x-0 bottom-0" />
 * snackbar.showSnackbar({ message: 'Saved' });
 */
export function SnackbarHost({
  state,
  snackbar,
  dismissLabel,
  className,
  ...rest
}: SnackbarHostProps) {
  const current = useSyncExternalStore(state.subscribe, state.getSnapshot, () => null);
  // Keep a leaving snackbar rendered while the next one fades in (Compose cross-fades).
  const [items, setItems] = useState<SnackbarData[]>([]);
  const [shown, setShown] = useState<SnackbarData | null>(null);
  if (current !== shown) {
    setShown(current);
    if (current && !items.includes(current)) setItems([...items, current]);
  }
  const styles = snackbarHostStyles();
  return (
    <div
      {...rest}
      aria-live="polite"
      aria-atomic="false"
      className={styles.root({ class: className })}
    >
      {items.map((data) => (
        <HostItem
          key={data.id}
          data={data}
          visible={data === current}
          onExited={() => setItems((all) => all.filter((item) => item !== data))}
          className={styles.item()}
        >
          {snackbar ? (
            snackbar(data)
          ) : (
            <Snackbar
              actionLabel={data.visuals.actionLabel}
              onAction={data.performAction}
              onDismiss={data.visuals.withDismissAction ? data.dismiss : undefined}
              dismissLabel={dismissLabel}
              actionOnNewLine={data.visuals.actionOnNewLine}
            >
              {data.visuals.message}
            </Snackbar>
          )}
        </HostItem>
      ))}
    </div>
  );
}

function HostItem({
  data,
  visible,
  onExited,
  className,
  children,
}: {
  data: SnackbarData;
  visible: boolean;
  onExited: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const { isPresent, isExiting, exitProps } = usePresence(visible);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPresent) onExited();
  }, [isPresent, onExited]);

  // Auto-dismiss after the duration, paused while hovered or focused within.
  useEffect(() => {
    const ms = durationMillis(data.visuals);
    if (!visible || paused || !Number.isFinite(ms)) return;
    const timer = setTimeout(data.dismiss, ms);
    return () => clearTimeout(timer);
  }, [data, visible, paused]);

  return (
    <div
      {...exitProps}
      ref={ref}
      data-exiting={isExiting || undefined}
      inert={!visible}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(ref.current?.contains(document.activeElement) ?? false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      className={className}
    >
      {children}
    </div>
  );
}
