'use client';

import { useEffect, useState, type RefObject } from 'react';

interface ScrollToggleOptions {
  scrollRef?: RefObject<HTMLElement | null>;
  /** Scroll distance (px) back towards the start before the toggle turns on. */
  onThreshold: number;
  /** Scroll distance (px) away from the start before the toggle turns off. */
  offThreshold: number;
  reverse: boolean;
  initial: boolean;
}

/**
 * Turns off after the content scrolls `offThreshold` px away from its start and back on
 * after it scrolls `onThreshold` px back towards it (a port of Compose's
 * `floatingToolbarVerticalNestedScroll`, whose content offset grows as the content scrolls
 * back towards its start).
 */
function useScrollToggle({
  scrollRef,
  onThreshold,
  offThreshold,
  reverse,
  initial,
}: ScrollToggleOptions): boolean {
  const [on, setOn] = useState(initial);

  useEffect(() => {
    const element = scrollRef?.current;
    const target: HTMLElement | Window = element ?? window;
    const position = () => (element ? element.scrollTop : window.scrollY);
    const factor = reverse ? -1 : 1;
    let isOn = initial;
    let last = position();
    let contentOffset = 0;
    let threshold = isOn ? -offThreshold : onThreshold;

    const onScroll = () => {
      const current = position();
      const delta = (last - current) * factor;
      last = current;
      contentOffset += delta;
      if (delta < 0 && contentOffset <= threshold) {
        threshold = contentOffset + onThreshold;
        if (isOn) setOn((isOn = false));
      } else if (delta > 0 && contentOffset >= threshold) {
        threshold = contentOffset - offThreshold;
        if (!isOn) setOn((isOn = true));
      }
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [scrollRef, onThreshold, offThreshold, reverse, initial]);

  return on;
}

export interface ToolbarScrollExpansionOptions {
  /** The scroll container. Defaults to the window. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Scroll distance (px) back towards the top before the toolbar expands. @default 40 */
  expandThreshold?: number;
  /** Scroll distance (px) down before the toolbar collapses. @default 40 */
  collapseThreshold?: number;
  /** For content whose start is at the bottom (e.g. a chat), which reverses the direction. */
  reverse?: boolean;
  /** @default true */
  defaultExpanded?: boolean;
}

/**
 * Collapses a floating toolbar while the content scrolls down and expands it when it
 * scrolls back up, after a 40px threshold each way (a port of Compose's
 * `floatingToolbarVerticalNestedScroll`). Pass the result to `FloatingToolbar`'s
 * `expanded`.
 *
 * @example
 * const expanded = useToolbarScrollExpansion();
 * <FloatingToolbar aria-label="Actions" expanded={expanded} …>
 */
export function useToolbarScrollExpansion({
  scrollRef,
  expandThreshold = 40,
  collapseThreshold = 40,
  reverse = false,
  defaultExpanded = true,
}: ToolbarScrollExpansionOptions = {}): boolean {
  return useScrollToggle({
    scrollRef,
    onThreshold: expandThreshold,
    offThreshold: collapseThreshold,
    reverse,
    initial: defaultExpanded,
  });
}

export interface ToolbarScrollExitOptions {
  /** The scroll container. Defaults to the window. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Scroll distance (px) back towards the top before the toolbar returns. @default 40 */
  showThreshold?: number;
  /** Scroll distance (px) down before the toolbar leaves the screen. @default 40 */
  hideThreshold?: number;
  /** For content whose start is at the bottom (e.g. a chat), which reverses the direction. */
  reverse?: boolean;
  /** @default true */
  defaultVisible?: boolean;
}

/**
 * Slides a docked or floating toolbar off the screen while the content scrolls down, and
 * brings it back when it scrolls up, after a 40px threshold each way (M3's "animate
 * offscreen" scroll behaviour, Compose's `exitAlwaysScrollBehavior`). Pass the result to
 * the toolbar's `visible`. Use it instead of `useToolbarScrollExpansion`, not with it.
 *
 * @example
 * const visible = useToolbarScrollExit();
 * <DockedToolbar aria-label="Actions" visible={visible} className="fixed inset-x-0 bottom-0">…
 */
export function useToolbarScrollExit({
  scrollRef,
  showThreshold = 40,
  hideThreshold = 40,
  reverse = false,
  defaultVisible = true,
}: ToolbarScrollExitOptions = {}): boolean {
  return useScrollToggle({
    scrollRef,
    onThreshold: showThreshold,
    offThreshold: hideThreshold,
    reverse,
    initial: defaultVisible,
  });
}
