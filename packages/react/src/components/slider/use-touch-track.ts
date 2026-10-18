'use client';

import { useEffect, useRef, type HTMLAttributes, type PointerEvent, type RefObject } from 'react';
import type { SliderState } from 'react-stately';

/** How far a touch moves along the track before it drags the slider (Android's touch slop). */
export const TOUCH_SLOP = 8;

interface TouchTrackOptions {
  state: SliderState;
  trackRef: RefObject<HTMLElement | null>;
  orientation: 'horizontal' | 'vertical';
  direction: 'ltr' | 'rtl';
  disabled: boolean;
  /**
   * A discrete slider with drawn stops (`ticks`): its values are spread between the track's
   * corners (`positionOf`), so a press maps back through the same inset.
   */
  discrete?: boolean;
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
 * With drawn stops (`discrete`), every press, the mouse's too, maps through the corner inset
 * the stops and thumb are drawn with (`(offset − corner) / (length − 2 × corner)`), so a tap
 * on a drawn stop selects that stop: React Aria's linear mapping picked the next one near the
 * ends of a large slider, whose corners are wider than half a step (2026-10-17).
 *
 * Returns handlers that wrap React Aria's `trackProps`.
 */
export function useTouchTrack(
  trackProps: HTMLAttributes<HTMLElement>,
  { state, trackRef, orientation, direction, disabled, discrete = false }: TouchTrackOptions,
): HTMLAttributes<HTMLElement> {
  const vertical = orientation === 'vertical';
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);

  /** The track's corner in px (`--m3-slider-corner`, which a token may set as any length). */
  const cornerOf = (track: HTMLElement) => {
    if (!discrete) return 0;
    const probe = track.ownerDocument.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--m3-slider-corner)';
    track.append(probe);
    const corner = probe.getBoundingClientRect().width;
    probe.remove();
    return corner;
  };

  const percentAt = (clientX: number, clientY: number, corner: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const size = vertical ? rect.height : rect.width;
    // Along the track from its minimum end.
    const offset = vertical
      ? rect.bottom - clientY
      : direction === 'rtl'
        ? rect.right - clientX
        : clientX - rect.left;
    const span = size - 2 * corner;
    const percent = span > 0 ? (offset - corner) / span : 0;
    return Math.min(1, Math.max(0, percent));
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const mouse = event.pointerType === 'mouse';
    // A press on a thumb drags that thumb (React Aria's thumb handling).
    const onThumb = (event.target as Element).closest?.('[data-thumb]');
    if (
      (mouse && (!discrete || event.button !== 0)) ||
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
    const corner = cornerOf(track);
    let dragging: number | null = null;
    const startDragging = (index: number, percent: number) => {
      dragging = index;
      try {
        track.setPointerCapture(pointerId);
      } catch {
        // The pointer may already be gone.
      }
      state.setFocusedThumb(index);
      state.setThumbDragging(index, true);
      state.setThumbPercent(index, percent);
    };
    // The mouse (on a discrete slider) sets the value as it goes down and drags from there,
    // as React Aria does; a touch waits to tell a tap, a drag and a scroll apart.
    if (mouse) {
      const percent = percentAt(startX, startY, corner);
      const index = closestThumb(state, state.getPercentValue(percent));
      if (!state.isThumbEditable(index)) return;
      startDragging(index, percent);
    }

    const move = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (dragging === null) {
        const along = Math.abs(vertical ? e.clientY - startY : e.clientX - startX);
        const across = Math.abs(vertical ? e.clientX - startX : e.clientY - startY);
        // A move across the track belongs to the page (or a sheet the slider sits in): it's
        // no longer a tap either.
        if (across >= TOUCH_SLOP && across >= along) return end();
        if (along < TOUCH_SLOP || along <= across) return;
        const percent = percentAt(e.clientX, e.clientY, corner);
        const index = closestThumb(state, state.getPercentValue(percent));
        if (!state.isThumbEditable(index)) return end();
        startDragging(index, percent);
        return;
      }
      state.setThumbPercent(dragging, percentAt(e.clientX, e.clientY, corner));
    };
    const up = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (dragging !== null) {
        state.setThumbDragging(dragging, false);
      } else {
        // A tap: the nearest thumb jumps to it on release.
        const value = state.getPercentValue(percentAt(e.clientX, e.clientY, corner));
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
