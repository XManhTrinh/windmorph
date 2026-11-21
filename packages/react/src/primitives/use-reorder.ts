'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Key,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

/** Where a move by action takes a row. */
export type ReorderWhere = 'up' | 'down' | 'top' | 'bottom';

/** One change of place, as `onReorder` reports it. */
export interface ReorderMove<K extends Key = Key> {
  key: K;
  from: number;
  to: number;
}

export interface ReorderOptions<K extends Key = Key> {
  /** The rows' keys, in the order shown (controlled). */
  keys: readonly K[];
  /** The element holding the rows; each row carries `itemProps(key)`. */
  listRef: RefObject<HTMLElement | null>;
  /** Called once, on a drop or a move by action, with every key in the new order. */
  onReorder: (keys: K[], move: ReorderMove<K>) => void;
  /** Whether a row can move; one that can't is a wall nothing passes. @default every row */
  isMovable?: (key: K) => boolean;
  /** Called as a drag starts, ends (dropped or not) and when it's cancelled. */
  onDragChange?: (event: { key: K; phase: 'start' | 'drop' | 'cancel'; to?: number }) => void;
  /** How far the pointer moves before a press becomes a drag, in px. @default 4 */
  threshold?: number;
  /** How near a scroller's edge it starts to scroll while dragging, in px. @default 48 */
  scrollEdge?: number;
  /**
   * The slide of rows changing place (a CSS transition's duration and easing); none: at once.
   * The hook doesn't read reduced motion: pass a duration that resolves to 0 there (a motion
   * token does), or leave the slide out.
   */
  slide?: { duration: string; easing: string };
}

export interface ReorderResult<K extends Key = Key> {
  /** The row being dragged, once past the threshold. */
  dragged: K | null;
  /** Where the dragged row would land. */
  target: number | null;
  /** The row a move or a drop last moved, until the next; the caller keeps focus on it. */
  lastMoved: { key: K; by: 'drag' | 'action' } | null;
  /** Props for a row's element. */
  itemProps: (key: K) => {
    'data-reorder-key': string;
    'data-dragged'?: true;
    style?: CSSProperties;
  };
  /**
   * Props for a row's handle: the drag starts from it. Its `style` holds `touch-action: none`,
   * since only CSS stops a finger on the handle from scrolling the page instead of dragging; merge
   * it with the handle's own style.
   */
  handleProps: (key: K) => {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    style: CSSProperties;
  };
  /** Moves a row by action. */
  move: (key: K, where: ReorderWhere) => void;
  /** Whether that move leads somewhere. */
  canMove: (key: K, where: ReorderWhere) => boolean;
  /** Cancels a drag under way: the row goes back. */
  cancel: () => void;
}

interface Drag<K> {
  key: K;
  from: number;
  pointerId: number;
  startY: number;
  /** Past the threshold. */
  lifted: boolean;
  /** Each row's top and height at the lift, in the list's own coordinates (scroll included). */
  boxes: { top: number; height: number }[];
  /** The gap between rows, read at the lift. */
  gap: number;
  /** The scroller's offset at the lift. */
  scrollStart: number;
  scroller: HTMLElement | null;
  /** The pointer's last y. */
  y: number;
  /** Where it may go: between the walls either side of it. */
  min: number;
  max: number;
}

const rowOf = (list: HTMLElement, key: Key) =>
  list.querySelector<HTMLElement>(`[data-reorder-key="${CSS.escape(String(key))}"]`);

/** The nearest ancestor that scrolls up and down, or null for the window. */
function scrollerOf(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement;
  while (node && node !== node.ownerDocument.body && node !== node.ownerDocument.documentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

const scrollTop = (scroller: HTMLElement | null, element: HTMLElement) =>
  scroller ? scroller.scrollTop : (element.ownerDocument.defaultView?.scrollY ?? 0);

const HANDLE_STYLE: CSSProperties = { touchAction: 'none' };

/**
 * Whether a slide's duration is none at all (`0s`, `0ms`, or a `var()` that resolves to one), read
 * on the row so a token set on it or above counts. No `transitionend` follows such a transition.
 */
function isInstant(row: HTMLElement, duration: string): boolean {
  const computed = row.ownerDocument.defaultView?.getComputedStyle(row);
  const resolved = duration.replace(
    /var\(\s*(--[\w-]+)\s*(?:,([^)]*))?\)/g,
    (_, name: string, fallback?: string) =>
      computed?.getPropertyValue(name).trim() || fallback?.trim() || '',
  );
  return /^\s*[+-]?0*\.?0*m?s\s*$/.test(resolved) && /\d/.test(resolved);
}

/** The keys with one moved from `from` to `to`. */
function moved<K>(keys: readonly K[], from: number, to: number): K[] {
  const next = keys.slice();
  const [key] = next.splice(from, 1);
  next.splice(to, 0, key as K);
  return next;
}

/** Splits a computed list value at its top-level commas (an easing holds commas of its own). */
function splitList(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

/**
 * The row's own transitions (its classes' and the app's inline one, a running slide set
 * aside), written out, or '' when it has none. A slide is added to them, never put in their place, so a row's own
 * fades (a lifted row's shadow going) still run while it slides.
 */
function ownTransition(row: HTMLElement, inline: string): string {
  row.style.transition = inline;
  const computed = row.ownerDocument.defaultView?.getComputedStyle(row);
  if (!computed) return '';
  const properties = splitList(computed.transitionProperty);
  const durations = splitList(computed.transitionDuration);
  const easings = splitList(computed.transitionTimingFunction);
  const delays = splitList(computed.transitionDelay);
  const entries = properties.flatMap((property, index) => {
    const duration = durations[index % durations.length] ?? '0s';
    const delay = delays[index % delays.length] ?? '0s';
    if (property === 'none' || (/^0m?s$/.test(duration) && /^0m?s$/.test(delay))) return [];
    return [`${property} ${duration} ${easings[index % easings.length] ?? 'ease'} ${delay}`];
  });
  return entries.join(', ');
}

/**
 * Each sliding row's way to drop its slide listener, and the inline transition it had before
 * (an app's own, or none), put back when the slide ends.
 */
const slides = new WeakMap<HTMLElement, { stop: () => void; inline: string }>();

/**
 * The engine of a list whose rows a person puts in order (docs/plans/list-reorder.md): a drag
 * from a row's handle that the row itself follows while the rows it passes slide out of its way,
 * moves by action (up, down, to the top or the bottom), and a cancel. It has no look and no
 * words: the component gives both, and keeps focus on `lastMoved`. The order is controlled:
 * `onReorder` is called once, on the drop or the action.
 */
export function useReorder<K extends Key>({
  keys,
  listRef,
  onReorder,
  isMovable,
  onDragChange,
  threshold = 4,
  scrollEdge = 48,
  slide,
}: ReorderOptions<K>): ReorderResult<K> {
  const [dragged, setDragged] = useState<K | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [lastMoved, setLastMoved] = useState<ReorderResult<K>['lastMoved']>(null);
  const drag = useRef<Drag<K> | null>(null);
  const latest = useRef({ keys, onReorder, isMovable, onDragChange, slide });
  useLayoutEffect(() => {
    latest.current = { keys, onReorder, isMovable, onDragChange, slide };
  });
  /** Each row's top on screen before a change of order, for the slide after it (FLIP). */
  const before = useRef<Map<Key, number> | null>(null);
  const frame = useRef(0);
  const stopListening = useRef<() => void>(() => undefined);

  const movable = useCallback((key: K) => isMovable?.(key) ?? true, [isMovable]);

  /** The range a row at `index` may move in: up to the walls either side of it. */
  const range = useCallback(
    (index: number) => {
      const all = keys;
      let min = index;
      while (min > 0 && movable(all[min - 1] as K)) min -= 1;
      let max = index;
      while (max < all.length - 1 && movable(all[max + 1] as K)) max += 1;
      return { min, max };
    },
    [keys, movable],
  );

  /** Remembers where every row is on screen, so the next order can slide from there. */
  const recordPlaces = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const places = new Map<Key, number>();
    for (const key of latest.current.keys) {
      const row = rowOf(list, key);
      if (row) places.set(key, row.getBoundingClientRect().top);
    }
    before.current = places;
  }, [listRef]);

  const end = useCallback(
    (phase: 'drop' | 'cancel') => {
      const current = drag.current;
      stopListening.current();
      cancelAnimationFrame(frame.current);
      drag.current = null;
      if (!current) return;
      if (!current.lifted) return;
      const to = target ?? current.from;
      if (phase === 'drop' && to !== current.from) {
        recordPlaces();
        const keysNow = latest.current.keys;
        setLastMoved({ key: current.key, by: 'drag' });
        latest.current.onReorder(moved(keysNow, current.from, to), {
          key: current.key,
          from: current.from,
          to,
        });
      } else {
        recordPlaces();
      }
      latest.current.onDragChange?.({ key: current.key, phase, to });
      setDragged(null);
      setTarget(null);
      setOffset(0);
    },
    [target, recordPlaces],
  );

  // `end` reads `target`, so the listeners call the latest one.
  const endRef = useRef(end);
  useLayoutEffect(() => {
    endRef.current = end;
  }, [end]);

  /** Places the dragged row under the pointer and works out where it would land. */
  const follow = useCallback(() => {
    const current = drag.current;
    const list = listRef.current;
    if (!current?.lifted || !list) return;
    const scrolled = scrollTop(current.scroller, list) - current.scrollStart;
    const dy = current.y - current.startY + scrolled;
    const box = current.boxes[current.from]!;
    const centre = box.top + box.height / 2 + dy;
    let to = current.from;
    // Down: past the middle of each row below; up: above the middle of each row above.
    while (
      to < current.max &&
      centre > current.boxes[to + 1]!.top + current.boxes[to + 1]!.height / 2
    ) {
      to += 1;
    }
    while (
      to > current.min &&
      centre < current.boxes[to - 1]!.top + current.boxes[to - 1]!.height / 2
    ) {
      to -= 1;
    }
    // Held inside the rows it may move between.
    const top = current.boxes[current.min]!.top - box.top;
    const last = current.boxes[current.max]!;
    const bottom = last.top + last.height - (box.top + box.height);
    setOffset(Math.min(Math.max(dy, top), bottom));
    setTarget(to);
  }, [listRef]);

  const lift = useCallback(() => {
    const current = drag.current;
    const list = listRef.current;
    if (!current || !list) return;
    // Rows still sliding from a move end their slide where it lands, so the boxes are measured
    // in place and a row grabbed mid-slide follows the pointer at once. Clearing the inline
    // transition alone doesn't stop a running one (the computed `all 0s` still matches
    // `translate`): `none` does, and the layout read below takes the rows where they land.
    // Then the inline transition goes, so a row's own transitions (a lift's shadow) stay.
    const sliding: [HTMLElement, string][] = [];
    for (const key of latest.current.keys) {
      const row = rowOf(list, key);
      const slide = row && slides.get(row);
      if (!row || !slide) continue;
      slide.stop();
      row.style.transition = 'none';
      sliding.push([row, slide.inline]);
    }
    const scroller = scrollerOf(list);
    const listTop = list.getBoundingClientRect().top;
    current.boxes = latest.current.keys.map((key) => {
      const box = rowOf(list, key)?.getBoundingClientRect();
      return { top: (box?.top ?? 0) - listTop, height: box?.height ?? 0 };
    });
    for (const [row, inline] of sliding) row.style.transition = inline;
    const a = current.boxes[0];
    const b = current.boxes[1];
    current.gap = a && b ? Math.max(0, b.top - (a.top + a.height)) : 0;
    current.scroller = scroller;
    current.scrollStart = scrollTop(scroller, list);
    current.lifted = true;
    setDragged(current.key);
    setTarget(current.from);
    latest.current.onDragChange?.({ key: current.key, phase: 'start' });
    // Scrolls while the pointer is near the scroller's edge, faster nearer it, each frame
    // until the drag ends.
    const tick = () => {
      const now = drag.current;
      if (!now?.lifted) return;
      const view = now.scroller?.getBoundingClientRect() ?? {
        top: 0,
        bottom: list.ownerDocument.defaultView?.innerHeight ?? 0,
      };
      let speed = 0;
      if (now.y < view.top + scrollEdge) speed = -(view.top + scrollEdge - now.y);
      else if (now.y > view.bottom - scrollEdge) speed = now.y - (view.bottom - scrollEdge);
      if (speed !== 0) {
        const step = Math.round((Math.min(Math.abs(speed), scrollEdge) / scrollEdge) * 16);
        const signed = speed < 0 ? -step : step;
        if (now.scroller) now.scroller.scrollTop += signed;
        else list.ownerDocument.defaultView?.scrollBy(0, signed);
        follow();
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [listRef, scrollEdge, follow]);

  const handleProps = useCallback(
    (key: K) => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0 || !event.isPrimary || drag.current) return;
        const from = keys.indexOf(key);
        if (from < 0 || !movable(key)) return;
        const window = event.currentTarget.ownerDocument.defaultView;
        if (!window) return;
        // No text is selected while the handle is held (`style` stops touch scrolling).
        event.preventDefault();
        const { min, max } = range(from);
        drag.current = {
          key,
          from,
          pointerId: event.pointerId,
          startY: event.clientY,
          y: event.clientY,
          lifted: false,
          boxes: [],
          gap: 0,
          scrollStart: 0,
          scroller: null,
          min,
          max,
        };
        const onMove = (move: PointerEvent) => {
          const current = drag.current;
          if (!current || move.pointerId !== current.pointerId) return;
          current.y = move.clientY;
          if (!current.lifted) {
            if (Math.abs(move.clientY - current.startY) < threshold) return;
            lift();
          }
          follow();
        };
        const onUp = (up: PointerEvent) => {
          if (up.pointerId !== drag.current?.pointerId) return;
          endRef.current('drop');
        };
        const onCancel = () => endRef.current('cancel');
        const onKey = (key: KeyboardEvent) => {
          if (key.key !== 'Escape' || !drag.current?.lifted) return;
          key.preventDefault();
          key.stopPropagation();
          endRef.current('cancel');
        };
        // A long press with a finger opens no menu while the handle is held.
        const onContext = (context: Event) => context.preventDefault();
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
        window.addEventListener('blur', onCancel);
        window.addEventListener('keydown', onKey, true);
        window.addEventListener('contextmenu', onContext);
        stopListening.current = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          window.removeEventListener('blur', onCancel);
          window.removeEventListener('keydown', onKey, true);
          window.removeEventListener('contextmenu', onContext);
          stopListening.current = () => undefined;
        };
      },
      style: HANDLE_STYLE,
    }),
    [keys, movable, range, threshold, lift, follow],
  );

  // The keys changing during a drag cancel it; an unmount ends it.
  const keysSignature = keys.join('\u0000');
  const lastSignature = useRef(keysSignature);
  useEffect(() => {
    if (lastSignature.current !== keysSignature && drag.current) {
      endRef.current('cancel');
    }
    lastSignature.current = keysSignature;
  }, [keysSignature]);
  useEffect(
    () => () => {
      stopListening.current();
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  // After a change of order (or a drop or cancel), every row slides from where it was on screen
  // to where it is now (FLIP), on the caller's slide. Runs after every render, acting only once
  // places were recorded.
  useLayoutEffect(() => {
    const places = before.current;
    const list = listRef.current;
    before.current = null;
    if (!places || !list) return;
    const motion = latest.current.slide;
    for (const key of keys) {
      const row = rowOf(list, key);
      const was = places.get(key);
      if (!row || was === undefined) continue;
      const delta = was - row.getBoundingClientRect().top;
      // No slide, or one of no length (no `transitionend` would clear it): it's there at once.
      if (Math.abs(delta) < 0.5 || !motion || isInstant(row, motion.duration)) continue;
      // A row moved again mid-slide: the slide it leaves stops listening before the new one
      // starts. (Its `transitioncancel` arrives after the new slide has begun, so a slide is
      // never ended on a cancel, or the new one would jump.)
      const active = slides.get(row);
      const inline = active ? active.inline : row.style.transition;
      active?.stop();
      // The row's own transitions keep running (a drop's shadow fading out); only `translate`
      // is held still while the row takes its starting place, then slides.
      const own = ownTransition(row, inline);
      const withOwn = (translate: string) => (own ? `${own}, ${translate}` : translate);
      row.style.transition = own ? withOwn('translate 0s') : 'none';
      row.style.translate = `0 ${delta}px`;
      // Read once, so the browser takes the starting place before the slide.
      void row.offsetHeight;
      row.style.transition = withOwn(`translate ${motion.duration} ${motion.easing}`);
      row.style.translate = '';
      // Only the row's own slide ends it: a child's transition (a state layer's fade) bubbles
      // here too.
      const stop = () => {
        row.removeEventListener('transitionend', clear);
        slides.delete(row);
      };
      const clear = (event: TransitionEvent) => {
        if (event.target !== row || event.propertyName !== 'translate') return;
        row.style.transition = inline;
        stop();
      };
      row.addEventListener('transitionend', clear);
      slides.set(row, { stop, inline });
    }
  });

  const canMove = useCallback(
    (key: K, where: ReorderWhere) => {
      const index = keys.indexOf(key);
      if (index < 0 || !movable(key)) return false;
      const { min, max } = range(index);
      return where === 'up' || where === 'top' ? index > min : index < max;
    },
    [keys, movable, range],
  );

  const move = useCallback(
    (key: K, where: ReorderWhere) => {
      if (!canMove(key, where)) return;
      const from = keys.indexOf(key);
      const { min, max } = range(from);
      const to =
        where === 'up' ? from - 1 : where === 'down' ? from + 1 : where === 'top' ? min : max;
      recordPlaces();
      setLastMoved({ key, by: 'action' });
      latest.current.onReorder(moved(keys, from, to), { key, from, to });
    },
    [keys, canMove, range, recordPlaces],
  );

  const itemProps = useCallback(
    (key: K) => {
      const data: ReturnType<ReorderResult<K>['itemProps']> = { 'data-reorder-key': String(key) };
      const current = drag.current;
      if (dragged === null || !current?.lifted || target === null) return data;
      const index = keys.indexOf(key);
      if (key === dragged) {
        data['data-dragged'] = true;
        data.style = { translate: `0 ${offset}px`, position: 'relative', zIndex: 1 };
        return data;
      }
      // The rows between its place and where it would land move by its height and the gap.
      const size = (current.boxes[current.from]?.height ?? 0) + current.gap;
      const motion = latest.current.slide;
      const transition = motion ? `translate ${motion.duration} ${motion.easing}` : undefined;
      if (index > current.from && index <= target)
        data.style = { translate: `0 ${-size}px`, transition };
      else if (index < current.from && index >= target)
        data.style = { translate: `0 ${size}px`, transition };
      else data.style = { transition };
      return data;
    },
    [dragged, target, offset, keys],
  );

  const cancel = useCallback(() => endRef.current('cancel'), []);

  return { dragged, target, lastMoved, itemProps, handleProps, move, canMove, cancel };
}
