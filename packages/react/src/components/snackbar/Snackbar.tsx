'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from 'react';
import { useObjectRef } from 'react-aria';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { firstTabbable, matchesShortcut } from '../../utils/focus';
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
  /** Shows a dismiss (×) button that calls this. Escape calls it too. */
  onDismiss?: () => void;
  /**
   * Called on Escape while focus is inside, which dismisses a snackbar with or without the ×
   * button. @default onDismiss
   */
  onEscape?: () => void;
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
 * placement. Escape dismisses it while focus is inside (`onEscape`, or `onDismiss`).
 *
 * @example
 * <Snackbar actionLabel="Undo" onAction={undo} onDismiss={close}>Message archived</Snackbar>
 */
export function Snackbar({
  children,
  actionLabel,
  onAction,
  onDismiss,
  onEscape = onDismiss,
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
        if (event.key === 'Escape' && onEscape && !event.defaultPrevented) {
          event.stopPropagation();
          onEscape();
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
              variant="standard"
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
  /**
   * The key combination that moves focus to a snackbar with actions, as the spec asks for on
   * the web. Document it where your app lists its shortcuts. `false` turns it off.
   * @default "Alt+G"
   */
  focusShortcut?: string | false;
}

/**
 * Shows the snackbars of a {@link SnackbarHostState} one at a time, in a polite live
 * region. Position it with `className` (e.g. `fixed inset-x-0 bottom-0`); a snackbar
 * expands upward from the bottom edge as it enters.
 *
 * - Snackbars without an action leave after 4s (`short`) or 10s (`long`); the timer pauses
 *   while the pointer or focus is on the snackbar. On the web, use an auto-dismissing
 *   snackbar only alongside inline feedback for the same event: it may be gone before
 *   someone reads it. Snackbars with an action stay until acted on or dismissed.
 * - `focusShortcut` (Alt+G) moves focus to a snackbar with actions; Escape dismisses it.
 *   When it leaves, focus returns to where it was before it entered the snackbar.
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
  focusShortcut = 'Alt+G',
  className,
  ref,
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
  const rootRef = useObjectRef(ref);

  // The shortcut focuses the shown snackbar's first control, if it has one.
  useEffect(() => {
    if (!focusShortcut || !current) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || !matchesShortcut(event, focusShortcut)) return;
      const item = rootRef.current?.querySelector(`[data-snackbar-id="${current.id}"]`);
      const target = item ? firstTabbable(item) : null;
      if (!target) return;
      event.preventDefault();
      target.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [focusShortcut, current, rootRef]);

  const styles = snackbarHostStyles();
  return (
    <div
      {...rest}
      ref={rootRef}
      aria-live="polite"
      aria-atomic="false"
      className={styles.root({ class: className })}
    >
      {items.map((data) => (
        <HostItem
          key={data.id}
          data={data}
          visible={data === current}
          shortcut={
            focusShortcut &&
            (data.visuals.actionLabel !== undefined || data.visuals.withDismissAction)
              ? focusShortcut
              : undefined
          }
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
              onEscape={data.dismiss}
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
  shortcut,
  onExited,
  className,
  children,
}: {
  data: SnackbarData;
  visible: boolean;
  shortcut: string | undefined;
  onExited: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const { isPresent, isExiting, exitProps } = usePresence(visible);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Where focus was before it entered, and whether it's still inside: when the snackbar
  // leaves with focus in it, focus goes back there rather than falling to the page.
  const returnTo = useRef<HTMLElement | null>(null);
  const focusInside = useRef(false);

  useLayoutEffect(() => {
    if (visible || !focusInside.current) return;
    focusInside.current = false;
    const target = returnTo.current;
    returnTo.current = null;
    if (target?.isConnected) target.focus();
  }, [visible]);

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
      data-snackbar-id={data.id}
      aria-keyshortcuts={visible ? shortcut : undefined}
      inert={!visible}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(ref.current?.contains(document.activeElement) ?? false)}
      onFocus={(event) => {
        const from = event.relatedTarget;
        if (!focusInside.current && !event.currentTarget.contains(from as Node | null)) {
          returnTo.current = from instanceof HTMLElement ? from : null;
        }
        focusInside.current = true;
        setPaused(true);
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        // A snackbar that is leaving keeps the record, to hand focus back.
        if (visible) focusInside.current = false;
        setPaused(false);
      }}
      className={className}
    >
      {children}
    </div>
  );
}
