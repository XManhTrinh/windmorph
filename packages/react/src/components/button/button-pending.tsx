'use client';

import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useObjectRef } from 'react-aria';
import { usePresence } from '../../primitives/use-presence';
import { announcePolite, prepareAnnouncer } from '../../utils/announce';
import { usePreloadOnIntent } from '../../utils/load-on-demand';
import {
  LazyLoadingIndicator,
  preloadLoadingIndicator,
} from '../loading-indicator/lazy-loading-indicator';
import type { ButtonSize } from './button-styles';

/** Words a `Button` or `IconButton` announces. */
export interface ButtonLabels {
  /** Added to the accessible name while `pending` ("Save, Loading"). @default "Loading" */
  pending: string;
}

const DEFAULT_LABELS: ButtonLabels = { pending: 'Loading' };

/**
 * The indicator's size per button size: the icon's size, but never under M3's 24px minimum
 * for a loading indicator ("It should be between 24dp to 240dp").
 */
export const PENDING_INDICATOR_SIZE: Record<ButtonSize, number> = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 32,
  xl: 40,
};

/**
 * The swap between the content and the indicator: a crossfade on the fast effects spring
 * (opacity never overshoots), held back 200ms on the way in (M3's lower bound for a loading
 * indicator) so a quick action never flashes, and immediate on the way out. Both share the
 * content wrapper's one grid cell, so the button keeps its width.
 */
const fade =
  'transition-opacity duration-(--md-sys-motion-spring-effects-fast-duration) ease-(--md-sys-motion-spring-effects-fast-easing)';

export const pendingClasses = {
  /** The content wrapper, once the button takes a `pending` prop: one grid cell. */
  content: 'inline-grid',
  /** What the indicator replaces (an icon button's icon), in the cell; hidden once it shows. */
  replaced: `[grid-area:1/1] ${fade} [[data-pending-shown]>&]:opacity-0 [[data-pending-shown]>&]:delay-200`,
  /** A button's icon and label, laid out as the content was, in the cell. */
  faces: 'inline-flex items-center justify-center gap-[inherit]',
  /**
   * The indicator's slot, in the same cell: a zero-size box centred in it, so the indicator
   * (as big as the icon, at least 24px) never changes the button's size, even where it's larger
   * than the icon. Its colour is the content colour (M3's 3:1 rule for an indicator in a button).
   */
  indicator: `pointer-events-none flex size-0 items-center justify-center self-center justify-self-center overflow-visible opacity-0 [grid-area:1/1] ${fade} [[data-pending-shown]>&]:opacity-100 [[data-pending-shown]>&]:delay-200`,
} as const;

/**
 * The indicator takes the content colour, so it reads wherever the label does (M3: an indicator
 * in a button needs 3:1 against it). A progress indicator given as `pendingIndicator` gets M3's
 * "Progress indicators in buttons" treatment too: the label's colour, and no track.
 */
const indicatorColor = {
  '--md-comp-loading-indicator-active-indicator-color': 'currentColor',
  '--md-comp-progress-indicator-active-indicator-color': 'currentColor',
  '--md-comp-progress-indicator-track-color': 'transparent',
} as CSSProperties;

interface PendingOptions<E extends HTMLElement> {
  pending: boolean | undefined;
  pendingIndicator: ReactElement | undefined;
  labels: Partial<ButtonLabels> | undefined;
  size: ButtonSize;
  ariaLabel: string | undefined;
  ariaLabelledby: string | undefined;
  ref: Ref<E> | undefined;
  /** Classes for the indicator's slot (`classNames.pendingIndicator`). */
  indicatorClassName: string | undefined;
}

/** Text of `node` as a screen reader reads it: `aria-hidden` subtrees left out. */
function readableText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node instanceof Element && node.getAttribute('aria-hidden') === 'true') return '';
  return Array.from(node.childNodes, readableText).join('');
}

/** The element's accessible name, for the cases a button can be named by. */
function accessibleName(element: HTMLElement): string {
  const labelledby = element.getAttribute('aria-labelledby');
  if (labelledby) {
    return labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
  }
  return element.getAttribute('aria-label') ?? readableText(element).trim();
}

/**
 * The pending state of `Button` and `IconButton` (React Aria's pending `Button`): the props for
 * the root, the accessible-name suffix, and the indicator's slot.
 *
 * - The name gains `labels.pending` while pending, from the first frame: appended to an
 *   `aria-label`, an extra id on `aria-labelledby`, or a visually hidden suffix at the end of the label.
 * - When it turns on while focus is in the button, the new name is announced politely, once.
 * - The indicator (the core's `LoadingIndicator`, loaded on demand, or `pendingIndicator`) is
 *   preloaded once the button takes a `pending` prop at all, when the browser is idle or the
 *   pointer or focus arrives. The content hides only once the indicator is mounted
 *   (`data-pending-shown`), so a server-rendered pending button shows its label until then.
 */
export function useButtonPending<E extends HTMLElement>({
  pending: pendingProp,
  pendingIndicator,
  labels: labelsProp,
  size,
  ariaLabel,
  ariaLabelledby,
  ref: refProp,
  indicatorClassName,
}: PendingOptions<E>) {
  const takesPending = pendingProp !== undefined;
  const pending = pendingProp === true;
  const custom = pendingIndicator !== undefined;
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const hiddenId = useId();

  // The element, for the announcement and the preload; it also forwards to the app's ref.
  const ref = useObjectRef(refProp);

  usePreloadOnIntent(ref, preloadLoadingIndicator, takesPending && !custom);
  useEffect(() => {
    if (takesPending) prepareAnnouncer();
  }, [takesPending]);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!pending || custom || loaded) return;
    let live = true;
    preloadLoadingIndicator().then(
      () => live && setLoaded(true),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [pending, custom, loaded]);

  const shown = pending && (custom || loaded);
  const { isPresent, exitProps } = usePresence(shown);

  useEffect(() => {
    const element = ref.current;
    if (!pending || !element || !element.contains(document.activeElement)) return;
    // The name already carries the suffix, as it does for a screen reader.
    const name = accessibleName(element);
    if (name) announcePolite(name);
  }, [ref, pending]);

  let nameProps: { 'aria-label'?: string; 'aria-labelledby'?: string } = {};
  let hiddenName: ReactNode = null;
  let nameSuffix: ReactNode = null;
  if (pending) {
    if (ariaLabelledby) {
      nameProps = { 'aria-labelledby': `${ariaLabelledby} ${hiddenId}` };
      hiddenName = (
        <span id={hiddenId} hidden>
          {labels.pending}
        </span>
      );
    } else if (ariaLabel) {
      nameProps = { 'aria-label': `${ariaLabel}, ${labels.pending}` };
    } else {
      // Inline text at the label's end, sized to nothing: browsers join the text of a block,
      // a grid item or an absolutely positioned box (`sr-only`) to the label with a space
      // ("Save , Loading"), but run inline text on ("Save, Loading").
      nameSuffix = <span className="text-[0px]">{`, ${labels.pending}`}</span>;
    }
  }

  const indicator = takesPending ? (
    <span
      aria-hidden="true"
      data-slot="pending-indicator"
      className={indicatorClassName}
      style={indicatorColor}
      {...exitProps}
    >
      {isPresent &&
        (pendingIndicator ?? (
          <LazyLoadingIndicator size={PENDING_INDICATOR_SIZE[size]} aria-label={labels.pending} />
        ))}
    </span>
  ) : null;

  return {
    /** Whether the content wrapper holds the grid cell (the button takes `pending`). */
    takesPending,
    rootProps: { ref, ...nameProps, 'data-pending': pending || undefined },
    contentProps: { 'data-pending-shown': shown || undefined },
    /** The element `aria-labelledby` adds while pending, anywhere in the button. */
    hiddenName,
    /** The suffix of a name taken from the content, to put at the end of the label's text. */
    nameSuffix,
    indicator,
  };
}
