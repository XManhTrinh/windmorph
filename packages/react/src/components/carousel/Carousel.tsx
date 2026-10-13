'use client';

import {
  Children,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { useObjectRef } from 'react-aria';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import {
  createStrategy,
  heroKeylineList,
  keylinesForScrollOffset,
  maxScrollOffset,
  multiBrowseKeylineList,
  placeItem,
  snapPositionOffset,
  uncontainedKeylineList,
  type Strategy,
} from './carousel-keylines';
import { carouselStyles } from './carousel-styles';

export interface CarouselClassNames {
  root?: string;
  scroller?: string;
  item?: string;
  /** The masked layer of each item (corners, clipping). */
  mask?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface CarouselOwnProps {
  /**
   * `multi-browse` shows large, medium and small items; `uncontained` shows fixed-size items
   * with the last one cut off; `hero` shows one large item with small ones beside it.
   * @default "multi-browse"
   */
  variant?: 'multi-browse' | 'uncontained' | 'hero';
  /** @default "horizontal" */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Preferred size of the large items along the carousel (multi-browse, hero). Hero defaults
   * to the whole carousel. @default 186
   */
  preferredItemSize?: number;
  /** Size of the items along the carousel (uncontained). @default 240 */
  itemSize?: number;
  /** Space between items, px. @default 8 */
  itemSpacing?: number;
  /** Centre the large hero item between small ones. @default "start" */
  heroAlignment?: 'start' | 'center';
  /** Minimum size of the small items. @default 40 */
  minSmallItemSize?: number;
  /** Maximum size of the small items. @default 56 */
  maxSmallItemSize?: number;
  /** The items, e.g. images; each fills its slot and is clipped to its keyline. */
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  classNames?: CarouselClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type CarouselProps = CarouselOwnProps & Naming;

/**
 * M3 Expressive carousel: a scrollable row (or column) of items whose sizes follow Compose's
 * keylines as they scroll: multi-browse (large, medium and small items), uncontained, or
 * hero. Give it a height (or a width, vertical) with `className`.
 *
 * @example
 * <Carousel aria-label="Photos" className="h-[221px]">
 *   {photos.map((photo) => <img key={photo.id} src={photo.src} alt={photo.alt} className="size-full object-cover" />)}
 * </Carousel>
 */
export function Carousel({
  variant = 'multi-browse',
  orientation = 'horizontal',
  preferredItemSize,
  itemSize = 240,
  itemSpacing = 8,
  heroAlignment = 'start',
  minSmallItemSize,
  maxSmallItemSize,
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
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;
  const vertical = orientation === 'vertical';
  const rootRef = useObjectRef(ref);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const maskRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [space, setSpace] = useState(0);

  const strategy = computeStrategy();
  function computeStrategy(): Strategy | null {
    if (space === 0 || count === 0) return null;
    const keylines =
      variant === 'uncontained'
        ? uncontainedKeylineList(space, itemSize, itemSpacing)
        : variant === 'hero'
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
    const result = createStrategy(keylines, space, itemSpacing);
    return result.isValid ? result : null;
  }

  // Writes each item's mask and translation for the current scroll position, without
  // re-rendering (Compose's `carouselItem` layer block).
  const update = () => {
    const scroller = scrollerRef.current;
    if (!scroller || !strategy) return;
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
        ? `inset(${inset}px 0 ${inset}px 0 round var(--m3-carousel-corner))`
        : `inset(0 ${inset}px 0 ${inset}px round var(--m3-carousel-corner))`;
      mask.style.setProperty('--m3-carousel-item-size', `${round(size)}px`);
    });
  };

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => setSpace(vertical ? scroller.clientHeight : scroller.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [vertical]);

  useLayoutEffect(() => {
    update();
    const scroller = scrollerRef.current;
    if (!scroller) return;
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
  // paused while dragging and resumes on release.
  const drag = useRef<{ start: number; scroll: number; id: number } | null>(null);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
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

  const snapping = variant === 'uncontained' ? 'none' : 'single';
  const styles = carouselStyles({ orientation, snapping });
  const fallbackSize = variant === 'uncontained' ? itemSize : (preferredItemSize ?? 186);
  const slotSize = strategy?.itemMainAxisSize ?? fallbackSize;

  return (
    <div
      {...data}
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      aria-labelledby={labelledBy}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div
        ref={scrollerRef}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ gap: itemSpacing }}
        className={styles.scroller({ class: classNames?.scroller })}
      >
        {items.map((item, index) => (
          <div
            key={item.key ?? index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            style={{
              [vertical ? 'height' : 'width']: slotSize,
              [vertical ? 'scrollMarginBlockStart' : 'scrollMarginInlineStart']: strategy
                ? snapPositionOffset(strategy, index, count)
                : 0,
            }}
            className={styles.item({ class: classNames?.item })}
          >
            <div
              ref={(element) => {
                maskRefs.current[index] = element;
              }}
              className={styles.mask({ class: classNames?.mask })}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
