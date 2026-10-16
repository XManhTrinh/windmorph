'use client';

import { isValidElement, useContext, type ReactElement, type ReactNode } from 'react';
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
import { TooltipTrigger, WithoutDescription } from '../tooltip/tooltip-trigger';
import { FabTooltip } from './FabTooltip';
import {
  extendedFabStyles,
  fabStyles,
  type ExtendedFabSize,
  type FabColor,
  type FabElevation,
  type FabSize,
} from './fab-styles';
import { mergeDataTokens } from '../../utils/merge-data-tokens';

/** FABs have no disabled or toggle state in M3. */
type FabBaseKeys = 'children' | 'disabled' | 'toggle';

interface FabCommonProps {
  /** The colour style: a container colour or its solid form. @default "primary-container" */
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

/** The text of a label, through elements and arrays (empty for anything else). */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/** A text's first word, lower-cased, or undefined when it has none. */
function firstWord(text: string | undefined): string | undefined {
  return text?.match(/[\p{L}\p{N}]+/u)?.[0]?.toLocaleLowerCase();
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
  | {
      /** The FAB's accessible name, also shown in its tooltip. Required without `aria-labelledby`. */
      'aria-label': string;
      /** The id of an element that names the FAB, instead of `aria-label`. */
      'aria-labelledby'?: string;
    }
  | {
      /** The FAB's accessible name, also shown in its tooltip. Required without `aria-labelledby`. */
      'aria-label'?: string;
      /** The id of an element that names the FAB, instead of `aria-label`. */
      'aria-labelledby': string;
    };

export interface FabClassNames {
  /** The FAB element itself; merged with `className`. */
  root?: string;
  /** The icon. */
  icon?: string;
  /** The built-in plain tooltip that shows the label (`tooltip`). */
  tooltip?: string;
}

interface FabOwnProps extends FabCommonProps {
  /**
   * Container size: default (56px), medium (80px) or large (96px). The small FAB is
   * deprecated in M3 Expressive. @default "default"
   */
  size?: FabSize;
  /** The icon. Hidden from assistive tech; `aria-label` names the FAB. */
  icon: ReactElement;
  /**
   * Shows `aria-label` in a plain tooltip on hover and keyboard focus, as M3 asks of
   * FABs on the web. Turn it off when you wrap the FAB in your own `TooltipTrigger`.
   * @default true
   */
  tooltip?: boolean;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
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
      data-tokens={mergeDataTokens('md-comp-fab', base)}
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
      <WithoutDescription>{fab}</WithoutDescription>
      <LazyTooltip classNames={{ panel: classNames?.tooltip }}>{label}</LazyTooltip>
    </TooltipTrigger>
  );
}

export interface ExtendedFabClassNames {
  /** The FAB element itself; merged with `className`. */
  root?: string;
  /** Inner wrapper around the icon and label. */
  content?: string;
  /** The leading icon. */
  icon?: string;
  /** The label's clipping wrapper, which collapses with the FAB. */
  label?: string;
  /** The label text. */
  text?: string;
  /** The built-in plain tooltip shown while collapsed (`tooltip`). */
  tooltip?: string;
}

interface ExtendedFabOwnProps extends FabCommonProps {
  /** Container height and label size: small (56px), medium (80px) or large (96px). @default "sm" */
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
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
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
  // M3: "The accessibility label must include the same first word as the visible label",
  // so voice control users can say what they see (2026-10-15).
  const labelWord = firstWord(base['aria-label']);
  const visibleWord = firstWord(textOf(children));
  useWarnOnce(
    labelWord !== undefined && visibleWord !== undefined && labelWord !== visibleWord,
    `[@windmorph/react] An ExtendedFab's aria-label should start with its visible label's first word ("${visibleWord}"), as M3 asks, so voice control can name it.`,
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
      data-tokens={mergeDataTokens('md-comp-extended-fab', base)}
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
    <FabTooltip
      available={collapsed}
      label={base['aria-label'] ?? children}
      className={classNames?.tooltip}
    >
      {fab}
    </FabTooltip>
  );
}
