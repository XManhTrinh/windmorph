'use client';

import {
  createContext,
  useContext,
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
import { announcePolite, LIVE_REGION_DELAY } from '../../utils/announce';
import { cn } from '../../utils/cn';
import { firstTabbable, tabbables } from '../../utils/focus';
import { matchesShortcut } from '../../utils/shortcut';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { durationMillis, SnackbarHostState, type SnackbarData } from './snackbar-state';
import { snackbarHostStyles, snackbarStyles } from './snackbar-styles';
import { mergeDataTokens } from '../../utils/merge-data-tokens';

/** Whether a snackbar is inside a {@link SnackbarHost}, whose live region announces it. */
const InSnackbarHost = createContext(false);

/** Material Symbols "close" (Apache-2.0). */
function CloseIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

export interface SnackbarClassNames {
  /** The snackbar's container. */
  root?: string;
  /** The message text. */
  message?: string;
  /** The row holding the action and dismiss buttons. */
  actions?: string;
  /** The action button. */
  action?: string;
  /** The dismiss (×) button. */
  dismiss?: string;
}

export interface SnackbarLabels {
  /** Name of the dismiss (×) button. @default "Dismiss" */
  dismiss: string;
}

const DEFAULT_LABELS: SnackbarLabels = { dismiss: 'Dismiss' };

interface SnackbarOwnProps {
  /** The message. */
  children: React.ReactNode;
  /** Label of the action button. */
  actionLabel?: string;
  /** Called when the action button is pressed. */
  onAction?: () => void;
  /** Shows a dismiss (×) button that calls this. Escape calls it too. */
  onDismiss?: () => void;
  /**
   * Called on Escape while focus is inside, which dismisses a snackbar with or without the ×
   * button. @default onDismiss
   */
  onEscape?: () => void;
  /** Words the snackbar announces, with English defaults. */
  labels?: Partial<SnackbarLabels>;
  /** Put the actions under the message, for long action labels. @default false */
  actionOnNewLine?: boolean;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: SnackbarClassNames;
}

export type SnackbarProps = SnackbarOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof SnackbarOwnProps>;

/**
 * M3 snackbar: a brief message about an app process, with an optional action and dismiss
 * button. Usually shown through a {@link SnackbarHost}; render it directly for custom
 * placement. Escape dismisses it while focus is inside (`onEscape`, or `onDismiss`).
 *
 * Outside a host it announces its message politely itself, when it appears and when the
 * message changes, without moving focus (the host's live region does this inside one).
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
  labels: labelsProp,
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
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const hasActions = actionLabel !== undefined || onDismiss !== undefined;
  const inHost = useContext(InSnackbarHost);
  const messageRef = useRef<HTMLDivElement>(null);
  const announced = useRef('');
  // Runs after every render, but announces only a new message.
  useEffect(() => {
    if (inHost) return;
    const text = messageRef.current?.textContent?.trim() ?? '';
    if (!text || text === announced.current) return;
    announced.current = text;
    announcePolite(text);
  });
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
      // The component tokens' hook (snackbar-tokens.ts).
      data-tokens={mergeDataTokens('md-comp-snackbar', rest)}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div ref={messageRef} className={styles.message({ class: classNames?.message })}>
        {children}
      </div>
      {hasActions && (
        <div className={styles.actions({ class: classNames?.actions })}>
          {actionLabel !== undefined && (
            <Button
              variant="text"
              onPress={onAction}
              data-slot="action"
              className={styles.action({ class: classNames?.action })}
            >
              {actionLabel}
            </Button>
          )}
          {onDismiss && (
            <IconButton
              variant="standard"
              // The snackbar keeps its 48px height at every density, as a dialog header does.
              density={0}
              icon={<CloseIcon />}
              aria-label={labels.dismiss}
              onPress={onDismiss}
              data-slot="dismiss"
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
  /** The queue of snackbars to show, from `useSnackbarHostState()`. */
  state: SnackbarHostState;
  /** Renders each snackbar; defaults to {@link Snackbar}. */
  snackbar?: (data: SnackbarData) => React.ReactNode;
  /** Words each default snackbar announces, with English defaults. */
  labels?: Partial<SnackbarLabels>;
  /**
   * The key combination that moves focus to a snackbar with actions, as the spec asks for on
   * the web. F6 by default, the browsers' key for moving between a page's regions and React
   * Aria's for its toasts. Document it where your app lists its shortcuts. `false` turns it off.
   * @default "F6"
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
 * - The live region is rendered empty first: a snackbar shown before the host mounts (one
 *   at launch) appears once the region has been registered, so it's announced.
 * - `focusShortcut` (F6) moves focus to a snackbar with actions; Escape dismisses it.
 *   When it leaves, focus returns to where it was before it entered the snackbar; if that
 *   element is gone (an undone row was removed, say), to the control that followed it in
 *   the Tab order, or else the one before it.
 *
 * @example
 * const snackbar = useSnackbarHostState();
 * <SnackbarHost state={snackbar} className="fixed inset-x-0 bottom-0" />
 * snackbar.showSnackbar({ message: 'Saved' });
 */
export function SnackbarHost({
  state,
  snackbar,
  labels,
  focusShortcut = 'F6',
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
  // Screen readers often skip content that arrives with its live region, so snackbars go in
  // only once the empty region has been on the page for a moment.
  const [regionReady, setRegionReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setRegionReady(true), LIVE_REGION_DELAY);
    return () => clearTimeout(timer);
  }, []);

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
      {(regionReady ? items : []).map((data) => (
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
              labels={labels}
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
  const returnTo = useRef<FocusReturn | null>(null);
  const focusInside = useRef(false);

  useLayoutEffect(() => {
    if (visible || !focusInside.current) return;
    focusInside.current = false;
    const record = returnTo.current;
    returnTo.current = null;
    if (record) focusFirstAvailable(record);
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
          returnTo.current =
            from instanceof HTMLElement ? focusReturn(from, event.currentTarget) : null;
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
      <InSnackbarHost value>{children}</InSnackbarHost>
    </div>
  );
}

/** Where focus goes back to when a snackbar leaves, with fallbacks in Tab order. */
interface FocusReturn {
  target: HTMLElement;
  next: HTMLElement | null;
  previous: HTMLElement | null;
}

/**
 * Records `target` with its neighbours in the page's Tab order (leaving out the snackbar),
 * taken as focus enters the snackbar, so focus has somewhere sensible to go if `target` is
 * removed while the snackbar is open (APG: when the element that had focus is gone, move
 * focus to a logical place rather than letting it fall to the page).
 */
function focusReturn(target: HTMLElement, snackbar: Element): FocusReturn {
  const order = tabbables(target.ownerDocument.body, (el) => snackbar.contains(el));
  const isOutside = (el: HTMLElement) => !el.contains(target) && !target.contains(el);
  const next =
    order.find(
      (el) =>
        isOutside(el) && target.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
    ) ?? null;
  const previous =
    order.findLast(
      (el) =>
        isOutside(el) && target.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING,
    ) ?? null;
  return { target, next, previous };
}

function focusFirstAvailable({ target, next, previous }: FocusReturn) {
  const available = [target, next, previous].find(
    (el) => el?.isConnected && !el.closest('[inert]') && !el.matches(':disabled'),
  );
  // The element may have scrolled out of view while the snackbar had focus; returning
  // focus never scrolls the page back to it (2026-10-15).
  available?.focus({ preventScroll: true });
}
