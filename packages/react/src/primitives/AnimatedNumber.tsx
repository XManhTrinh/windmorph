'use client';

import { useMotionValueEvent } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ComponentPropsWithRef } from 'react';
import { useLocale } from 'react-aria';
import { useEntrance } from '../motion/use-entrance';
import { useM3SpringValue } from '../motion/use-m3-spring-value';

export interface AnimatedNumberProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The number to show. A new value springs from the one showing. */
  value: number;
  /**
   * Formats the number as it moves and at rest. While it moves it is given figures with the
   * value's own decimals, so a whole number counts in whole numbers.
   * @default `Intl.NumberFormat` in the nearest `LocaleProvider`'s locale (else the browser's),
   * with the value's own decimals (at most 3)
   */
  format?: (value: number) => string;
  /**
   * Where the number counts up from as it first comes into view (an entrance). Left out, it
   * shows `value` from the start. Never replayed for a number on screen as the page hydrates.
   */
  from?: number;
  /** Seconds a count from rest waits before it starts. @default 0 */
  delay?: number;
}

/** The decimals a number is written with: `1.5e-7` has 8. */
const decimalsOf = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  const [mantissa = '', exponent = '0'] = String(value).split('e');
  const point = mantissa.indexOf('.');
  const written = point < 0 ? 0 : mantissa.length - point - 1;
  return Math.min(20, Math.max(0, written - Number(exponent)));
};

// As `Intl.NumberFormat`'s own default: a computed value (2 / 3) shows 0.667, not 16 decimals.
const MOST_DEFAULT_DECIMALS = 3;

/**
 * A number that springs between values on the theme's spatial spring, formatted by `format`.
 * Assistive technology reads only the value it settles on, once, and the number's box keeps that
 * value's width while counting (the moving figure is laid over it, right-aligned so the last
 * digit stays put), so nothing beside it moves; a copy gives the figure once. The root takes any
 * display (inline, a block, a centred line). It never shows a figure past the one it is moving to
 * (a spring's overshoot is held at the target). It isn't a live region: announcing a change is
 * the app's choice. Under reduced motion it changes at once. In the server's HTML it is the final
 * value.
 *
 * Counting down inline, a figure wider than the final one runs over what's before it until it
 * narrows; give it room (a cell, a tile's line of its own) where that matters. Inside a link the
 * box is drawn as one inline block, so the link's underline skips it.
 *
 * @example
 * <AnimatedNumber value={1284} from={0} />
 */
export function AnimatedNumber({
  value,
  format,
  from,
  delay = 0,
  className,
  ref,
  ...props
}: AnimatedNumberProps) {
  const { locale } = useLocale();
  // The default reads the value as Intl would at three decimals, so a float's leftover (0.1 + 0.2)
  // isn't padded with zeros.
  const decimals = format
    ? decimalsOf(value)
    : decimalsOf(Number(value.toFixed(MOST_DEFAULT_DECIMALS)));
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals],
  );
  const show = format ?? ((number: number) => formatter.format(number));
  // It watches its own box, which always has one (the final value's size) and is never given
  // away: a root shown as `contents` has none, and an app's ref (an inline callback, merged refs)
  // would make it watch again on each render.
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const { entered, inView } = useEntrance(boxRef);
  const target = from !== undefined && !entered ? from : value;
  const spring = useM3SpringValue(target, { delay, animate: inView });

  // The span of the current move: the figure showing when it began (not the spring's own value,
  // which may be past the last target), and where it's going.
  const bounds = useRef({ low: target, high: target });
  const shown = useRef(target);
  useEffect(() => {
    bounds.current = {
      low: Math.min(shown.current, target),
      high: Math.max(shown.current, target),
    };
  }, [target]);

  // The moving text is written by the spring alone: React rendering it would flash the new
  // value for a frame before the spring's first step. A new format or locale rewrites it.
  // A moving figure keeps the value's own decimals (a whole number counts in whole numbers),
  // whatever `format` does with them.
  const write = (next: number) => {
    const { low, high } = bounds.current;
    const scale = 10 ** decimals;
    // Held within the move's span (none to hold within when either end isn't a number), and
    // rounded toward the target where plain rounding would land outside it (4.3 rising to 10
    // shows 5, never 4).
    const held = Number.isFinite(low) && Number.isFinite(high);
    const clamped = held ? Math.min(high, Math.max(low, next)) : next;
    let figure = Math.round(clamped * scale) / scale;
    if (held && figure < low) figure = Math.ceil(clamped * scale) / scale;
    if (held && figure > high) figure = Math.floor(clamped * scale) / scale;
    shown.current = figure;
    if (textRef.current) textRef.current.textContent = show(figure);
  };
  useMotionValueEvent(spring, 'change', write);
  useEffect(() => write(spring.get()));
  const [firstText] = useState(() => show(target));

  const final = show(value);
  return (
    <span data-slot="animated-number" {...props} ref={ref} className={className}>
      {/* A box as wide as the final value wherever the root lays it out (inline, a block, a
          centred line), with the moving figure laid over it. */}
      <span ref={boxRef} aria-hidden="true" className="relative inline-grid whitespace-nowrap">
        <span className="invisible [grid-area:1/1]">{final}</span>
        {/* Out of the box's sizing, so a longer figure counting down never widens it. */}
        <span
          ref={textRef}
          data-slot="figure"
          className="absolute top-0 right-0 whitespace-nowrap [grid-area:1/1]"
        >
          {firstText}
        </span>
      </span>
      <span className="sr-only select-none">{final}</span>
    </span>
  );
}
