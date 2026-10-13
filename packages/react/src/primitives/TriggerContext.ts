'use client';

import { createContext, useContext, type DOMAttributes, type Ref } from 'react';
import { mergeProps, type PressEvent } from 'react-aria';

/** Props an overlay trigger (dialog, menu) gives the button that opens it. */
export interface TriggerContextValue extends DOMAttributes<HTMLElement> {
  onPress?: (event: PressEvent) => void;
  /** Menus open on press start. */
  onPressStart?: (event: PressEvent) => void;
  /** Menu triggers keep focus where it is on press (React Aria `useMenuTrigger`). */
  preventFocusOnPress?: boolean;
  'aria-haspopup'?: boolean | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | 'true' | 'false';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  id?: string;
  /** The trigger element, e.g. for positioning a menu next to it. */
  ref?: Ref<HTMLElement>;
}

/**
 * Lets an overlay trigger wire up whichever button-like child opens it (Button,
 * IconButton, Fab, a pressable Card) without cloning elements: `ButtonBase` merges these
 * props into its own. Overlays reset it to `null` so buttons inside them are unaffected.
 */
export const TriggerContext = createContext<TriggerContextValue | null>(null);

/**
 * The value a trigger gives its button: its own props merged into an enclosing trigger's,
 * so triggers nest (a `TooltipTrigger` around a `MenuTrigger`, or the other way round)
 * and the button gets both. Handlers are chained, refs merged and ids kept in sync (React
 * Aria `mergeProps`); for other props the inner trigger wins.
 */
export function useTriggerProps(own: TriggerContextValue): TriggerContextValue {
  const outer = useContext(TriggerContext);
  return outer ? (mergeProps(outer, own) as TriggerContextValue) : own;
}
