'use client';

import { useMotionValueEvent } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ComponentPropsWithRef } from 'react';
import { useLocale, useObjectRef } from 'react-aria';
import { useEntrance } from '../motion/use-entrance';
import { useM3SpringValue } from '../motion/use-m3-spring-value';
import { cn } from '../utils/cn';

export interface AnimatedNumberProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The number to show. A new value springs from the one showing. */
  value: number;
  /**
   * Formats the number as it moves and at rest.
   * @default `Intl.NumberFormat` in the page's locale, with the value's own decimals
   */
  format?: (value: number) => string;
  /**
   * Where the number counts up from as it first comes into view (an entrance). Left out, it
   * shows `value` from the start. Never replayed for a number on screen as the page hydrates.
   */
  from?: number;
  /** Seconds before the number starts to move. @default 0 */
  delay?: number;
}

const decimalsOf = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  const text = String(value);
  const exponent = text.indexOf('e-');
  if (exponent >= 0) return Math.min(20, Number(text.slice(exponent + 2)));
  const point = text.indexOf('.');
  return point < 0 ? 0 : Math.min(20, text.length - point - 1);
};

/**
 * A number that springs between values on the theme's spatial spring, formatted by `format`.
 * Assistive technology reads only the value it settles on, once, and the box keeps that value's
 * width while counting, so nothing beside it moves. It never shows a figure past the one it is
 * moving to (a spring's overshoot is held at the target). It isn't a live region: announcing a
 * change is the app's choice. Under reduced motion it changes at once. In the server's HTML it
 * is the final value.
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
  const decimals = decimalsOf(value);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals],
  );
  const show = format ?? ((number: number) => formatter.format(number));
  const rootRef = useObjectRef(ref);
  const textRef = useRef<HTMLSpanElement>(null);
  const { entered, inView } = useEntrance(rootRef);
  const target = from !== undefined && !entered ? from : value;
  const spring = useM3SpringValue(target, { delay, animate: inView });

  // The span of the current move: what showed when it began, and where it's going.
  const bounds = useRef({ low: target, high: target });
  useEffect(() => {
    const showing = spring.get();
    bounds.current = { low: Math.min(showing, target), high: Math.max(showing, target) };
  }, [spring, target]);

  // The moving text is written by the spring alone: React rendering it would flash the new
  // value for a frame before the spring's first step. A new format or locale rewrites it.
  const write = (next: number) => {
    const { low, high } = bounds.current;
    if (textRef.current) textRef.current.textContent = show(Math.min(high, Math.max(low, next)));
  };
  useMotionValueEvent(spring, 'change', write);
  useEffect(() => write(spring.get()));
  const [firstText] = useState(() => show(target));

  const final = show(value);
  return (
    <span
      data-slot="animated-number"
      {...props}
      ref={rootRef}
      className={cn('inline-grid', className)}
    >
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {final}
      </span>
      <span ref={textRef} aria-hidden="true" className="justify-self-end [grid-area:1/1]">
        {firstText}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
