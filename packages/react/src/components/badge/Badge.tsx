import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { badgedBoxStyles, badgeStyles } from './badge-styles';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  /**
   * A short count or label (large badge). Leave it out for the small dot. Give the anchor
   * an accessible name that includes what the badge means, e.g. "Inbox, 3 new".
   */
  children?: ReactNode;
}

/**
 * M3 badge: a small 6px dot, or a large 16px badge holding a short count or label, in
 * `error` colours. Place it on an icon with {@link BadgedBox}.
 *
 * @example
 * <Badge />
 * <Badge>3</Badge>
 */
export function Badge({ children, className, ...rest }: BadgeProps) {
  const size = children == null || children === false ? 'small' : 'large';
  return (
    <span {...rest} data-size={size} className={badgeStyles({ size, class: className })}>
      {size === 'large' ? children : null}
    </span>
  );
}

export interface BadgedBoxClassNames {
  root?: string;
  anchor?: string;
}

export interface BadgedBoxProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The badge, a {@link Badge}. */
  badge: ReactElement<BadgeProps>;
  /** The anchor, usually an icon. */
  children: ReactNode;
  classNames?: BadgedBoxClassNames;
}

/**
 * Places a badge at the top end of its anchor (Compose's `BadgedBox`), e.g. on a
 * navigation icon.
 *
 * @example
 * <NavigationBarItem icon={<BadgedBox badge={<Badge>3</Badge>}><MailIcon /></BadgedBox>}>Mail</NavigationBarItem>
 */
export function BadgedBox({ badge, children, classNames, className, ...rest }: BadgedBoxProps) {
  const badgeContent = badge.props.children;
  const size = badgeContent == null || badgeContent === false ? 'small' : 'large';
  const styles = badgedBoxStyles({ size });
  return (
    <span {...rest} className={styles.root({ class: cn(classNames?.root, className) })}>
      <span className={styles.anchor({ class: classNames?.anchor })}>{children}</span>
      <span className={styles.hang()}>{badge}</span>
    </span>
  );
}
