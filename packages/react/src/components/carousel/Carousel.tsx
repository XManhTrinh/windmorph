'use client';

import { useReducedMotion } from 'motion/react';
import {
  Children,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type FocusEvent,
  type HTMLAttributeAnchorTarget,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { mergeProps, useLink, useObjectRef, type PressEvent } from 'react-aria';
import { useLabels } from '../labels/use-labels';
import {
  useM3Interaction,
  type M3InteractionDataAttributes,
} from '../../primitives/use-m3-interaction';
import { usePageNumberFormatter } from '../../primitives/use-page-number-formatter';
import { cn } from '../../utils/cn';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { isModifierAlone } from '../../utils/modifier-keys';
import { splitRootProps, type RootDOMProps } from '../../utils/root-props';
import { routedHref } from '../../utils/routed-href';
import {
  createStrategy,
  heroKeylineList,
  keylinesForScrollOffset,
  MAX_SMALL_ITEM_SIZE,
  maxScrollOffset,
  multiBrowseKeylineList,
  placeItem,
  snapPositionOffset,
  type Strategy,
} from './carousel-keylines';
import { pressAreaReach } from './carousel-press-area';
import { carouselStyles } from './carousel-styles';

export interface CarouselClassNames {
  /** The outer element, which holds the carousel's name. */
  root?: string;
  /** The scrolling track that holds the items. */
  scroller?: string;
  /** Each item's slot, sized and placed on its keyline. */
  item?: string;
  /** The masked layer of each item (corners, clipping). */
  mask?: string;
  /** The state layer painted over an item that can be activated. */
  stateLayer?: string;
  /** The link of an item that is one (`itemHref`), holding its press area and its mask. */
  link?: string;
}

/** Words the carousel announces. */
export interface CarouselLabels {
  /**
   * Each item's name: its position (from 1) and the number of items, as formatted text.
   * @default (position, count) => `${position} of ${count}`
   */
  slide: (position: string, count: string) => string;
  /** What the carousel is, read before its name (`aria-roledescription`). @default "carousel" */
  carousel: string;
  /** What each item is, read before its name (`aria-roledescription`). @default "slide" */
  item: string;
}

const DEFAULT_LABELS: CarouselLabels = {
  slide: (position, count) => `${position} of ${count}`,
  carousel: 'carousel',
  item: 'slide',
};

/** Padding around the items, in px. `start` and `end` run along the carousel. */
export interface CarouselContentPadding {
  /** Before the first item. */
  start: number;
  /** After the last item. */
  end: number;
  /** Either side across the carousel. */
  cross: number;
}

export type CarouselVariant =
  'multi-browse' | 'uncontained' | 'multi-aspect' | 'hero' | 'full-screen';

/** A carousel needs a name: `aria-label`, or `aria-labelledby` pointing at a visible title. */
type Naming =
  | {
      /** Accessible name when there's no visible title. */
      'aria-label': string;
    }
  | {
      /** The id of the visible title that names the carousel. */
      'aria-labelledby': string;
    };

interface CarouselOwnProps extends RootDOMProps {
  /** The root element's id. */
  id?: string;
  /**
   * `multi-browse` shows large, medium and small items; `uncontained` shows items of one
   * size that flow past the end edge, never masked or resized; `multi-aspect` is uncontained with items of their own widths
   * (9:16 to 16:9); `hero` shows one large item with small ones beside it; `full-screen`
   * shows one edge-to-edge item at a time. @default "multi-browse"
   */
  variant?: CarouselVariant;
  /**
   * The direction the items scroll in.
   * @default "horizontal", or "vertical" when full-screen
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Preferred size of the large items along the carousel (multi-browse, hero). Hero defaults
   * to the whole carousel. @default 186
   */
  preferredItemSize?: number;
  /** Size of the items along the carousel (uncontained). @default 240 */
  itemSize?: number;
  /** Space between items, px. @default 8, or 16 when full-screen */
  itemSpacing?: number;
  /** Centre the large hero item between small ones. @default "start" */
  heroAlign?: 'start' | 'center';
  /** @deprecated Use `heroAlign`, its name since 0.2.9; this one goes in a later minor release. */
  heroAlignment?: 'start' | 'center';
  /** Minimum size of the small items. @default 40 */
  minSmallItemSize?: number;
  /** Maximum size of the small items. @default 56 */
  maxSmallItemSize?: number;
  /**
   * Padding around the items. Items scroll over the start and end padding.
   * @default { start: 16, end: 16, cross: 8 } (uncontained and multi-aspect: no end padding;
   * full-screen: none)
   */
  contentPadding?: Partial<CarouselContentPadding>;
  /**
   * Snap uncontained and multi-aspect carousels to their items. Multi-browse, hero and
   * full-screen carousels always snap. @default "none"
   */
  snap?: 'none' | 'item';
  /**
   * Called when an item is pressed, or activated with Enter or Space. Items then show
   * hover, focus and pressed states. Not called for an item that is a link (`itemHref`).
   */
  onAction?: (index: number) => void;
  /**
   * Makes an item a link to the address it returns (`undefined` for one that isn't): a real
   * link, so a `RouterProvider` routes it, and a modifier or the context menu opens it in a new
   * tab, as any link. The item's press area is the link, and the link is the item's tab stop:
   * Enter follows it, and `onAction` isn't called for it. The item's content names the link,
   * so an image needs a non-empty `alt` (or words beside it); a link item must not hold buttons
   * or other links. A disabled item (`disabledIndexes`) keeps its name and tab stop but no
   * address.
   */
  itemHref?: (index: number) => string | undefined;
  /** Where an item's link opens (`_blank` for a new tab), with `itemHref`. */
  itemTarget?: HTMLAttributeAnchorTarget;
  /**
   * An item's link's relationship to the page (`nofollow`, `noopener`), with `itemHref`.
   * @default "noopener noreferrer" with `itemTarget="_blank"`, else none
   */
  itemRel?: string;
  /**
   * Called when another item takes the focal (large) place, once scrolling has settled (150ms
   * without a scroll): the item an app's words or controls describe. Multi-browse and hero
   * carousels. The item that is focal when the carousel first lays out is the starting point,
   * not a change, so it isn't reported. Each item's size is on the item itself (`children`).
   */
  onFocalChange?: (index: number) => void;
  /** Indexes of items that can't be activated. */
  disabledIndexes?: readonly number[];
  /**
   * Words the carousel announces, for localisation. A {@link LabelsProvider} sets them for the
   * whole app.
   */
  labels?: Partial<CarouselLabels>;
  /**
   * The items, e.g. images; each fills its slot and is clipped to its keyline. In multi-browse
   * and hero carousels each item (`data-slot="item"`) carries `data-size` (`large`, `medium`
   * or `small`; every item `large` under reduced motion) and `--m3-carousel-item-openness`,
   * from 0 at its smallest to 1 at its largest, so words over it can fade as it shrinks.
   */
  children: ReactNode;
  /** Ref to the root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: CarouselClassNames;
  /** `data-*` attributes, like the other DOM attributes, go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type CarouselProps = CarouselOwnProps & Naming;

/**
 * Variants whose items change size along keylines as they scroll. Uncontained and
 * multi-aspect items keep one size and flow past the end edge (M3: "items are a single size
 * and flow past the edge of the screen"), so they are never masked or cropped.
 */
const KEYLINE_VARIANTS: readonly CarouselVariant[] = ['multi-browse', 'hero'];

function defaultPadding(variant: CarouselVariant): CarouselContentPadding {
  if (variant === 'full-screen') return { start: 0, end: 0, cross: 0 };
  if (variant === 'uncontained' || variant === 'multi-aspect')
    return { start: 16, end: 0, cross: 8 };
  return { start: 16, end: 16, cross: 8 };
}

const TABBABLE =
  'a[href],area[href],button,input,select,textarea,iframe,summary,[contenteditable],[tabindex]';

// The next (or previous) element in the tab order outside `container`.
function tabbableOutside(container: HTMLElement, forward: boolean): HTMLElement | undefined {
  const candidates = Array.from(
    container.ownerDocument.querySelectorAll<HTMLElement>(TABBABLE),
  ).filter(
    (element) =>
      !container.contains(element) &&
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !element.closest('[inert],[hidden]'),
  );
  const isAfter = (element: HTMLElement) =>
    Boolean(container.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
  return forward ? candidates.find(isAfter) : candidates.filter((e) => !isAfter(e)).pop();
}

const OPENNESS = '--m3-carousel-item-openness';

// Writes an item's size state, only what changed: it's written on every scroll frame and render,
// and an attribute set to the value it has still notifies observers and restyles what reads it
// (2026-11-16).
function writeItemSize(slot: HTMLElement, size: 'large' | 'medium' | 'small', openness: string) {
  if (slot.dataset.size !== size) slot.dataset.size = size;
  if (slot.style.getPropertyValue(OPENNESS) !== openness)
    slot.style.setProperty(OPENNESS, openness);
}

/**
 * M3 Expressive carousel: a scrollable row (or column) of items whose sizes follow Compose's
 * keylines as they scroll: multi-browse (large, medium and small items), uncontained,
 * multi-aspect, hero or full-screen. Give it a height (or a width, vertical) with
 * `className`. Tab or the arrow keys move between items; Up and Down (Left and Right when
 * vertical) leave the carousel. Under reduced motion every item keeps the large size.
 *
 * @example
 * <Carousel aria-label="Photos" className="h-[221px]">
 *   {photos.map((photo) => <img key={photo.id} src={photo.src} alt={photo.alt} className="size-full object-cover" />)}
 * </Carousel>
 */
export function Carousel({
  variant = 'multi-browse',
  orientation = variant === 'full-screen' ? 'vertical' : 'horizontal',
  preferredItemSize,
  itemSize = 240,
  itemSpacing = variant === 'full-screen' ? 16 : 8,
  heroAlign: heroAlignProp,
  heroAlignment,
  minSmallItemSize,
  maxSmallItemSize,
  contentPadding,
  snap = 'none',
  onAction,
  itemHref,
  itemTarget,
  itemRel,
  onFocalChange,
  disabledIndexes,
  labels: labelsProp,
  children,
  ref,
  className,
  style,
  classNames,
  ...rest
}: CarouselProps) {
  const heroAlign = heroAlignProp ?? heroAlignment ?? 'start';
  const { root: data, rest: labelling } = splitRootProps(rest);
  const { 'aria-label': label, 'aria-labelledby': labelledBy } = labelling as {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const labels = useLabels('Carousel', DEFAULT_LABELS, labelsProp);
  const numbers = usePageNumberFormatter();
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;
  const vertical = orientation === 'vertical';
  const reduceMotion = useReducedMotion() ?? false;
  const padding = { ...defaultPadding(variant), ...contentPadding };
  const keylined = KEYLINE_VARIANTS.includes(variant);
  // Under reduced motion items keep the large size, unmasked (the spec's reduced motion).
  const masked = keylined && !reduceMotion;
  const rootRef = useObjectRef(ref);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Each item's one tab stop: its link for a link item, else its slot (2026-11-16).
  const focusRefs = useRef<(HTMLElement | null)[]>([]);
  const maskRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hitRefs = useRef<(HTMLElement | null)[]>([]);
  const [space, setSpace] = useState(0);
  const [crossSize, setCrossSize] = useState(0);

  const strategy = computeStrategy();
  function computeStrategy(): Strategy | null {
    if (space === 0 || count === 0 || !keylined) return null;
    const keylines =
      variant === 'hero'
        ? heroKeylineList(
            space,
            preferredItemSize,
            itemSpacing,
            count,
            heroAlign === 'center',
            minSmallItemSize,
            maxSmallItemSize,
          )
        : multiBrowseKeylineList(
            space,
            preferredItemSize ?? 186,
            itemSpacing,
            count,
            minSmallItemSize,
            maxSmallItemSize,
          );
    const result = masked
      ? createStrategy(
          keylines,
          space,
          itemSpacing,
          padding.start,
          padding.end,
          maxSmallItemSize ?? MAX_SMALL_ITEM_SIZE,
        )
      : createStrategy(keylines, space, itemSpacing);
    return result.isValid ? result : null;
  }

  // The item in the focal (large) place, reported once scrolling has settled (no scroll for
  // 150ms), and only when it changes: the first one found is the starting point. Only a scroll
  // frame, or another item becoming focal, restarts the wait: every render used to, so a
  // parent re-rendering faster than 150ms kept the change from ever being reported
  // (2026-11-16).
  const onFocalChangeRef = useRef(onFocalChange);
  useLayoutEffect(() => {
    onFocalChangeRef.current = onFocalChange;
  });
  const focal = useRef<{ reported: number | null; candidate: number | null; timer: number }>({
    reported: null,
    candidate: null,
    timer: 0,
  });
  useEffect(() => {
    const state = focal.current;
    return () => window.clearTimeout(state.timer);
  }, []);
  const noteFocal = (index: number, scrolled: boolean) => {
    const state = focal.current;
    if (state.reported === null) {
      state.reported = index;
      state.candidate = index;
      return;
    }
    if (!scrolled && index === state.candidate) return;
    state.candidate = index;
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(() => {
      if (state.reported === index) return;
      state.reported = index;
      onFocalChangeRef.current?.(index);
    }, 150);
  };

  // Writes each item's mask and translation for the current scroll position, without
  // re-rendering (Compose's `carouselItem` layer block). `scrolled`: called for a scroll frame.
  const update = (scrolled: boolean) => {
    const scroller = scrollerRef.current;
    if (!scroller || !strategy || !masked) return;
    const rtl = !vertical && getComputedStyle(scroller).direction === 'rtl';
    const scroll = Math.abs(vertical ? scroller.scrollTop : scroller.scrollLeft);
    const max = maxScrollOffset(strategy, count);
    const keylines = keylinesForScrollOffset(strategy, scroll, max);
    const full = strategy.itemMainAxisSize;
    const round = (value: number) => Math.round(value * 100) / 100;
    const places = maskRefs.current.map((_, index) => placeItem(strategy, keylines, index, scroll));
    // Each item's size as state, for what an app lays over it (Compose hands an item's content
    // its size): `data-size` and an openness from 0 at its smallest to 1 at its largest.
    // Against the keylines in effect at this scroll: at the start, the focal items shrink a
    // little to make room for the padding, and they are still the large ones.
    const sizes = keylines.filter((k) => !k.isAnchor).map((k) => k.size);
    const smallest = Math.min(...sizes);
    const largest = Math.max(...sizes);
    let focalIndex = -1;
    places.forEach(({ size }, index) => {
      const slot = slotRefs.current[index];
      if (!slot) return;
      const large = size >= largest - 0.5;
      if (large && focalIndex < 0) focalIndex = index;
      const openness = largest > smallest ? (size - smallest) / (largest - smallest) : 1;
      writeItemSize(
        slot,
        large ? 'large' : size <= smallest + 0.5 ? 'small' : 'medium',
        String(round(Math.min(1, Math.max(0, openness)))),
      );
    });
    if (focalIndex >= 0) noteFocal(focalIndex, scrolled);
    // Each item's visible part, from the viewport's start edge (slots are `full` apart plus
    // the spacing; the mask is centred in its slot and moved by its translation).
    const spans = places.map(({ size, translation }, index) => ({
      start: index * (full + itemSpacing) + translation + (full - size) / 2 - scroll,
      size,
    }));
    maskRefs.current.forEach((mask, index) => {
      if (!mask) return;
      const { size, translation } = places[index]!;
      const inset = round(Math.max(0, (full - size) / 2));
      const move = round(rtl ? -translation : translation);
      mask.style.translate = vertical ? `0 ${move}px` : `${move}px 0`;
      mask.style.clipPath = vertical
        ? `inset(${inset}px 0 ${inset}px 0 round var(--m3-carousel-item-corner))`
        : `inset(0 ${inset}px 0 ${inset}px round var(--m3-carousel-item-corner))`;
      mask.style.setProperty('--m3-carousel-item-size', `${round(size)}px`);
      // The press area follows the mask, widened to M3's 48px touch target for a small item.
      const hit = hitRefs.current[index];
      if (!hit) return;
      const reach = pressAreaReach(spans, index, itemSpacing, space);
      const start = round(Math.max(0, inset - reach.start));
      const end = round(Math.max(0, inset - reach.end));
      hit.style.translate = mask.style.translate;
      hit.style.clipPath = vertical
        ? `inset(${start}px 0 ${end}px 0)`
        : rtl
          ? `inset(0 ${start}px 0 ${end}px)`
          : `inset(0 ${end}px 0 ${start}px)`;
    });
  };

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const computed = getComputedStyle(scroller);
      const px = (value: string) => Number.parseFloat(value) || 0;
      // The keylines span the scroller's padding box along the carousel: Compose handles
      // the start and end padding in the keylines, not in the layout.
      setSpace(vertical ? scroller.clientHeight : scroller.clientWidth);
      setCrossSize(
        vertical
          ? scroller.clientWidth - px(computed.paddingLeft) - px(computed.paddingRight)
          : scroller.clientHeight - px(computed.paddingTop) - px(computed.paddingBottom),
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [vertical]);

  // Unmasked (under reduced motion every item keeps the large size), the focal item is the
  // one nearest the start.
  const nearestItem = (scrolled: boolean) => {
    const scroller = scrollerRef.current;
    if (!scroller || !strategy) return;
    const scroll = Math.abs(vertical ? scroller.scrollTop : scroller.scrollLeft);
    const step = strategy.itemMainAxisSize + itemSpacing;
    noteFocal(Math.min(count - 1, Math.max(0, Math.round(scroll / step))), scrolled);
  };
  const track = (scrolled: boolean) => (masked ? update(scrolled) : nearestItem(scrolled));

  useLayoutEffect(() => {
    // Leaving the masked layout (reduced motion) clears what `update` wrote.
    if (!masked) {
      [...maskRefs.current, ...hitRefs.current].forEach((layer) => {
        layer?.style.removeProperty('translate');
        layer?.style.removeProperty('clip-path');
        layer?.style.removeProperty('--m3-carousel-item-size');
      });
      slotRefs.current.forEach((slot) => {
        if (!slot) return;
        if (keylined) {
          writeItemSize(slot, 'large', '1');
        } else {
          delete slot.dataset.size;
          slot.style.removeProperty(OPENNESS);
        }
      });
    }
    if (keylined) track(false);
    const scroller = scrollerRef.current;
    if (!scroller || !keylined) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          track(true);
        });
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  });

  // Mouse drag scrolls the carousel (touch and trackpads scroll natively); snapping is
  // paused while dragging and resumes on release. A drag never activates an item. The
  // handlers run in the capture phase: an actionable item's press handler stops the
  // pointer events' propagation and focuses the item on pointer down, so in the bubble
  // phase the scroller never saw the press (the focus then read as keyboard focus and
  // scrolled the item to its snap position, and a drag neither scrolled nor was ignored).
  const drag = useRef<{ start: number; scroll: number; id: number } | null>(null);
  const dragged = useRef(false);
  // A press's focus, which never moves the carousel: it lasts until a key is pressed anywhere,
  // so focus that comes back by Tab after a press elsewhere reveals the item again (it stayed
  // set until a key inside the carousel), while focus that comes back with no key (the window
  // regaining it, a dialog the pointer closed) leaves the carousel where the press left it. A
  // modifier alone isn't a key here (a window or tab switcher starts with one).
  const pointerFocus = useRef(false);
  const stopListening = useRef<(() => void) | null>(null);
  useEffect(() => () => stopListening.current?.(), []);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!stopListening.current) {
      const page = event.currentTarget.ownerDocument;
      const onKey = (key: globalThis.KeyboardEvent) => {
        if (isModifierAlone(key)) return;
        pointerFocus.current = false;
        stopListening.current?.();
      };
      page.addEventListener('keydown', onKey, true);
      stopListening.current = () => {
        page.removeEventListener('keydown', onKey, true);
        stopListening.current = null;
      };
    }
    pointerFocus.current = true;
    dragged.current = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const scroller = event.currentTarget;
    drag.current = {
      start: vertical ? event.clientY : event.clientX,
      scroll: vertical ? scroller.scrollTop : scroller.scrollLeft,
      id: event.pointerId,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const scroller = event.currentTarget;
    const delta = (vertical ? event.clientY : event.clientX) - state.start;
    if (Math.abs(delta) > 3 && !scroller.hasAttribute('data-dragging')) {
      dragged.current = true;
      scroller.setAttribute('data-dragging', '');
      scroller.setPointerCapture?.(state.id);
    }
    if (vertical) scroller.scrollTop = state.scroll - delta;
    else scroller.scrollLeft = state.scroll - delta;
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    event.currentTarget.removeAttribute('data-dragging');
  };
  // A mouse drag is the carousel's, wherever it starts: an item's picture (draggable on its
  // own, inside a link item too, whose link isn't) or selected words would start the browser's
  // drag and drop instead, which takes the pointer away and leaves the carousel where it was
  // (2026-11-16).
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (drag.current) event.preventDefault();
  };
  // Only a pointer's click can end a drag: a click from the keyboard or assistive technology
  // (`detail` 0, or a press that isn't the mouse's) always activates. The flag stayed set until
  // the next press inside the carousel, so Enter on an item after a drag did nothing
  // (2026-11-16); a key press clears it too, for a browser whose Enter click has a `detail`.
  const endsDrag = (pointer: boolean) => pointer && dragged.current;
  // A key ends a drag's hold on the next activation, but not a modifier alone, pressed
  // mid-drag (a Command or Control click's start), whose click would then open the item.
  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isModifierAlone(event.nativeEvent)) dragged.current = false;
  };

  // Brings a focused item into view: keylined carousels scroll it to its snap position
  // (the focal keyline); the others just far enough to show it.
  const reveal = (index: number) => {
    const scroller = scrollerRef.current;
    const slot = slotRefs.current[index];
    if (!scroller || !slot) return;
    const behavior: ScrollBehavior = reduceMotion ? 'instant' : 'smooth';
    if (strategy && masked) {
      const step = strategy.itemMainAxisSize + itemSpacing;
      const max = maxScrollOffset(strategy, count);
      const target = Math.min(
        max,
        Math.max(0, index * step - snapPositionOffset(strategy, index, count)),
      );
      const rtl = !vertical && getComputedStyle(scroller).direction === 'rtl';
      scroller.scrollTo?.(
        vertical ? { top: target, behavior } : { left: rtl ? -target : target, behavior },
      );
    } else {
      slot.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior });
    }
  };

  // An item's focus is its tab stop's (`focusRefs`): the slot's own, or its link's, which
  // reaches the slot as it bubbles. The keys, the reveal and the moves below all go by it; they
  // went by the slot, which a link item's never is, so the keys did nothing there, Tab never
  // revealed one and an arrow left focus behind as the carousel scrolled away (2026-11-16).
  const onSlotFocus = (index: number, event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== focusRefs.current[index]) return;
    // A press focuses the item without moving the carousel.
    if (pointerFocus.current) return;
    reveal(index);
  };

  const focusSlot = (index: number) => {
    const target = Math.max(0, Math.min(count - 1, index));
    const element = focusRefs.current[target];
    if (!element) return;
    pointerFocus.current = true;
    element.focus({ preventScroll: true });
    pointerFocus.current = false;
    reveal(target);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isModifierAlone(event.nativeEvent)) pointerFocus.current = false;
    const target = event.target as HTMLElement;
    const index = focusRefs.current.indexOf(target);
    if (index < 0) return;
    const rtl = getComputedStyle(target).direction === 'rtl';
    const [prev, next, leaveBack, leaveForward] = vertical
      ? ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      : rtl
        ? ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']
        : ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    let handled = true;
    if (event.key === next) focusSlot(index + 1);
    else if (event.key === prev) focusSlot(index - 1);
    else if (event.key === 'Home') focusSlot(0);
    else if (event.key === 'End') focusSlot(count - 1);
    else if (event.key === leaveForward || event.key === leaveBack) {
      const root = rootRef.current;
      const outside = root && tabbableOutside(root, event.key === leaveForward);
      if (outside) outside.focus();
      else handled = false;
    } else handled = false;
    if (handled) event.preventDefault();
  };

  const snapping =
    variant === 'hero' || variant === 'full-screen'
      ? 'single'
      : variant === 'multi-browse' || snap === 'item'
        ? 'many'
        : 'none';
  const styles = carouselStyles({
    orientation,
    snapping,
    masked,
    aspect: variant === 'multi-aspect',
    fullBleed: variant === 'full-screen',
  });
  const fallbackSize = variant === 'uncontained' ? itemSize : (preferredItemSize ?? 186);
  const slotSize =
    variant === 'full-screen'
      ? space || undefined
      : variant === 'multi-aspect'
        ? undefined
        : (strategy?.itemMainAxisSize ?? fallbackSize);
  // The scroller pads the items itself only when the keylines don't.
  const layoutPadding = masked ? { start: 0, end: 0 } : padding;
  const total = numbers.format(count);
  const disabled = new Set(disabledIndexes);
  // A new tab opened by a link could reach back to the page through `window.opener` (as
  // List's and Menu's link items guard against).
  const rel = itemRel ?? (itemTarget === '_blank' ? 'noopener noreferrer' : undefined);

  return (
    <div
      {...data}
      id={(labelling as { id?: string }).id}
      ref={rootRef}
      role="region"
      aria-roledescription={labels.carousel}
      aria-label={label}
      aria-labelledby={labelledBy}
      // The component token's hooks (carousel-tokens.ts), also public styling hooks for apps.
      data-tokens={mergeDataTokens('md-comp-carousel', data)}
      data-variant={variant}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div
        ref={scrollerRef}
        onPointerDownCapture={onPointerDown}
        onPointerMoveCapture={onPointerMove}
        onPointerUpCapture={endDrag}
        onPointerCancelCapture={endDrag}
        onDragStartCapture={onDragStart}
        onKeyDownCapture={onKeyDownCapture}
        onKeyDown={onKeyDown}
        style={
          {
            gap: itemSpacing,
            [vertical ? 'paddingInline' : 'paddingBlock']: padding.cross,
            [vertical ? 'paddingBlockStart' : 'paddingInlineStart']: layoutPadding.start,
            [vertical ? 'paddingBlockEnd' : 'paddingInlineEnd']: layoutPadding.end,
            [vertical ? 'scrollPaddingBlockStart' : 'scrollPaddingInlineStart']:
              layoutPadding.start,
            [vertical ? 'scrollPaddingBlockEnd' : 'scrollPaddingInlineEnd']: layoutPadding.end,
            '--m3-carousel-cross-size': `${crossSize}px`,
          } as CSSProperties
        }
        className={styles.scroller({ class: classNames?.scroller })}
      >
        {items.map((item, index) => (
          <CarouselItem
            key={item.key ?? index}
            index={index}
            href={itemHref?.(index)}
            target={itemTarget}
            rel={rel}
            endsDrag={endsDrag}
            label={labels.slide(numbers.format(index + 1), total)}
            roleDescription={labels.item}
            disabled={disabled.has(index)}
            onAction={
              onAction &&
              ((event) => {
                if (!endsDrag(event.pointerType === 'mouse')) onAction(index);
              })
            }
            onFocus={(event) => onSlotFocus(index, event)}
            slotRef={(element) => {
              slotRefs.current[index] = element;
            }}
            focusRef={(element) => {
              focusRefs.current[index] = element;
            }}
            maskRef={(element) => {
              maskRefs.current[index] = element;
            }}
            hitRef={(element) => {
              hitRefs.current[index] = element;
            }}
            style={{
              ...(slotSize === undefined ? {} : { [vertical ? 'height' : 'width']: slotSize }),
              [vertical ? 'scrollMarginBlockStart' : 'scrollMarginInlineStart']:
                strategy && masked ? snapPositionOffset(strategy, index, count) : 0,
            }}
            styles={styles}
            classNames={classNames}
          >
            {item}
          </CarouselItem>
        ))}
      </div>
    </div>
  );
}

function CarouselItem(props: CarouselItemProps) {
  return props.href === undefined ? (
    <CarouselActionItem {...props} />
  ) : (
    <CarouselLinkItem {...props} />
  );
}

interface CarouselItemProps {
  index: number;
  label: string;
  roleDescription: string;
  disabled: boolean;
  href: string | undefined;
  target: HTMLAttributeAnchorTarget | undefined;
  rel: string | undefined;
  /**
   * Whether a click or press ends a mouse drag across the carousel, which isn't a press;
   * `pointer`: it came from a pointer, not the keyboard or assistive technology.
   */
  endsDrag: (pointer: boolean) => boolean;
  onAction?: (event: PressEvent) => void;
  onFocus: (event: FocusEvent<HTMLDivElement>) => void;
  slotRef: (element: HTMLDivElement | null) => void;
  /** The item's one tab stop: its link, or its slot. */
  focusRef: (element: HTMLElement | null) => void;
  maskRef: (element: HTMLDivElement | null) => void;
  hitRef: (element: HTMLElement | null) => void;
  style: CSSProperties;
  styles: ReturnType<typeof carouselStyles>;
  classNames?: CarouselClassNames;
  children: ReactNode;
}

// An item that is a link: a real `<a>` inside the slide's group, holding its press area and
// its mask, so a press on what shows follows the link as any link does (a `RouterProvider`'s
// router, a modifier or the context menu for a new tab). The link takes focus and draws the
// ring; its name is its content (a picture's `alt`, its words).
function CarouselLinkItem({
  index,
  label,
  roleDescription,
  disabled,
  href,
  target,
  rel,
  endsDrag,
  onFocus,
  slotRef,
  focusRef,
  maskRef,
  hitRef,
  style,
  styles,
  classNames,
  children,
}: CarouselItemProps) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const { linkProps, isPressed } = useLink({ href, target, rel, isDisabled: disabled }, linkRef);
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled, isPressed },
    linkRef,
  );
  const { 'data-focus-visible': focusVisible, ...states } = dataAttributes;
  return (
    <div
      ref={slotRef}
      role="group"
      aria-roledescription={roleDescription}
      aria-label={label}
      data-slot="item"
      data-index={index}
      data-disabled={disabled || undefined}
      onFocus={onFocus}
      style={style}
      className={styles.item({ interactive: true, class: classNames?.item })}
    >
      <a
        {...mergeProps(linkProps, interactionProps)}
        ref={(element) => {
          linkRef.current = element;
          focusRef(element);
        }}
        // As ButtonBase's disabled link: no address, so a middle click or "Open in new tab"
        // can't go there either, but still a link (an `a` without one loses the role), named
        // and, as a disabled plain item, a tab stop. Otherwise the router's address (a
        // `RouterProvider`'s `useHref`), not the raw `href`, so a new tab or a copied link keeps
        // the app's base path (2026-11-16).
        href={disabled ? undefined : routedHref(linkProps)}
        {...(disabled && { role: 'link', tabIndex: 0 })}
        target={target}
        rel={rel}
        // A mouse drag that starts on the item scrolls the carousel, not the link's own drag
        // and drop, which took the pointer away (2026-11-16).
        draggable={false}
        data-focus-visible={focusVisible}
        onClick={(event) => {
          // The click that ends a drag across the carousel opens nothing.
          if (endsDrag(event.detail > 0)) {
            event.preventDefault();
            return;
          }
          linkProps.onClick?.(event);
        }}
        className={styles.link({ class: classNames?.link })}
      >
        <CarouselItemLayers
          hitRef={hitRef}
          maskRef={maskRef}
          states={states}
          focusVisible={focusVisible}
          styles={styles}
          classNames={classNames}
        >
          {children}
        </CarouselItemLayers>
      </a>
    </div>
  );
}

function CarouselActionItem({
  index,
  label,
  roleDescription,
  disabled,
  onAction,
  onFocus,
  slotRef,
  focusRef,
  maskRef,
  hitRef,
  style,
  styles,
  classNames,
  children,
}: CarouselItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const interactive = onAction !== undefined;
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled || !interactive, onPress: onAction },
    ref,
  );
  const { 'data-focus-visible': focusVisible, ...states } = dataAttributes;
  return (
    <div
      {...interactionProps}
      ref={(element) => {
        ref.current = element;
        slotRef(element);
        focusRef(element);
      }}
      role="group"
      aria-roledescription={roleDescription}
      aria-label={label}
      aria-disabled={(interactive && disabled) || undefined}
      tabIndex={0}
      data-slot="item"
      data-index={index}
      data-focus-visible={focusVisible}
      data-disabled={(interactive && disabled) || undefined}
      onFocus={(event) => {
        interactionProps.onFocus?.(event);
        onFocus(event);
      }}
      style={style}
      className={styles.item({ interactive, class: classNames?.item })}
    >
      <CarouselItemLayers
        hitRef={hitRef}
        maskRef={maskRef}
        states={interactive ? states : undefined}
        focusVisible={focusVisible}
        styles={styles}
        classNames={classNames}
      >
        {children}
      </CarouselItemLayers>
    </div>
  );
}

interface CarouselItemLayersProps {
  hitRef: (element: HTMLElement | null) => void;
  maskRef: (element: HTMLDivElement | null) => void;
  /** The item's interaction states, for an item that can be pressed; none: no state layer. */
  states: Omit<M3InteractionDataAttributes, 'data-focus-visible'> | undefined;
  focusVisible: true | undefined;
  styles: ReturnType<typeof carouselStyles>;
  classNames?: CarouselClassNames;
  children: ReactNode;
}

// What every item draws, in its slot or its link: where it takes presses, under the mask and
// clipped to it or a little wider, then the mask holding the content, with the state layer
// over it when the item can be pressed.
function CarouselItemLayers({
  hitRef,
  maskRef,
  states,
  focusVisible,
  styles,
  classNames,
  children,
}: CarouselItemLayersProps) {
  return (
    <>
      <span aria-hidden="true" ref={hitRef} data-slot="hit-area" className={styles.hitArea()} />
      <div ref={maskRef} {...states} className={styles.mask({ class: classNames?.mask })}>
        {children}
        {states && (
          <span
            aria-hidden="true"
            {...states}
            data-focus-visible={focusVisible}
            className={styles.stateLayer({ class: classNames?.stateLayer })}
          />
        )}
      </div>
    </>
  );
}
