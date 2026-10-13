'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useLayoutEffect, useRef, type ReactElement, type ReactNode, type RefObject } from 'react';
import { useM3Spring } from '../../motion/use-m3-spring';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
} from '../../primitives/ButtonBase';
import { cn } from '../../utils/cn';
import { navItemStyles, type NavItemLayout } from './nav-item-styles';

export interface NavItemClassNames {
  root?: string;
  pill?: string;
  indicator?: string;
  icon?: string;
  label?: string;
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
  classNames?: NavItemClassNames;
}

type OmitItem<T> = Omit<T, keyof NavItemOwnProps | 'toggle'>;

export type NavItemProps = NavItemOwnProps &
  (OmitItem<ButtonBaseActionProps> | OmitItem<ButtonBaseLinkProps>);

/**
 * Slides the current item's pill from the previous current item's, on the fast spatial
 * spring, changing width on the way when their labels differ. `lastIndicatorRef` holds the
 * last current pill for every item in one list; without it (or under reduced motion) the
 * pill appears in place.
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

/** Shared navigation item: a link (`href`) or button with the M3 pill indicator. */
export function NavItem({
  layout,
  enterLabel,
  lastIndicatorRef,
  icon,
  selectedIcon,
  children,
  selected,
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
  const inline = layout === 'rail-start' || layout === 'bar-start';
  const label = (
    <span data-nav-label="" className={styles.label({ class: classNames?.label })}>
      {children}
    </span>
  );
  return (
    <ButtonBase
      {...(base as ButtonBaseActionProps)}
      aria-current={selected ? 'page' : undefined}
      data-current={selected || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <span className={styles.pill({ class: classNames?.pill })}>
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className={styles.indicator({ class: classNames?.indicator })}
        />
        <span aria-hidden="true" className={styles.stateLayer()} />
        <span className={styles.content()}>
          <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
            {selectedIcon ? (
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
            )}
          </span>
          {inline && label}
        </span>
      </span>
      {!inline && label}
    </ButtonBase>
  );
}
