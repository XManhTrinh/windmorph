'use client';

import { useEffect, useRef, type DOMAttributes, type PointerEvent, type RefObject } from 'react';
import type { SliderState } from 'react-stately';

/** How far a touch moves along the track before it drags the slider (Android's touch slop). */
export const TOUCH_SLOP = 8;

interface TouchTrackOptions {
  state: SliderState;
  trackRef: RefObject<HTMLElement | null>;
  orientation: 'horizontal' | 'vertical';
  direction: 'ltr' | 'rtl';
  disabled: boolean;
}

/** The thumb nearest to `value`, picked as React Aria's track press picks it. */
function closestThumb(state: SliderState, value: number): number {
  const split = state.values.findIndex((v) => value - v < 0);
  if (split === 0) return 0;
  if (split === -1) return state.values.length - 1;
  const before = state.values[split - 1]!;
  const after = state.values[split]!;
  return Math.abs(before - value) < Math.abs(after - value) ? split - 1 : split;
}

/**
 * Touch and pen presses on a slider's track, as Compose's slider takes them
 * (`Slider.kt`: `draggable(orientation)` and a tap that sets the value on release).
 * React Aria sets the value on pointer down and claims every move, so a vertical swipe that
 * started on a horizontal slider changed its value and never scrolled the page. Here a touch
 * changes nothing until it either lifts (a tap: the nearest thumb jumps there) or moves
 * `TOUCH_SLOP` along the track (a drag: the nearest thumb follows the finger). A swipe across
 * the track is left to the browser, which scrolls (the slider's `touch-action` allows the
 * cross axis) and cancels the pointer. Mouse presses keep React Aria's handling.
 *
 * Returns handlers that wrap React Aria's `trackProps`.
 */
export function useTouchTrack(
  trackProps: DOMAttributes<HTMLElement>,
  { state, trackRef, orientation, direction, disabled }: TouchTrackOptions,
): DOMAttributes<HTMLElement> {
  const vertical = orientation === 'vertical';
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);

  const percentAt = (clientX: number, clientY: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const size = vertical ? rect.height : rect.width;
    const offset = vertical ? clientY - rect.top : clientX - rect.left;
    let percent = size > 0 ? offset / size : 0;
    if (vertical || direction === 'rtl') percent = 1 - percent;
    return Math.min(1, Math.max(0, percent));
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') {
      trackProps.onPointerDown?.(event);
      return;
    }
    // A press on a thumb drags that thumb (React Aria's thumb handling).
    const onThumb = (event.target as Element).closest?.('[data-thumb]');
    if (
      onThumb ||
      disabled ||
      !trackRef.current ||
      state.values.some((_, index) => state.isThumbDragging(index))
    ) {
      trackProps.onPointerDown?.(event);
      return;
    }
    // No compatibility mouse events (React Aria's `onMouseDown` would set the value);
    // `touch-action` still lets the browser scroll.
    event.preventDefault();
    cleanup.current?.();
    const { pointerId, clientX: startX, clientY: startY } = event;
    const track = trackRef.current;
    let dragging: number | null = null;

    const move = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (dragging === null) {
        const along = Math.abs(vertical ? e.clientY - startY : e.clientX - startX);
        const across = Math.abs(vertical ? e.clientX - startX : e.clientY - startY);
        if (along < TOUCH_SLOP || along <= across) return;
        const percent = percentAt(e.clientX, e.clientY);
        const index = closestThumb(state, state.getPercentValue(percent));
        if (!state.isThumbEditable(index)) return end();
        dragging = index;
        try {
          track.setPointerCapture(pointerId);
        } catch {
          // The pointer may already be gone.
        }
        state.setFocusedThumb(index);
        state.setThumbDragging(index, true);
        state.setThumbPercent(index, percent);
        return;
      }
      state.setThumbPercent(dragging, percentAt(e.clientX, e.clientY));
    };
    const up = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (dragging !== null) {
        state.setThumbDragging(dragging, false);
      } else {
        // A tap: the nearest thumb jumps to it on release.
        const value = state.getPercentValue(percentAt(e.clientX, e.clientY));
        const index = closestThumb(state, value);
        if (state.isThumbEditable(index)) {
          state.setFocusedThumb(index);
          state.setThumbDragging(index, true);
          state.setThumbValue(index, value);
          state.setThumbDragging(index, false);
        }
      }
      end();
    };
    // The browser took the touch to scroll: nothing changes.
    const cancel = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (dragging !== null) state.setThumbDragging(dragging, false);
      end();
    };
    function end() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      cleanup.current = null;
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    cleanup.current = end;
  };

  return {
    ...trackProps,
    onPointerDown,
    // Touches arrive as pointer events; React Aria's touch handler would set the value on
    // touch start.
    onTouchStart: typeof PointerEvent === 'undefined' ? trackProps.onTouchStart : undefined,
    style: { ...trackProps.style, touchAction: vertical ? 'pan-x' : 'pan-y' },
  };
}
