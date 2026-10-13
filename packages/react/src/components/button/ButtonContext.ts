'use client';

import { createContext } from 'react';
import type { ButtonShape, ButtonSize, ButtonVariant } from './button-styles';

/** Props a parent (such as a button group) shares with its buttons. A button's own props win. */
export interface ButtonContextValue {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  disabled?: boolean;
  /** Position in a connected button group; set per child by `ButtonGroup`. */
  connected?: 'leading' | 'middle' | 'trailing';
}

export const ButtonContext = createContext<ButtonContextValue>({});

/** Selection state shared by toggle buttons in a selection group (see `ButtonGroup`). */
export { ToggleGroupStateContext } from '../../primitives/ButtonBase';
