'use client';

import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { useNumberFormatter, VisuallyHidden } from 'react-aria';
import { cn } from '../../utils/cn';
import { badgedBoxStyles, badgeStyles } from './badge-styles';

/** Words a {@link Badge} announces. */
export interface BadgeLabels {
  /** What a small badge (a dot) announces. @default "New notification" */
  newNotification?: string;
}

export interface BadgeClassNames {
  root?: string;
  /** The large badge's text, which truncates at the badge's maximum width. */
  label?: string;
}

export interface BadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * A count or a short label (large badge); leave it out for the small dot. Numbers are
   * formatted for the locale and capped at `max` ("999+"). M3 allows four characters,
   * including the "+"; text badges stop at 34px wide and truncate longer text.
   */
  children?: ReactNode;
  /** The highest count shown; larger counts show as `max` + "+". @default 999 */
  max?: number;
  /**
   * What assistive tech reads instead of the visible content, e.g. "3 unread messages".
   * Without it, a large badge reads its content and a small one `labels.newNotification`.
   */
  label?: string;
  labels?: BadgeLabels;
  classNames?: BadgeClassNames;
}

/**
 * M3 badge: a small 6px dot, or a large 16px badge holding a count or a short label, in
 * `error` colours. Place it on an icon with {@link BadgedBox}. It is announced: a count is
 * read, a dot reads "New notification" (`labels`), and `label` replaces either.
 *
 * @example
 * <Badge />
 * <Badge>{3}</Badge>
 * <Badge max={99}>{120}</Badge> // "99+"
 */
export function Badge({
  children,
  max = 999,
  label,
  labels,
  classNames,
  className,
  ...rest
}: BadgeProps) {
  const format = useNumberFormatter();
  const size = children == null || children === false ? 'small' : 'large';
  const styles = badgeStyles({ size, count: typeof children === 'number' });
  const content =
    typeof children === 'number'
      ? children > max
        ? `${format.format(max)}+`
        : format.format(children)
      : children;
  const announcement =
    label ?? (size === 'small' ? (labels?.newNotification ?? 'New notification') : null);
  return (
    <span
      {...rest}
      data-size={size}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {size === 'large' && (
        <span
          aria-hidden={announcement != null || undefined}
          // A count reads left to right in every layout, so "999+" never shows as "+999".
          dir={typeof children === 'number' ? 'ltr' : undefined}
          className={styles.label({ class: classNames?.label })}
        >
          {content}
        </span>
      )}
      {announcement != null && <VisuallyHidden elementType="span">{announcement}</VisuallyHidden>}
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
 * Places a badge at the top end of its anchor (Compose's `BadgedBox`), e.g. on an icon.
 * The badge's announcement is part of the text around it; an anchor named with its own
 * `aria-label` should say what the badge means.
 *
 * @example
 * <IconButton
 *   aria-label="Messages, 3 unread"
 *   icon={<BadgedBox badge={<Badge>{3}</Badge>}><MailIcon /></BadgedBox>}
 * />
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
