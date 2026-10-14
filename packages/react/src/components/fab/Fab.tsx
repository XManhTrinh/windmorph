'use client';

import { useContext, type ReactElement, type ReactNode } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
} from '../../primitives/ButtonBase';
import { ToolbarContext } from '../../primitives/ToolbarContext';
import { cn } from '../../utils/cn';
import { useWarnOnce } from '../../utils/warn-once';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import { TooltipTrigger } from '../tooltip/tooltip-trigger';
import { FabTooltip } from './FabTooltip';
import {
  extendedFabStyles,
  fabStyles,
  type ExtendedFabSize,
  type FabColor,
  type FabElevation,
  type FabSize,
} from './fab-styles';

/** FABs have no disabled or toggle state in M3. */
type FabBaseKeys = 'children' | 'disabled' | 'toggle';

interface FabCommonProps {
  /** @default "primary-container" */
  color?: FabColor;
  /**
   * `default` is level 3 (hover 4); `lowered` is level 1 (hover 2), for FABs on surfaces
   * that already sit above the page; `flat` is level 0, for a FAB nested in another
   * component such as the navigation rail. @default "default"
   */
  elevation?: FabElevation;
  /**
   * Shows the FAB. Hiding it shrinks it towards its centre and fades it out; showing it
   * expands it back, so it can disappear and reappear around a page or tab change. A
   * hidden FAB is `inert`. @default true
   */
  visible?: boolean;
  /**
   * Plays the appearing animation when the FAB mounts. Change the FAB's `key` on a page
   * or tab change to replay it. @default false
   */
  appear?: boolean;
}

/** The `data-*` and `inert` attributes that drive the show / hide motion. */
function visibilityProps(visible: boolean, appear: boolean) {
  return {
    'data-hidden': visible ? undefined : true,
    'data-appear': appear || undefined,
    inert: !visible || undefined,
  };
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
  /**
   * Shows `aria-label` in a plain tooltip on hover and keyboard focus, as M3 asks of
   * FABs on the web. Turn it off when you wrap the FAB in your own `TooltipTrigger`.
   * @default true
   */
  tooltip?: boolean;
  classNames?: FabClassNames;
}

type OmitFab<T> = Omit<T, keyof FabOwnProps | FabBaseKeys | 'aria-label' | 'aria-labelledby'>;

export type FabProps = FabOwnProps &
  AccessibleName &
  (OmitFab<ButtonBaseActionProps> | OmitFab<ButtonBaseLinkProps>);

/**
 * M3 Expressive floating action button: default (56px), medium (80px) and large (96px),
 * six colour styles, three elevations, a tooltip from its label, and an animated
 * `visible` state.
 *
 * @example
 * <Fab icon={<EditIcon />} aria-label="Compose" onPress={compose} className="fixed end-4 bottom-4" />
 */
export function Fab({
  size,
  color,
  elevation,
  visible = true,
  appear = false,
  tooltip = true,
  icon,
  classNames,
  className,
  ...base
}: FabProps) {
  const styles = fabStyles({ size, color, elevation });
  const baseProps = {
    ...base,
    ...visibilityProps(visible, appear),
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;
  const fab = (
    <ButtonBase
      {...baseProps}
      // The component tokens' hooks (fab-tokens.ts), also public styling hooks for apps.
      data-tokens="md-comp-fab"
      data-color={color ?? 'primary-container'}
      data-size={size ?? 'default'}
    >
      <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
        {icon}
      </span>
    </ButtonBase>
  );
  const label = base['aria-label'];
  if (!tooltip || !label) return fab;
  return (
    <TooltipTrigger>
      {fab}
      <LazyTooltip>{label}</LazyTooltip>
    </TooltipTrigger>
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
  /**
   * While collapsed, shows the label (or `aria-label`) in a plain tooltip on hover and
   * keyboard focus, as M3 asks of icon-only FABs on the web. Expanded, the label is visible
   * and there is no tooltip. It steps aside inside your own `TooltipTrigger`. @default true
   */
  tooltip?: boolean;
  classNames?: ExtendedFabClassNames;
}

type OmitExtended<T> = Omit<T, keyof ExtendedFabOwnProps | FabBaseKeys>;

export type ExtendedFabProps = ExtendedFabOwnProps &
  (OmitExtended<ButtonBaseActionProps> | OmitExtended<ButtonBaseLinkProps>);

/**
 * M3 Expressive extended FAB: small (56px), medium (80px) and large (96px), with an icon
 * and a label that collapses and expands with `expanded`. Its visible label names it, so
 * it has a tooltip only while collapsed to the icon (M3's FAB rule).
 *
 * @example
 * <ExtendedFab icon={<EditIcon />} expanded={!isScrolling} onPress={compose}>Compose</ExtendedFab>
 */
export function ExtendedFab({
  size,
  color,
  elevation,
  visible = true,
  appear = false,
  icon,
  expanded = true,
  tooltip = true,
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
  // Once per FAB, not on every render.
  useWarnOnce(
    useContext(ToolbarContext)?.kind === 'floating',
    '[@windmorph/react] Pair a FloatingToolbar with a FAB (ToolbarFab), not an extended FAB (M3).',
  );
  const collapsed = !expanded && Boolean(icon);
  const styles = extendedFabStyles({ size, color, elevation, hasIcon: Boolean(icon) });
  const baseProps = {
    ...base,
    ...visibilityProps(visible, appear),
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;
  const fab = (
    <ButtonBase
      {...baseProps}
      // The component tokens' hooks (fab-tokens.ts), also public styling hooks for apps.
      data-tokens="md-comp-extended-fab"
      data-color={color ?? 'primary-container'}
      data-size={size ?? 'sm'}
      data-expanded={!collapsed}
    >
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
  if (!tooltip || !icon) return fab;
  return (
    <FabTooltip available={collapsed} label={base['aria-label'] ?? children}>
      {fab}
    </FabTooltip>
  );
}
