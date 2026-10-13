'use client';

import { cubicBezier } from 'motion/react';
import { useEffect, useState, type RefObject } from 'react';

/** How a top app bar responds to the content scrolling under it (Compose's scroll behaviours). */
export type TopAppBarScrollBehavior = 'pinned' | 'enter-always' | 'exit-until-collapsed';

/** Compose's `TopTitleAlphaEasing` for the collapsed title of a two-row bar. */
const topTitleAlpha = cubicBezier(0.8, 0, 0.8, 0.15);
/** Compose's `FastOutLinearInEasing`, used to blend the container colour. */
const fastOutLinearIn = cubicBezier(0.4, 0, 1, 1);

interface AppBarScrollOptions {
  behavior: TopAppBarScrollBehavior | undefined;
  rootRef: RefObject<HTMLElement | null>;
  /** The part of the bar that collapses: the expanded row, or the whole single-row bar. */
  collapsibleRef: RefObject<HTMLElement | null>;
  scrollRef?: RefObject<HTMLElement | null>;
  twoRows: boolean;
}

export interface AppBarScrollState {
  /** Content is scrolled under the bar. */
  scrolled: boolean;
  /** A two-row bar is more than half collapsed (its collapsed title is the one announced). */
  collapsed: boolean;
}

/**
 * Ports Compose's top app bar scroll behaviours to page scrolling. The bar's offset
 * (Compose's `heightOffset`, 0 down to minus the collapsible height) is written to
 * `--m3-app-bar-offset`, which the sticky bar uses as its `top`, so the bar moves without
 * changing its layout height and the content below never shifts. Colour and title alphas
 * are written as custom properties too, so scrolling causes no React renders.
 *
 * - `pinned`: the bar stays; only its colour responds.
 * - `enter-always`: scrolling down hides the collapsible part, any scroll up brings it back.
 * - `exit-until-collapsed`: scrolling down collapses it; it expands only near the top.
 */
export function useAppBarScroll({
  behavior,
  rootRef,
  collapsibleRef,
  scrollRef,
  twoRows,
}: AppBarScrollOptions): AppBarScrollState {
  const [state, setState] = useState<AppBarScrollState>({ scrolled: false, collapsed: false });

  useEffect(() => {
    const root = rootRef.current;
    if (!behavior || !root) return;
    const scroller = scrollRef?.current;
    const target: HTMLElement | Window = scroller ?? window;
    const position = () => Math.max(0, scroller ? scroller.scrollTop : window.scrollY);

    let last = position();
    let offset = 0;
    let frame = 0;
    let current: AppBarScrollState = { scrolled: false, collapsed: false };

    const update = () => {
      frame = 0;
      const scroll = position();
      const delta = scroll - last;
      last = scroll;
      // The collapsible height, measured each time so wrapped titles and resizes count.
      const limit = collapsibleRef.current?.offsetHeight ?? 0;
      if (behavior === 'enter-always') offset = Math.min(0, Math.max(-limit, offset - delta));
      else if (behavior === 'exit-until-collapsed') offset = -Math.min(scroll, limit);
      else offset = 0;
      const fraction = limit > 0 ? -offset / limit : 0;

      root.style.setProperty('--m3-app-bar-offset', `${offset}px`);
      if (twoRows) {
        root.style.setProperty('--m3-app-bar-scrolled', `${fastOutLinearIn(fraction) * 100}%`);
        root.style.setProperty('--m3-app-bar-top-alpha', String(topTitleAlpha(fraction)));
        root.style.setProperty('--m3-app-bar-bottom-alpha', String(1 - fraction));
      } else {
        root.style.setProperty('--m3-app-bar-scrolled', scroll > 0 ? '100%' : '0%');
      }
      const next = { scrolled: scroll > 0, collapsed: twoRows && fraction >= 0.5 };
      if (next.scrolled !== current.scrolled || next.collapsed !== current.collapsed) {
        current = next;
        setState(next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      for (const name of [
        '--m3-app-bar-offset',
        '--m3-app-bar-scrolled',
        '--m3-app-bar-top-alpha',
        '--m3-app-bar-bottom-alpha',
      ])
        root.style.removeProperty(name);
    };
  }, [behavior, rootRef, collapsibleRef, scrollRef, twoRows]);

  return behavior ? state : { scrolled: false, collapsed: false };
}
