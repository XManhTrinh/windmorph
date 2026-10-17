'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
  type TransitionEvent,
} from 'react';
import { useThemeScope } from '../../theme/context';
import { SPRINGS } from '../../tokens/motion';
import { springWithVelocityToLinearEasing } from '../../tokens/spring-velocity';
import {
  edgeSign,
  ownsGesture,
  releaseVelocity,
  sideSwipeGesture,
  type DragSample,
  type SwipeGesture,
} from './sheet-gesture';
import { settleTarget } from './sheet-settle';

interface SideSwipeOptions {
  /** Whether a swipe may close the sheet (`swipeable`, and `closedBy` isn't `none`). */
  enabled: boolean;
  edge: 'start' | 'end';
  /** Whether the sheet is open; a close the app refuses leaves it `true`. */
  isOpen: boolean;
  close: () => void;
  /** The panel, which takes the pointer once a swipe drags it. */
  panelRef: RefObject<HTMLElement | null>;
  /** The layer that moves, whose width is the distance to closed. */
  motionRef: RefObject<HTMLElement | null>;
  /** The scrolling content, whose own `touch-action` isn't the content's. */
  contentRef: RefObject<HTMLElement | null>;
}

/** The share of the sheet's width a slow swipe must pass to close it (Compose's rail). */
const POSITIONAL_SHARE = 0.5;
/** The exit's distance, as a share of the moving layer's width (see `sheet-styles.ts`). */
const EXIT_DISTANCE = 1.12;

/**
 * Swipe to dismiss for a modal side sheet (touch and pen only; a mouse drag selects text).
 * A touch on the panel is decided past the 4px slop (`sideSwipeGesture`): a vertical move is
 * left to the browser, which scrolls the content; a sideways move away from the edge is
 * ignored; one toward it drags the sheet, unless the content under it owns that drag (a
 * field, a horizontal slider, a scroller that can still scroll that way). The sheet follows
 * the finger with no transition, clamped at its open position, and on release settles as
 * Compose's anchored drag does: a fling over 125px/s toward the edge or a drag past half its
 * width closes it, anything else springs back, both continuing at the release speed. A
 * close the app refuses (a controlled `open` left `true`) springs back too.
 *
 * Returns the panel's capture-phase pointer handlers, and the moving layer's attributes.
 */
export function useSideSwipe({
  enabled,
  edge,
  isOpen,
  close,
  panelRef,
  motionRef,
  contentRef,
}: SideSwipeOptions) {
  const { motion: scheme } = useThemeScope();
  // How far the sheet has moved toward its edge (px, 0 = open) and that way's physical sign.
  const [offset, setOffset] = useState(0);
  const [sign, setSign] = useState<1 | -1>(1);
  const [dragging, setDragging] = useState(false);
  // A settle continues at the release speed: a spring with that velocity as a `linear()`
  // easing and duration, on the moving layer until its move ends (as the bottom sheet's).
  const [settleMotion, setSettleMotion] = useState<{ easing: string; duration: number } | null>(
    null,
  );
  // A swipe asked to close; if the sheet is still open after that render, the app refused.
  const [closing, setClosing] = useState(false);
  const pointer = useRef({
    pending: false,
    gesture: 'undecided' as SwipeGesture,
    id: 0,
    x: 0,
    y: 0,
    sign: 1 as 1 | -1,
    direction: 'ltr' as 'ltr' | 'rtl',
    width: 0,
    offset: 0,
    target: null as Element | null,
    root: null as Element | null,
    samples: [] as DragSample[],
  });

  if (closing && isOpen) {
    // Refused (adjusted while rendering, before it paints): back to the open position on the
    // default spatial spring (instant under reduced motion), from where the swipe let go.
    setClosing(false);
    setSettleMotion(null);
    setOffset(0);
  }

  // Browsers that ignore `touch-action: pan-y` for a gesture already moving (and scrollers
  // inside, which give panning back to their content) are stopped from panning once the
  // swipe drags the sheet.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !enabled) return;
    const onTouchMove = (event: TouchEvent) => {
      const current = pointer.current;
      if (current.pending && current.gesture === 'drag' && event.cancelable) event.preventDefault();
    };
    panel.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => panel.removeEventListener('touchmove', onTouchMove);
  }, [enabled, panelRef]);

  const settle = (velocity: number) => {
    const current = pointer.current;
    const { width } = current;
    const target = settleTarget([0, width], 0, current.offset, velocity, width * POSITIONAL_SHARE);
    const closes = width > 0 && target >= width - 0.5;
    const end = closes ? width * EXIT_DISTANCE : 0;
    const distance = end - current.offset;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setDragging(false);
    setSettleMotion(
      reduced || Math.abs(distance) < 0.5
        ? null
        : springWithVelocityToLinearEasing(
            SPRINGS[scheme].spatial[closes ? 'fast' : 'default'],
            velocity / distance,
          ),
    );
    if (closes) {
      // The offset stays: the exit leaves from it (and, under reduced motion, fades there).
      setClosing(true);
      close();
    } else {
      setOffset(0);
    }
  };

  const reset = () => {
    pointer.current.pending = false;
    setDragging(false);
    setSettleMotion(null);
    setOffset(0);
  };

  const panelHandlers = {
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => {
      const panel = panelRef.current;
      const target = event.target as Element;
      if (!enabled || event.button !== 0 || event.pointerType === 'mouse') return;
      if (!panel?.contains(target)) return;
      // The content scrolls and sets its own `touch-action`, so it's the root of a touch on it.
      const content = contentRef.current;
      const root = content?.contains(target) ? content : panel;
      if (ownsGesture(target, root, 'x')) return;
      const direction = getComputedStyle(panel).direction === 'rtl' ? 'rtl' : 'ltr';
      setSettleMotion(null);
      pointer.current = {
        pending: true,
        gesture: 'undecided',
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        sign: edgeSign(edge, direction),
        direction,
        width: motionRef.current?.offsetWidth ?? 0,
        offset: 0,
        target,
        root,
        samples: [{ position: 0, time: event.timeStamp }],
      };
    },
    onPointerMoveCapture: (event: PointerEvent<HTMLElement>) => {
      const current = pointer.current;
      if (!current.pending || event.pointerId !== current.id) return;
      const dx = event.clientX - current.x;
      if (current.gesture === 'undecided') {
        let gesture = sideSwipeGesture(dx, event.clientY - current.y, edge, current.direction);
        if (gesture === 'undecided') return;
        if (gesture === 'drag' && current.target && current.root) {
          if (ownsGesture(current.target, current.root, 'x', dx)) gesture = 'ignore';
        }
        current.gesture = gesture;
        if (gesture !== 'drag') {
          current.pending = false;
          return;
        }
        // Taking the pointer cancels the press underneath, so a swipe that starts on a
        // button never activates it.
        panelRef.current?.setPointerCapture?.(current.id);
        setSign(current.sign);
        setDragging(true);
      }
      const travelled = dx * current.sign;
      current.samples = [...current.samples, { position: travelled, time: event.timeStamp }];
      current.offset = Math.min(current.width, Math.max(0, travelled));
      setOffset(current.offset);
    },
    onPointerUpCapture: (event: PointerEvent<HTMLElement>) => {
      const current = pointer.current;
      if (!current.pending || event.pointerId !== current.id) return;
      current.pending = false;
      if (current.gesture !== 'drag') return;
      const travelled = (event.clientX - current.x) * current.sign;
      current.offset = Math.min(current.width, Math.max(0, travelled));
      settle(releaseVelocity([...current.samples, { position: travelled, time: event.timeStamp }]));
    },
    onPointerCancelCapture: (event: PointerEvent<HTMLElement>) => {
      const current = pointer.current;
      if (!current.pending || event.pointerId !== current.id) return;
      if (current.gesture === 'drag') reset();
      else current.pending = false;
    },
  };

  const motionProps = {
    'data-dragging': dragging || undefined,
    'data-settling': settleMotion ? '' : undefined,
    style: {
      '--m3-side-sheet-offset': `${offset * sign}px`,
      ...(settleMotion && {
        transitionDuration: `${settleMotion.duration}ms`,
        transitionTimingFunction: settleMotion.easing,
      }),
    } as CSSProperties,
    onTransitionEnd: (event: TransitionEvent<HTMLElement>) => {
      if (event.target === event.currentTarget && event.propertyName === 'translate')
        setSettleMotion(null);
    },
  };

  return { panelHandlers, motionProps, dragging };
}
