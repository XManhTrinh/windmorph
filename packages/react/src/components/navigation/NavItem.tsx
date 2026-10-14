'use client';

import { animate, useReducedMotion } from 'motion/react';
import {
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { useM3Spring } from '../../motion/use-m3-spring';
import { setRippleOrigin, useRippleHold } from '../../primitives/use-m3-interaction';
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
   * the badge's `label` or text; a small (dot) badge reads its `labels.newNotification`
   * ("New notification"), as M3 asks of badges without a count.
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

/**
 * Slides the current item's pill from the previous current item's, on the fast spatial
 * spring, changing width on the way when their labels differ. `lastIndicatorRef` holds the
 * last current pill for every item in one list; without it the pill doesn't slide, and under
 * reduced motion it fades in place.
 */
function useSlidingIndicator(
  selected: boolean,
  lastIndicatorRef: RefObject<HTMLElement | null> | undefined,
) {
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const wasSelected = useRef(selected);
  const spring = useM3Spring('spatial', 'fast');
  const reducedMotion = useReducedMotion();
  useLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const changed = wasSelected.current !== selected;
    wasSelected.current = selected;
    if (!lastIndicatorRef || !selected || !indicator) return;
    const previous = lastIndicatorRef.current;
    lastIndicatorRef.current = indicator;
    if (!changed || reducedMotion || !previous?.isConnected || previous === indicator) return;
    // Measure both pills at rest; an earlier slide may have left a transform or width behind.
    indicator.style.transform = '';
    indicator.style.width = '';
    const from = previous.getBoundingClientRect();
    const to = indicator.getBoundingClientRect();
    const offset = from.top - to.top;
    if (offset === 0) return;
    // Start from the old place and width now: Motion's first frame comes a frame later.
    indicator.style.transform = `translateY(${offset}px)`;
    if (from.width === to.width) {
      animate(indicator, { y: [offset, 0] }, spring);
      return;
    }
    indicator.style.width = `${from.width}px`;
    // Width animates in px; once settled the pill sizes itself to its content again.
    void animate(indicator, { y: [offset, 0], width: [from.width, to.width] }, spring).then(() => {
      indicator.style.width = '';
    });
  }, [selected, lastIndicatorRef, reducedMotion, spring]);
  return indicatorRef;
}

/**
 * What a badge tells assistive tech about its item: its `label`, its text, or, for a small
 * badge (no children), "New notification" (`labels.newNotification`).
 */
function badgeDescription(badge: ReactElement<BadgeProps> | undefined): string | null {
  // A badge can arrive as a lazy server reference without props yet (React's dev server
  // rendering), so read it only from a real element.
  if (!isValidElement<BadgeProps>(badge)) return null;
  const { label, labels, children } = badge.props;
  if (label != null) return label;
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (children == null || children === false) {
    return labels?.newNotification ?? 'New notification';
  }
  return null;
}

/** Shared navigation item: a link (`href`) or button with the M3 pill indicator. */
export function NavItem({
  layout,
  enterLabel,
  lastIndicatorRef,
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
  /** The list's last current pill, so this item's pill slides from it when it becomes current. */
  lastIndicatorRef?: RefObject<HTMLElement | null>;
}) {
  const styles = navItemStyles({ layout, enterLabel, slide: Boolean(lastIndicatorRef) });
  const indicatorRef = useSlidingIndicator(Boolean(selected), lastIndicatorRef);
  const descriptionId = useId();
  const inline = layout === 'rail-start' || layout === 'bar-start';
  // M3: badges sit on the icon, except in the expanded rail, where they follow the label.
  const badgeAfterLabel = layout === 'rail-start';
  const description = badgeLabel ?? badgeDescription(badge);
  const label = (
    <span
      data-nav-label=""
      data-slot="label"
      className={styles.label({ class: classNames?.label })}
    >
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
  // M3: a press ripples through the pill. The item is the pressable element, so the pill's
  // state layer gets its own press state and a ripple origin in its own box.
  const stateLayerRef = useRef<HTMLSpanElement>(null);
  const [pressed, setPressed] = useState(false);
  const rippling = useRippleHold(pressed && !action.disabled);
  return (
    <ButtonBase
      {...action}
      onPress={(event) => {
        action.onPress?.(event);
        if (selected) onReselect?.();
      }}
      onPressChange={(isPressed) => {
        action.onPressChange?.(isPressed);
        setPressed(isPressed);
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        action.onPointerDown?.(event);
        if (stateLayerRef.current && !action.disabled && event.button === 0) {
          setRippleOrigin(stateLayerRef.current, event.clientX, event.clientY);
        }
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        action.onKeyDown?.(event);
        if (
          stateLayerRef.current &&
          !action.disabled &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          setRippleOrigin(stateLayerRef.current);
        }
      }}
      data-nav-item=""
      aria-current={selected ? 'page' : undefined}
      aria-describedby={
        [action['aria-describedby'], badge && description != null ? descriptionId : undefined]
          .filter(Boolean)
          .join(' ') || undefined
      }
      data-current={selected || undefined}
      // The bar's or rail's component tokens, resolved on the item for its state and layout.
      data-tokens={layout.startsWith('rail') ? 'md-comp-nav-rail' : 'md-comp-nav-bar'}
      data-layout={layout}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <span className={styles.pill({ class: classNames?.pill })}>
        <span
          ref={indicatorRef}
          aria-hidden="true"
          data-slot="indicator"
          className={styles.indicator({ class: classNames?.indicator })}
        />
        <span
          ref={stateLayerRef}
          aria-hidden="true"
          data-rippling={rippling || undefined}
          data-disabled={action.disabled || undefined}
          className={styles.stateLayer()}
        />
        <span className={styles.content()}>
          <span
            aria-hidden="true"
            data-slot="icon"
            className={styles.icon({ class: classNames?.icon })}
          >
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
