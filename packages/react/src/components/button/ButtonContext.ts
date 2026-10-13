'use client';

import { createContext } from 'react';
import type { IconButtonVariant } from '../icon-button/icon-button-styles';
import type { ButtonShape, ButtonSize, ButtonVariant } from './button-styles';

/** Props a parent (such as a button group) shares with its buttons. A button's own props win. */
export interface ButtonContextValue {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  disabled?: boolean;
  /**
   * Default style of the `IconButton`s inside, where M3 calls for one other than the
   * filled default (e.g. `standard` in toolbars and app bars). An icon button's own
   * `variant` wins.
   */
  iconButtonVariant?: IconButtonVariant;
  /** Position in a connected button group; set per child by `ButtonGroup`. */
  connected?: 'leading' | 'middle' | 'trailing';
}

export const ButtonContext = createContext<ButtonContextValue>({});

/** Selection state shared by toggle buttons in a selection group (see `ButtonGroup`). */
export { ToggleGroupStateContext } from '../../primitives/ButtonBase';

/**
 * The context of a container whose icon buttons are `standard` by default, as M3 shows
 * them in toolbars and app bars.
 */
export const standardIconButtons: ButtonContextValue = { iconButtonVariant: 'standard' };
