'use client';

import { isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
} from '../../primitives/ButtonBase';
import { cn } from '../../utils/cn';
import { BadgedBox, type BadgeProps } from '../badge/Badge';
import { navItemStyles, type NavItemLayout } from './nav-item-styles';

export interface NavItemClassNames {
  root?: string;
  pill?: string;
  indicator?: string;
  icon?: string;
  label?: string;
  /** The badge's wrapper: on the icon, or after the label in the expanded rail. */
  badge?: string;
}

export interface NavItemOwnProps {
  /** The icon. Hidden from assistive tech; the label names the item. */
  icon: ReactElement;
  /** Icon shown while selected, e.g. a filled variant. */
  selectedIcon?: ReactElement;
  /** The label. */
  children: ReactNode;
  /** Marks the current destination (`aria-current="page"`). */
  selected?: boolean;
  /**
   * A `Badge` for dynamic information, such as a count. It overlaps the icon's top end, or
   * sits after the label in the expanded rail. It describes the item to assistive tech
   * with its text, or with `badgeLabel`.
   */
  badge?: ReactElement<BadgeProps>;
  /**
   * What the badge means, read after the item's name, e.g. "3 new messages". Defaults to
   * the badge's text; give one for a small (dot) badge.
   */
  badgeLabel?: string;
  /**
   * Called when the current destination is pressed again. M3: re-selecting the active
   * destination resets the page's scroll position to the top, so scroll to the top here.
   */
  onReselect?: () => void;
  classNames?: NavItemClassNames;
}

type OmitItem<T> = Omit<T, keyof NavItemOwnProps | 'toggle'>;

export type NavItemProps = NavItemOwnProps &
  (OmitItem<ButtonBaseActionProps> | OmitItem<ButtonBaseLinkProps>);

/** Shared navigation item: a link (`href`) or button with the M3 pill indicator. */
export function NavItem({
  layout,
  enterLabel,
  icon,
  selectedIcon,
  children,
  selected,
  badge,
  badgeLabel,
  onReselect,
  classNames,
  className,
  ...base
}: NavItemProps & {
  layout: NavItemLayout;
  enterLabel?: boolean;
}) {
  const styles = navItemStyles({ layout, enterLabel });
  const descriptionId = useId();
  const inline = layout === 'rail-start' || layout === 'bar-start';
  // M3: badges sit on the icon, except in the expanded rail, where they follow the label.
  const badgeAfterLabel = layout === 'rail-start';
  // A badge can arrive as a lazy server reference without props yet (React's dev
  // server rendering), so read its text only from a real element.
  const badgeText = isValidElement<BadgeProps>(badge) ? badge.props.children : undefined;
  const description =
    badgeLabel ??
    (typeof badgeText === 'string' || typeof badgeText === 'number' ? String(badgeText) : null);
  const label = (
    <span data-nav-label="" className={styles.label({ class: classNames?.label })}>
      {children}
    </span>
  );
  const iconFaces = selectedIcon ? (
    <>
      <span data-shown={!selected || undefined} className={styles.iconFace()}>
        {icon}
      </span>
      <span data-shown={selected || undefined} className={styles.iconFace()}>
        {selectedIcon}
      </span>
    </>
  ) : (
    icon
  );
  const action = base as ButtonBaseActionProps;
  return (
    <ButtonBase
      {...action}
      onPress={(event) => {
        action.onPress?.(event);
        if (selected) onReselect?.();
      }}
      data-nav-item=""
      aria-current={selected ? 'page' : undefined}
      aria-describedby={
        [action['aria-describedby'], badge && description != null ? descriptionId : undefined]
          .filter(Boolean)
          .join(' ') || undefined
      }
      data-current={selected || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <span className={styles.pill({ class: classNames?.pill })}>
        <span aria-hidden="true" className={styles.indicator({ class: classNames?.indicator })} />
        <span aria-hidden="true" className={styles.stateLayer()} />
        <span className={styles.content()}>
          <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
            {badge && !badgeAfterLabel ? (
              <BadgedBox badge={badge} className={classNames?.badge}>
                <span className={styles.iconStack()}>{iconFaces}</span>
              </BadgedBox>
            ) : (
              iconFaces
            )}
          </span>
          {inline && label}
          {badge && badgeAfterLabel && (
            <span aria-hidden="true" className={styles.badge({ class: classNames?.badge })}>
              {badge}
            </span>
          )}
        </span>
      </span>
      {!inline && label}
      {badge && description != null && (
        <span id={descriptionId} hidden>
          {description}
        </span>
      )}
    </ButtonBase>
  );
}
