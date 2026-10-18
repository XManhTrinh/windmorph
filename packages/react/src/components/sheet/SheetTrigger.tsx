'use client';

import { Children, createContext, useRef, type ReactNode } from 'react';
import { useOverlayTrigger } from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import {
  TriggerContext,
  useTriggerProps,
  type TriggerContextValue,
} from '../../primitives/TriggerContext';

export interface SheetTriggerContextValue {
  state: OverlayTriggerState;
  overlayProps: { id?: string };
}

/** Set by {@link SheetTrigger} for the modal sheet inside it. */
export const SheetTriggerContext = createContext<SheetTriggerContextValue | null>(null);

export interface SheetTriggerProps {
  /** The trigger (a library button) followed by a `BottomSheet` or modal `SideSheet`. */
  children: ReactNode;
  /** Whether the sheet is open (controlled). */
  open?: boolean;
  /** Whether the sheet starts open when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the sheet opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Opens a modal {@link BottomSheet} or {@link SideSheet} from a button.
 *
 * @example
 * <SheetTrigger>
 *   <Button>Share</Button>
 *   <BottomSheet aria-label="Share">…</BottomSheet>
 * </SheetTrigger>
 */
export function SheetTrigger({ children, open, defaultOpen, onOpenChange }: SheetTriggerProps) {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, triggerRef);
  const triggerValue = useTriggerProps({
    ...(triggerProps as TriggerContextValue),
    ref: triggerRef,
  });
  const [trigger, ...sheet] = Children.toArray(children);
  return (
    <SheetTriggerContext value={{ state, overlayProps }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {sheet}
    </SheetTriggerContext>
  );
}
