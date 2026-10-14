'use client';

import type { ReactNode } from 'react';
import { CheckableMenuItem, Menu, type MenuProps } from '../../components/menu/Menu';

/** A folded button as a menu item. */
export interface OverflowMenuItem {
  /** The button's index among the group's children, as a string. */
  key: string;
  label: ReactNode;
  icon: ReactNode;
  /**
   * Whether the item shows and announces a checked state: a toggle button, or a button in
   * the group's selection. Actions stay plain menu items in a selectable menu.
   */
  checkable: boolean;
}

export interface OverflowMenuListProps extends Pick<
  MenuProps,
  'selectionMode' | 'selectedKeys' | 'disabledKeys' | 'onAction' | 'classNames'
> {
  /** The folded buttons, in order. */
  items: OverflowMenuItem[];
}

/**
 * The overflow indicator's menu: one item per folded button, opening at the indicator's
 * end. In a selectable menu only toggles (and buttons in the group's selection) are
 * checkable; actions stay plain items. `ButtonGroup` loads this module (and `Menu` with it) only once a button folds,
 * through `LazyOverflowMenuList`.
 */
export function OverflowMenuList({ items, ...props }: OverflowMenuListProps) {
  return (
    <Menu {...props} placement="bottom end">
      {items.map(({ key, label, icon, checkable }) => (
        <CheckableMenuItem
          key={key}
          leadingIcon={icon}
          checkable={checkable}
          textValue={typeof label === 'string' ? label : undefined}
        >
          {label}
        </CheckableMenuItem>
      ))}
    </Menu>
  );
}
