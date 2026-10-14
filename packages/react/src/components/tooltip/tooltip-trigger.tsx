'use client';

/*
 * The trigger side of the tooltips: the state, the trigger's props and the contexts the
 * tooltips read. It holds none of the tooltip's own rendering (positioning, the overlay, the
 * motion), so components that show a tooltip only on hover or focus (`IconButton`, `Fab`,
 * `Toolbar`'s FAB, the pickers) import this and load the tooltip itself on demand
 * (`LazyTooltip`).
 */

import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  type DOMAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { mergeProps, useLongPress, useTooltipTrigger } from 'react-aria';
import {
  useTooltipTriggerState,
  type OverlayTriggerState,
  type TooltipTriggerState,
} from 'react-stately';
import {
  TriggerContext,
  useTriggerProps,
  type TriggerContextValue,
} from '../../primitives/TriggerContext';
import { TooltipPlacementContext, type TooltipPlacement } from './tooltip-placement';

/**
 * The spec: 4px from an anchor with a visual boundary (a button), 8px from one without (text).
 * A caret (8px) sits in the gap.
 */
export const DEFAULT_OFFSET = 4;

/** "Both plain and rich tooltips disappear 1.5 seconds after navigating away." */
export const CLOSE_DELAY = 1500;

/**
 * The spec's touch trigger: "tap and hold the element on mobile". A touch long press opens
 * the tooltip (without pressing the button), and it closes 1.5s after the finger lifts.
 */
export function useTouchLongPress(
  open: () => void,
  close: () => void,
  isDisabled: boolean | undefined,
): DOMAttributes<HTMLElement> {
  const release = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      if (release.current) window.removeEventListener('pointerup', release.current);
    },
    [],
  );
  const { longPressProps } = useLongPress({
    isDisabled,
    pointerType: 'touch',
    onLongPress: () => {
      open();
      if (release.current) window.removeEventListener('pointerup', release.current);
      const onRelease = () => {
        release.current = null;
        close();
      };
      release.current = onRelease;
      window.addEventListener('pointerup', onRelease, { once: true });
    },
  });
  // Only the pointer side: its keyboard handling would compete with the trigger's own.
  return { onPointerDown: longPressProps.onPointerDown };
}

/* ------------------------------------------------------------------ Plain */

/** What a `TooltipTrigger` gives its `Tooltip`. */
export interface TooltipContextValue {
  state: TooltipTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  tooltipProps: HTMLAttributes<HTMLElement>;
  placement: TooltipPlacement;
  offset: number;
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export interface TooltipTriggerProps {
  /** The trigger (a library button or anything reading `TriggerContext`), then a `<Tooltip>`. */
  children: ReactNode;
  /** Milliseconds of hover before showing (Compose shows at once). @default 0 */
  delay?: number;
  /** Milliseconds before hiding after the pointer leaves or a touch lifts (the spec's 1.5s). @default 1500 */
  closeDelay?: number;
  /** @default "top", or the enclosing `TooltipPlacementContext` (`bottom` in app bars) */
  placement?: TooltipPlacement;
  /** Distance from the anchor in px: 4 for an anchor with a visual boundary, 8 for text. @default 4 */
  offset?: number;
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Shows a plain {@link Tooltip} while its trigger is hovered or keyboard-focused, or after a
 * touch long press. The tooltip describes the trigger (`aria-describedby`), stays while the
 * pointer is over it and for 1.5s after it leaves, and Escape hides it.
 *
 * @example
 * <TooltipTrigger>
 *   <IconButton icon={<StarIcon />} aria-label="Favourite" />
 *   <Tooltip>Add to favourites</Tooltip>
 * </TooltipTrigger>
 */
export function TooltipTrigger({
  children,
  delay = 0,
  closeDelay = CLOSE_DELAY,
  placement: placementProp,
  offset = DEFAULT_OFFSET,
  isDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
}: TooltipTriggerProps) {
  const contextPlacement = useContext(TooltipPlacementContext);
  const placement = placementProp ?? contextPlacement ?? 'top';
  const options = { delay, closeDelay, isDisabled, isOpen, defaultOpen, onOpenChange };
  const state = useTooltipTriggerState(options);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(options, state, triggerRef);
  const longPressProps = useTouchLongPress(
    () => state.open(true),
    () => state.close(),
    isDisabled,
  );
  const triggerValue = useTriggerProps({
    ...(mergeProps(triggerProps, longPressProps) as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...tooltip] = Children.toArray(children);
  return (
    <TooltipContext value={{ state, triggerRef, tooltipProps, placement, offset }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {tooltip}
    </TooltipContext>
  );
}

/* ------------------------------------------------------------------- Rich */

/** What a `RichTooltipTrigger` gives its `RichTooltip`. */
export type RichContextValue = {
  triggerRef: RefObject<HTMLElement | null>;
  placement: TooltipPlacement;
  offset: number;
} & (
  | { persistent: true; state: OverlayTriggerState; overlayProps: HTMLAttributes<HTMLElement> }
  | { persistent: false; state: TooltipTriggerState; tooltipProps: HTMLAttributes<HTMLElement> }
);

export const RichContext = createContext<RichContextValue | null>(null);

/**
 * Whether the caller is inside a `TooltipTrigger` or `RichTooltipTrigger`, so its trigger
 * already has a tooltip. Icon buttons, which show their label as a tooltip by default, use
 * it to step aside for a tooltip the app wrapped them in.
 */
export function useInTooltipTrigger(): boolean {
  const plain = useContext(TooltipContext);
  const rich = useContext(RichContext);
  return plain !== null || rich !== null;
}
