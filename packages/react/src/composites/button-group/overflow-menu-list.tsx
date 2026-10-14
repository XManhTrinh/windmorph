'use client';

import type { ReactNode } from 'react';
import { Menu, MenuItem, type MenuProps } from '../../components/menu/Menu';

/** A folded button as a menu item. */
export interface OverflowMenuItem {
  /** The button's index among the group's children, as a string. */
  key: string;
  label: ReactNode;
  icon: ReactNode;
}

export interface OverflowMenuListProps extends Pick<
  MenuProps,
  'selectionMode' | 'selectedKeys' | 'disabledKeys' | 'onAction' | 'className'
> {
  /** The folded buttons, in order. */
  items: OverflowMenuItem[];
}

/**
 * The overflow indicator's menu: one item per folded button, opening at the indicator's
 * end. `ButtonGroup` loads this module (and `Menu` with it) only once a button folds,
 * through `LazyOverflowMenuList`.
 */
export function OverflowMenuList({ items, ...props }: OverflowMenuListProps) {
  return (
    <Menu {...props} placement="bottom end">
      {items.map(({ key, label, icon }) => (
        <MenuItem
          key={key}
          leadingIcon={icon}
          textValue={typeof label === 'string' ? label : undefined}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}
