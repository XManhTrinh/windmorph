'use client';

import { animate, useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useObjectRef } from 'react-aria';
import { useM3Spring } from '../../motion/use-m3-spring';
import { cn } from '../../utils/cn';
import { usePreloadWhenIdle } from '../../utils/load-on-demand';
import {
  LazyLoadingIndicator,
  preloadLoadingIndicator,
} from '../loading-indicator/lazy-loading-indicator';
import {
  POSITIONAL_THRESHOLD,
  distanceFraction,
  overshootRotation,
  passesThreshold,
} from './pull-to-refresh-math';
import { pullToRefreshStyles } from './pull-to-refresh-styles';

export interface PullToRefreshClassNames {
  root?: string;
  /**
   * The zero-height sticky layer the indicator hangs from, at the top of the area. Give it a
   * `top-*` class when a sticky app bar covers the top of a scrolling page. Its margins are
   * the library's, so the root's `gap-*` or `space-y-*` never moves the content.
   */
  layer?: string;
  /** The 48px circle holding the loading indicator. */
  indicator?: string;
}

/** Words the pull to refresh announces. */
export interface PullToRefreshLabels {
  /** The indicator's name while it follows a pull. */
  pull: string;
  /** The indicator's name while refreshing, also announced when a refresh starts. */
  refreshing: string;
  /** Announced when a refresh completes. */
  refreshed: string;
}

const DEFAULT_LABELS: PullToRefreshLabels = {
  pull: 'Pull to refresh',
  refreshing: 'Refreshing',
  refreshed: 'Refreshed',
};

/** How far a gesture moves before it's a pull or the browser's, px. */
const POINTER_SLOP = 4;

interface PullToRefreshOwnProps {
  /**
   * Whether a refresh is running. While it is, the indicator rests at the threshold as an
   * indeterminate loading indicator; when it turns `false` the indicator leaves. Set it `true`
   * from a refresh button too, and the indicator comes in the same way. Leave it out to let a
   * promise returned by `onRefresh` drive it. @default undefined (driven by `onRefresh`'s promise)
   */
  refreshing?: boolean;
  /**
   * Called when a pull is released past the threshold. Start the refresh and set
   * `refreshing`, or return a promise: without `refreshing`, the indicator stays until it
   * settles.
   */
  onRefresh: () => void | Promise<unknown>;
  /** How far the indicator travels before a release refreshes, px. @default 80 */
  threshold?: number;
  /** Turns the gesture off. A running refresh still shows its indicator. @default false */
  disabled?: boolean;
  /**
   * Words the pull to refresh announces; name them for what refreshes ("Refreshing
   * messages"). @default { pull: "Pull to refresh", refreshing: "Refreshing", refreshed: "Refreshed" }
   */
  labels?: Partial<PullToRefreshLabels>;
  /** The content: a scrolling list, grid or card collection, or a whole page. */
  children?: ReactNode;
  /** Classes for the parts: `root`, `layer` (the sticky layer at the top) and `indicator`. */
  classNames?: PullToRefreshClassNames;
}

export type PullToRefreshProps = PullToRefreshOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof PullToRefreshOwnProps>;

/** A pointer or touch gesture over the area. */
interface Gesture {
  /** The touch's identifier, or the pointer's id. */
  id: number;
  /** `touch` for touch events, otherwise the pointer type (mouse or pen). */
  source: 'touch' | 'pointer';
  startX: number;
  startY: number;
  lastY: number;
  /**
   * `tracking`: not pulling (yet). `pulling`: the indicator follows the gesture. `inert`: the
   * area claims the gesture (so the browser doesn't overscroll) but it does nothing, because a
   * refresh or a settle animation is running. `native`: the browser scrolls; hands off.
   */
  phase: 'tracking' | 'pulling' | 'inert' | 'native';
  /** Every scroll container between the gesture's target and the area is at its top. */
  atTop: boolean;
  /** How far the gesture has pulled, px (Compose's `distancePulled`). */
  pulled: number;
}

const isScrollContainer = (element: Element) =>
  /^(auto|scroll|overlay)$/.test(getComputedStyle(element).overflowY);

/**
 * Whether every scroll container from `target` up to the area's (the area itself if it
 * scrolls, else the nearest one above it, or the page) is scrolled to its top, so a downward
 * drag can't scroll anything and pulls instead.
 */
function isAtTop(target: EventTarget | null, root: HTMLElement): boolean {
  let passedRoot = false;
  for (
    let node: Element | null = target instanceof Element ? target : root;
    node;
    node = node.parentElement
  ) {
    if (node.scrollTop >= 1) return false;
    if (node === root) {
      if (isScrollContainer(node)) return true;
      passedRoot = true;
    } else if (passedRoot && isScrollContainer(node)) {
      return true;
    }
  }
  return true;
}

/**
 * Whether something between `target` and the area handles vertical drags itself (its
 * `touch-action` doesn't allow vertical panning: a vertical slider, a drawing surface), so
 * the gesture is left to it.
 */
function ownsVerticalDrag(target: EventTarget | null, root: HTMLElement): boolean {
  for (
    let node = target instanceof Element ? target : null;
    node && node !== root;
    node = node.parentElement
  ) {
    const touchAction = getComputedStyle(node).touchAction;
    if (touchAction === 'none') return true;
    if (/pan-x/.test(touchAction) && !/pan-y|pan-up|pan-down/.test(touchAction)) return true;
  }
  return false;
}

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { then?: unknown }).then === 'function';

/**
 * M3 pull to refresh: at the top of its content, a downward drag (touch, mouse or pen) pulls
 * a contained loading indicator in from the top edge, morphing with the pull. Releasing past
 * the threshold calls `onRefresh`; the indicator then rests at the threshold, as an
 * indeterminate loading indicator, until `refreshing` turns `false`. Releasing short of the
 * threshold, or pushing back up, cancels.
 *
 * Wrap a scroll container (give the root `overflow-y-auto` and a height, or put the scrolling
 * element inside it) or a whole page. Scrolling is untouched: the gesture only pulls when the
 * content is at its top and the drag goes down.
 *
 * Pulling isn't available to everyone, so also offer a refresh button that sets `refreshing`,
 * in an app bar, a menu or next to the content (the spec's accessibility guidance).
 *
 * The motion and sizes follow Compose's `PullToRefreshBox` with
 * `PullToRefreshDefaults.LoadingIndicator`: an 80px threshold, the indicator moving at half
 * the finger's speed and meeting resistance past the threshold, a 48px `primary-container`
 * circle at elevation 0, and a crossfade to the indeterminate indicator while refreshing.
 *
 * @example
 * <PullToRefresh refreshing={loading} onRefresh={reload} className="h-dvh overflow-y-auto">
 *   <List aria-label="Messages">…</List>
 * </PullToRefresh>
 */
export function PullToRefresh({
  refreshing: refreshingProp,
  onRefresh,
  threshold = POSITIONAL_THRESHOLD,
  disabled = false,
  labels: labelsProp,
  children,
  classNames,
  className,
  ref,
  ...rest
}: PullToRefreshProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [pendingRefresh, setPendingRefresh] = useState(false);
  const refreshing = refreshingProp ?? pendingRefresh;
  const fraction = useMotionValue(refreshing ? 1 : 0);
  const spring = useM3Spring('spatial', 'fast');
  const [pulling, setPulling] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  // The indicator's code (its shapes and morphing) loads on demand: when the browser is first
  // idle, or when a pull starts, whichever comes first.
  usePreloadWhenIdle(preloadLoadingIndicator, !disabled);

  const rootRef = useObjectRef(ref);
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const animatingRef = useRef(false);
  const mountedRef = useRef(true);
  // The latest props and helpers, for the native listeners added once.
  const latest = useRef({ refreshing, disabled, threshold, onRefresh, refreshingProp, spring });
  useLayoutEffect(() => {
    latest.current = { refreshing, disabled, threshold, onRefresh, refreshingProp, spring };
  });

  // The layer is the root's first child, so a consumer `gap-*` on a flex or grid root would
  // open a gap below it and push the content down. It's cancelled after every render and
  // whenever the root resizes (a responsive class may change the gap).
  const layerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (rootRef.current && layerRef.current) cancelRootGap(rootRef.current, layerRef.current);
  });
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (layerRef.current) cancelRootGap(root, layerRef.current);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      animationRef.current?.stop();
    };
  }, []);

  /** Springs the indicator to `target` (Compose's `animateToThreshold` / `animateToHidden`). */
  const settleRef = useRef((target: number) => {
    animationRef.current?.stop();
    animatingRef.current = true;
    const controls = animate(fraction, target, latest.current.spring);
    animationRef.current = controls;
    void controls.then(() => {
      if (animationRef.current === controls) animatingRef.current = false;
    });
  });

  // A refresh starting or ending moves the indicator to the threshold or away, and is
  // announced. The first render places it without either (Compose's `onAttach`).
  const previousRefreshing = useRef(refreshing);
  useEffect(() => {
    if (previousRefreshing.current === refreshing) return;
    previousRefreshing.current = refreshing;
    settleRef.current(refreshing ? 1 : 0);
    setAnnouncement(refreshing ? labels.refreshing : labels.refreshed);
  }, [refreshing, labels.refreshing, labels.refreshed]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let gesture: Gesture | null = null;
    let suppressClick = false;

    const begin = (
      source: Gesture['source'],
      id: number,
      x: number,
      y: number,
      target: EventTarget | null,
    ) => {
      const { disabled: off } = latest.current;
      gesture =
        off || ownsVerticalDrag(target, root)
          ? null
          : {
              id,
              source,
              startX: x,
              startY: y,
              lastY: y,
              phase: 'tracking',
              atTop: isAtTop(target, root),
              pulled: 0,
            };
      // A pull may start: the indicator's code loads now (if the idle preload hasn't loaded it
      // yet), well before the gesture passes the slop and the indicator shows. A failed load is
      // tried again by the indicator itself.
      if (gesture?.atTop) void preloadLoadingIndicator().catch(() => undefined);
    };

    /** Moves the gesture to `y`; returns whether the area took the movement. */
    const move = (x: number, y: number, cancelable: boolean): boolean => {
      const current = gesture;
      if (!current || current.phase === 'native') return false;
      const dy = y - current.lastY;
      current.lastY = y;
      if (current.phase === 'tracking') {
        const totalX = x - current.startX;
        const totalY = y - current.startY;
        const distance = Math.max(Math.abs(totalX), Math.abs(totalY));
        // A mouse or pen must move past the slop first, so a click stays a click.
        if (current.source === 'pointer' && distance <= POINTER_SLOP) return false;
        const downward = totalY > 0 && totalY >= Math.abs(totalX) && current.atTop;
        if (!downward || !cancelable) {
          // Sideways, upward or mid-scroll: the browser's for the rest of the gesture. A
          // touch gets the same slop before it's decided, against a finger's jitter.
          if (!cancelable || distance > POINTER_SLOP) current.phase = 'native';
          return false;
        }
        const { refreshing: busy } = latest.current;
        if (busy || animatingRef.current) {
          current.phase = 'inert';
          return true;
        }
        current.phase = 'pulling';
        // A mouse or pen pull starts at the slop, so the indicator doesn't jump.
        current.pulled = Math.max(0, totalY - (current.source === 'pointer' ? POINTER_SLOP : 0));
        setPulling(true);
        fraction.set(distanceFraction(current.pulled, latest.current.threshold));
        return true;
      }
      if (current.phase === 'inert') return true;
      // Pulling: up and down both move the indicator (Compose's pre- and post-scroll).
      current.pulled = Math.max(0, current.pulled + dy);
      fraction.set(distanceFraction(current.pulled, latest.current.threshold));
      if (current.pulled === 0) {
        // Pushed all the way back: the gesture may scroll the content again.
        current.phase = 'tracking';
        current.startX = x;
        current.startY = y;
        current.atTop = true;
        setPulling(false);
      }
      return true;
    };

    /** Ends the gesture (Compose's `onRelease`); `cancel` never refreshes. */
    const end = (cancel: boolean) => {
      const current = gesture;
      gesture = null;
      if (!current || current.phase !== 'pulling') return;
      setPulling(false);
      if (current.source === 'pointer') {
        // A mouse pull ends with a click on whatever is under the pointer; it isn't one. The
        // click comes before any timer.
        suppressClick = true;
        setTimeout(() => {
          suppressClick = false;
        });
      }
      const { threshold: limit, refreshingProp: controlled } = latest.current;
      if (!cancel && passesThreshold(current.pulled, limit)) {
        const result = latest.current.onRefresh();
        if (controlled === undefined && isThenable(result)) {
          setPendingRefresh(true);
          const done = () => {
            if (mountedRef.current) setPendingRefresh(false);
          };
          result.then(done, done);
        }
      }
      // Compose hides the indicator here; a refresh that starts moves it to the threshold.
      settleRef.current(0);
    };

    const touchOf = (event: TouchEvent) =>
      gesture === null
        ? undefined
        : [...event.changedTouches].find((touch) => touch.identifier === gesture?.id);

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        // A second finger (pinch to zoom) ends the pull without refreshing.
        end(true);
        return;
      }
      const touch = event.changedTouches[0];
      if (touch) begin('touch', touch.identifier, touch.clientX, touch.clientY, event.target);
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = touchOf(event);
      if (!touch || event.defaultPrevented) return;
      if (move(touch.clientX, touch.clientY, event.cancelable) && event.cancelable) {
        event.preventDefault();
      }
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (touchOf(event)) end(event.type === 'touchcancel');
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) return;
      begin('pointer', event.pointerId, event.clientX, event.clientY, event.target);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (gesture?.source !== 'pointer' || event.pointerId !== gesture.id) return;
      const wasPulling = gesture.phase === 'pulling';
      if (!move(event.clientX, event.clientY, true)) return;
      event.preventDefault();
      if (!wasPulling && gesture?.phase === 'pulling') {
        root.setPointerCapture?.(event.pointerId);
        // A mouse drag would otherwise select the text it passes.
        window.getSelection()?.removeAllRanges();
      }
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (gesture?.source !== 'pointer' || event.pointerId !== gesture.id) return;
      end(event.type === 'pointercancel');
    };
    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const options = { passive: false } as const;
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, options);
    root.addEventListener('touchend', onTouchEnd);
    root.addEventListener('touchcancel', onTouchEnd);
    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerup', onPointerEnd);
    root.addEventListener('pointercancel', onPointerEnd);
    root.addEventListener('click', onClick, { capture: true });
    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchEnd);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerEnd);
      root.removeEventListener('pointercancel', onPointerEnd);
      root.removeEventListener('click', onClick, { capture: true });
    };
  }, [fraction, rootRef]);

  const styles = pullToRefreshStyles();

  return (
    <div
      {...rest}
      ref={rootRef}
      data-pulling={pulling || undefined}
      data-refreshing={refreshing || undefined}
      data-disabled={disabled || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div
        ref={layerRef}
        className={styles.layer({ class: classNames?.layer })}
        style={{ '--m3-pull-to-refresh-threshold': `${threshold}px` } as CSSProperties}
      >
        <div className={styles.clip()}>
          <PullIndicator
            fraction={fraction}
            refreshing={refreshing}
            threshold={threshold}
            labels={labels}
            className={styles.indicator({ class: classNames?.indicator })}
            faceClassName={styles.face()}
          />
        </div>
        <span role="status" className="sr-only">
          {announcement}
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * Keeps the root's own spacing from opening below the zero-height layer. Its margins are the
 * library's: zero, so a `space-y-*` root doesn't push the content down, and in a flex root a
 * negative margin as large as the gap along the main axis. In a grid root it also moves to an
 * implicit row of its own before the first one, across every column, so the content keeps its
 * rows and columns.
 */
function cancelRootGap(root: HTMLElement, layer: HTMLElement) {
  const style = getComputedStyle(root);
  const grid = style.display.endsWith('grid');
  const flex = style.display.endsWith('flex');
  const row = flex && style.flexDirection.startsWith('row');
  const reverse = flex && style.flexDirection.endsWith('reverse');
  const gap = Number.parseFloat(row ? style.columnGap : style.rowGap);
  for (const side of ['BlockStart', 'BlockEnd', 'InlineStart', 'InlineEnd'] as const) {
    layer.style[`margin${side}`] = '0px';
  }
  if ((grid || flex) && gap > 0) {
    layer.style[`margin${row ? 'Inline' : 'Block'}${reverse ? 'Start' : 'End'}`] = `${-gap}px`;
  }
  layer.style.gridRow = grid ? 'span 1 / 1' : '';
  layer.style.gridColumn = grid ? '1 / -1' : '';
}

/**
 * The indicator, subscribed to the pull on its own so a pull re-renders only it, never the
 * content. Hidden at rest; while pulled it is a determinate loading indicator following the
 * pull, and while refreshing an indeterminate one, crossfading between them.
 */
function PullIndicator({
  fraction,
  refreshing,
  threshold,
  labels,
  className,
  faceClassName,
}: {
  fraction: MotionValue<number>;
  refreshing: boolean;
  threshold: number;
  labels: PullToRefreshLabels;
  className: string;
  faceClassName: string;
}) {
  const [value, setValue] = useState(() => fraction.get());
  useMotionValueEvent(fraction, 'change', setValue);
  if (value <= 0 && !refreshing) return null;
  const rotation = overshootRotation(value);
  return (
    <div
      data-indicator=""
      className={className}
      // Compose's `translationY = distanceFraction × maxDistance − height`.
      style={{ transform: `translateY(calc(${value * threshold}px - 100%))` }}
    >
      <div
        data-active={!refreshing}
        aria-hidden={refreshing || undefined}
        className={faceClassName}
        style={rotation === 0 ? undefined : { transform: `rotate(${rotation}deg)` }}
      >
        <LazyLoadingIndicator
          variant="contained"
          value={Math.min(Math.max(value, 0), 1)}
          aria-label={labels.pull}
        />
      </div>
      <div
        data-active={refreshing}
        aria-hidden={!refreshing || undefined}
        className={faceClassName}
      >
        <LazyLoadingIndicator variant="contained" aria-label={labels.refreshing} />
      </div>
    </div>
  );
}
