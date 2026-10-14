'use client';

import { useReducedMotion } from 'motion/react';
import {
  Children,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { useNumberFormatter, useObjectRef } from 'react-aria';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
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
}

/** Words the carousel announces. */
export interface CarouselLabels {
  /**
   * Each item's name: its position (from 1) and the number of items, as formatted text.
   * @default (position, count) => `${position} of ${count}`
   */
  slide: (position: string, count: string) => string;
}

const DEFAULT_LABELS: CarouselLabels = {
  slide: (position, count) => `${position} of ${count}`,
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

interface CarouselOwnProps {
  /**
   * `multi-browse` shows large, medium and small items; `uncontained` shows items of one
   * size that flow past the end edge, never masked or resized; `multi-aspect` is uncontained with items of their own widths
   * (9:16 to 16:9); `hero` shows one large item with small ones beside it; `full-screen`
   * shows one edge-to-edge item at a time. @default "multi-browse"
   */
  variant?: CarouselVariant;
  /**
   * The direction the items scroll in.
   * @default "horizontal" ("vertical" for full-screen)
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Preferred size of the large items along the carousel (multi-browse, hero). Hero defaults
   * to the whole carousel. @default 186
   */
  preferredItemSize?: number;
  /** Size of the items along the carousel (uncontained). @default 240 */
  itemSize?: number;
  /** Space between items, px. @default 8 (16 for full-screen) */
  itemSpacing?: number;
  /** Centre the large hero item between small ones. @default "start" */
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
   * hover, focus and pressed states.
   */
  onAction?: (index: number) => void;
  /** Indexes of items that can't be activated. */
  disabledIndexes?: readonly number[];
  /** Words the carousel announces, for localisation. */
  labels?: Partial<CarouselLabels>;
  /** The items, e.g. images; each fills its slot and is clipped to its keyline. */
  children: ReactNode;
  /** Ref to the root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: CarouselClassNames;
  /** `data-*` attributes go to the root. */
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

/** The next (or previous) element in the tab order outside `container`. */
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
  heroAlignment = 'start',
  minSmallItemSize,
  maxSmallItemSize,
  contentPadding,
  snap = 'none',
  onAction,
  disabledIndexes,
  labels: labelsProp,
  children,
  ref,
  className,
  style,
  classNames,
  ...rest
}: CarouselProps) {
  const { data, rest: labelling } = splitDataAttributes(rest);
  const { 'aria-label': label, 'aria-labelledby': labelledBy } = labelling as {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const numbers = useNumberFormatter();
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
  const maskRefs = useRef<(HTMLDivElement | null)[]>([]);
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
            heroAlignment === 'center',
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

  // Writes each item's mask and translation for the current scroll position, without
  // re-rendering (Compose's `carouselItem` layer block).
  const update = () => {
    const scroller = scrollerRef.current;
    if (!scroller || !strategy || !masked) return;
    const rtl = !vertical && getComputedStyle(scroller).direction === 'rtl';
    const scroll = Math.abs(vertical ? scroller.scrollTop : scroller.scrollLeft);
    const max = maxScrollOffset(strategy, count);
    const keylines = keylinesForScrollOffset(strategy, scroll, max);
    const full = strategy.itemMainAxisSize;
    maskRefs.current.forEach((mask, index) => {
      if (!mask) return;
      const { size, translation } = placeItem(strategy, keylines, index, scroll);
      const round = (value: number) => Math.round(value * 100) / 100;
      const inset = round(Math.max(0, (full - size) / 2));
      const move = round(rtl ? -translation : translation);
      mask.style.translate = vertical ? `0 ${move}px` : `${move}px 0`;
      mask.style.clipPath = vertical
        ? `inset(${inset}px 0 ${inset}px 0 round var(--m3-carousel-item-corner))`
        : `inset(0 ${inset}px 0 ${inset}px round var(--m3-carousel-item-corner))`;
      mask.style.setProperty('--m3-carousel-item-size', `${round(size)}px`);
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

  useLayoutEffect(() => {
    // Leaving the masked layout (reduced motion) clears what `update` wrote.
    if (!masked)
      maskRefs.current.forEach((mask) => {
        mask?.style.removeProperty('translate');
        mask?.style.removeProperty('clip-path');
        mask?.style.removeProperty('--m3-carousel-item-size');
      });
    update();
    const scroller = scrollerRef.current;
    if (!scroller || !masked) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  });

  // Mouse drag scrolls the carousel (touch and trackpads scroll natively); snapping is
  // paused while dragging and resumes on release. A drag never activates an item.
  const drag = useRef<{ start: number; scroll: number; id: number } | null>(null);
  const dragged = useRef(false);
  const pointerFocus = useRef(false);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
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

  const onSlotFocus = (index: number, event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    // A press focuses the item without moving the carousel.
    if (pointerFocus.current) return;
    reveal(index);
  };

  const focusSlot = (index: number) => {
    const slot = slotRefs.current[Math.max(0, Math.min(count - 1, index))];
    if (!slot) return;
    pointerFocus.current = true;
    slot.focus({ preventScroll: true });
    pointerFocus.current = false;
    reveal(Number(slot.dataset.index));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    pointerFocus.current = false;
    const target = event.target as HTMLElement;
    const index = slotRefs.current.indexOf(target as HTMLDivElement);
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
    interactive: onAction !== undefined,
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

  return (
    <div
      {...data}
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      aria-labelledby={labelledBy}
      // The component token's hooks (carousel-tokens.ts), also public styling hooks for apps.
      data-tokens="md-comp-carousel"
      data-variant={variant}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
            label={labels.slide(numbers.format(index + 1), total)}
            disabled={disabled.has(index)}
            onAction={
              onAction &&
              (() => {
                if (!dragged.current) onAction(index);
              })
            }
            onFocus={(event) => onSlotFocus(index, event)}
            slotRef={(element) => {
              slotRefs.current[index] = element;
            }}
            maskRef={(element) => {
              maskRefs.current[index] = element;
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

function CarouselItem({
  index,
  label,
  disabled,
  onAction,
  onFocus,
  slotRef,
  maskRef,
  style,
  styles,
  classNames,
  children,
}: {
  index: number;
  label: string;
  disabled: boolean;
  onAction?: () => void;
  onFocus: (event: FocusEvent<HTMLDivElement>) => void;
  slotRef: (element: HTMLDivElement | null) => void;
  maskRef: (element: HTMLDivElement | null) => void;
  style: CSSProperties;
  styles: ReturnType<typeof carouselStyles>;
  classNames?: CarouselClassNames;
  children: ReactNode;
}) {
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
      }}
      role="group"
      aria-roledescription="slide"
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
      className={styles.item({ class: classNames?.item })}
    >
      <div
        ref={maskRef}
        {...(interactive ? states : {})}
        className={styles.mask({ class: classNames?.mask })}
      >
        {children}
        {interactive && (
          <span
            aria-hidden="true"
            {...states}
            data-focus-visible={focusVisible}
            className={styles.stateLayer({ class: classNames?.stateLayer })}
          />
        )}
      </div>
    </div>
  );
}
