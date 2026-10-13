'use client';

import type { ReactElement, ReactNode } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
} from '../../primitives/ButtonBase';
import { cn } from '../../utils/cn';
import {
  extendedFabStyles,
  fabStyles,
  type ExtendedFabSize,
  type FabColor,
  type FabSize,
} from './fab-styles';

/** FABs have no disabled or toggle state in M3. */
type FabBaseKeys = 'children' | 'disabled' | 'toggle';

interface FabCommonProps {
  /** @default "primary-container" */
  color?: FabColor;
  /** Lower elevation (level 1) for FABs on surfaces that already sit above the page. */
  lowered?: boolean;
}

type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export interface FabClassNames {
  root?: string;
  icon?: string;
}

interface FabOwnProps extends FabCommonProps {
  /** @default "default" (56px). The small FAB is deprecated in M3 Expressive. */
  size?: FabSize;
  /** The icon. Hidden from assistive tech; `aria-label` names the FAB. */
  icon: ReactElement;
  classNames?: FabClassNames;
}

type OmitFab<T> = Omit<T, keyof FabOwnProps | FabBaseKeys | 'aria-label' | 'aria-labelledby'>;

export type FabProps = FabOwnProps &
  AccessibleName &
  (OmitFab<ButtonBaseActionProps> | OmitFab<ButtonBaseLinkProps>);

/**
 * M3 Expressive floating action button: default (56px), medium (80px) and large (96px),
 * six colour styles and an optional lowered elevation.
 *
 * @example
 * <Fab icon={<EditIcon />} aria-label="Compose" onPress={compose} className="fixed end-4 bottom-4" />
 */
export function Fab({ size, color, lowered, icon, classNames, className, ...base }: FabProps) {
  const styles = fabStyles({ size, color, lowered });
  const baseProps = {
    ...base,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;
  return (
    <ButtonBase {...baseProps}>
      <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
        {icon}
      </span>
    </ButtonBase>
  );
}

export interface ExtendedFabClassNames {
  root?: string;
  content?: string;
  icon?: string;
  label?: string;
  text?: string;
}

interface ExtendedFabOwnProps extends FabCommonProps {
  /** @default "sm" (56px) */
  size?: ExtendedFabSize;
  /** Leading icon. Needed for the collapsed state, which shows the icon only. */
  icon?: ReactElement;
  /** The visible label; it also names the FAB, including while collapsed. */
  children: Exclude<ReactNode, null | undefined | boolean>;
  /**
   * Shows the label. Collapsing animates the FAB to a square showing only the icon
   * (e.g. while the page scrolls). @default true
   */
  expanded?: boolean;
  classNames?: ExtendedFabClassNames;
}

type OmitExtended<T> = Omit<T, keyof ExtendedFabOwnProps | FabBaseKeys>;

export type ExtendedFabProps = ExtendedFabOwnProps &
  (OmitExtended<ButtonBaseActionProps> | OmitExtended<ButtonBaseLinkProps>);

/**
 * M3 Expressive extended FAB: small (56px), medium (80px) and large (96px), with an icon
 * and a label that collapses and expands with `expanded`.
 *
 * @example
 * <ExtendedFab icon={<EditIcon />} expanded={!isScrolling} onPress={compose}>Compose</ExtendedFab>
 */
export function ExtendedFab({
  size,
  color,
  lowered,
  icon,
  expanded = true,
  classNames,
  className,
  children,
  ...base
}: ExtendedFabProps) {
  if (process.env.NODE_ENV !== 'production' && !expanded && !icon) {
    console.warn(
      '[@windmorph/react] An ExtendedFab without an icon cannot collapse; it stays expanded.',
    );
  }
  const collapsed = !expanded && Boolean(icon);
  const styles = extendedFabStyles({ size, color, lowered, hasIcon: Boolean(icon) });
  const baseProps = {
    ...base,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;
  return (
    <ButtonBase {...baseProps} data-expanded={!collapsed}>
      <span className={styles.content({ class: classNames?.content })}>
        {icon && (
          <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
            {icon}
          </span>
        )}
        <span data-collapsed={collapsed || undefined} className={styles.collapse()}>
          <span className={styles.label({ class: classNames?.label })}>
            <span className={styles.text({ class: classNames?.text })}>{children}</span>
          </span>
        </span>
      </span>
    </ButtonBase>
  );
}
