import type { DOMAttributes } from 'react';

/** A trigger's props: React's DOM attributes and handlers, plus its own. */
export interface TriggerOptions extends DOMAttributes<HTMLElement> {
  /** Whether the popup is open. */
  'aria-expanded'?: boolean;
  /** Opens on press start. */
  openOnPressStart?: boolean;
}

/** The trigger's props, merged with its parent's. */
export function useTrigger(own: TriggerOptions): TriggerOptions {
  return own;
}
