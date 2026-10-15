'use client';

import { useContext, type ReactElement } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
  type ButtonBaseToggleProps,
} from '../../primitives/ButtonBase';
import { IconFaces } from '../../primitives/IconFaces';
import { iconFacesStyles, type IconTransition } from '../../primitives/icon-faces-styles';
import { TouchTarget } from '../../primitives/TouchTarget';
import { densityAttribute, type Density } from '../../tokens/density';
import { cn } from '../../utils/cn';
import { useWarnOnce } from '../../utils/warn-once';
import type { ButtonShape, ButtonSize } from '../button/button-styles';
import { ButtonContext } from '../button/ButtonContext';
import { ToolbarContext } from '../../primitives/ToolbarContext';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import {
  TooltipTrigger,
  useInTooltipTrigger,
  WithoutDescription,
} from '../tooltip/tooltip-trigger';
import {
  iconButtonStyles,
  type IconButtonVariant,
  type IconButtonWidth,
} from './icon-button-styles';

export interface IconButtonClassNames {
  /** The button element itself; merged with `className`. */
  root?: string;
  /** Inner wrapper around the icon. */
  content?: string;
  /** The icon. */
  icon?: string;
  /** The built-in plain tooltip that shows the label (`tooltip`). */
  tooltip?: string;
}

/** Icon buttons have no visible text, so an accessible name is required. */
type AccessibleName =
  | {
      /** The button's accessible name, also shown in its tooltip. Required without `aria-labelledby`. */
      'aria-label': string;
      /** The id of an element that names the button, instead of `aria-label`. */
      'aria-labelledby'?: string;
    }
  | {
      /** The button's accessible name, also shown in its tooltip. Required without `aria-labelledby`. */
      'aria-label'?: string;
      /** The id of an element that names the button, instead of `aria-label`. */
      'aria-labelledby': string;
    };

interface IconButtonOwnProps {
  /**
   * Colour style. Filled is the M3 default; toolbars and app bars default their icon
   * buttons to `standard` through `ButtonContext`.
   * @default "filled"
   */
  variant?: IconButtonVariant;
  /** Container and icon size, from extra small to extra large. @default "sm" */
  size?: ButtonSize;
  /** Container width: narrow, default or wide, at the same height. @default "default" */
  width?: IconButtonWidth;
  /** Fully round corners, or square ones (still rounded, but less). @default "round" */
  shape?: ButtonShape;
  /**
   * Web density, `0` to `-3`: each step takes 4px off the container's height and width (an
   * S button: 40px at 0, 28px at -3), never below the icon plus 4px; the touch target stays
   * 48 × 48px. Left out, the button takes the density of the nearest `ThemeProvider` or
   * `ThemeScope`; icon buttons in a field's icon slots, and in app bars, toolbars, search bars,
   * a navigation rail's header and dialog and sheet headers, keep their size. M3 asks for density
   * to be the reader's choice rather than a default, so prefer setting it there.
   * @default 0
   */
  density?: Density;
  /** The icon, e.g. a Material Symbols SVG. Hidden from assistive tech; `aria-label` names the button. */
  icon: ReactElement;
  /**
   * Shows the `aria-label` in a plain tooltip on hover and keyboard focus, as M3 asks of
   * icon buttons on the web. The tooltip only repeats the name, so it isn't linked as a
   * description (no double announcement). It steps aside when the button is already inside a
   * `TooltipTrigger` or `RichTooltipTrigger`, and when it's named by `aria-labelledby`.
   * @default true
   */
  tooltip?: boolean;
  /** Classes for each part. `classNames.root` is merged with `className`. */
  classNames?: IconButtonClassNames;
}

type OmitOwn<T> = Omit<T, keyof IconButtonOwnProps | 'children' | 'aria-label' | 'aria-labelledby'>;

export type IconButtonActionProps = IconButtonOwnProps &
  OmitOwn<ButtonBaseActionProps> &
  AccessibleName;
export type IconButtonLinkProps = IconButtonOwnProps &
  OmitOwn<ButtonBaseLinkProps> &
  AccessibleName;
export type IconButtonToggleProps = IconButtonOwnProps &
  OmitOwn<ButtonBaseToggleProps> &
  AccessibleName & {
    /** Icon shown while selected, e.g. the filled form of `icon`. */
    selectedIcon?: ReactElement;
    /**
     * How `icon` hands over to `selectedIcon`: `swap` changes it at once, `rotate` turns and
     * crossfades the two (counter-clockwise as it selects, in LTR). `rotate` is an extension
     * beyond the M3 spec, matching Google's Expressive showcase, like the FAB menu's.
     * Reduced motion keeps only the crossfade. Needs `selectedIcon`.
     * @default "swap"
     */
    iconTransition?: IconTransition;
  };

export type IconButtonProps = IconButtonActionProps | IconButtonLinkProps | IconButtonToggleProps;

/**
 * M3 Expressive icon button: filled (default), tonal, outlined and standard variants;
 * XS–XL sizes; narrow, default or wide widths; round or square shape; an optional toggle
 * form; a press morph; and its label as a tooltip on hover and keyboard focus.
 *
 * Shares `size`, `shape` and `disabled` with `ButtonContext`, so it fits in button groups,
 * and takes its default variant from it (`iconButtonVariant`).
 *
 * @example
 * <IconButton icon={<SearchIcon />} aria-label="Search" onPress={openSearch} />
 * <IconButton variant="standard" icon={<MoreIcon />} aria-label="More options" />
 * <IconButton toggle variant="filled" icon={<StarIcon />} selectedIcon={<StarFilledIcon />}
 *   aria-label="Favourite" selected={isFavourite} onSelectedChange={setFavourite} />
 */
export function IconButton(props: IconButtonProps) {
  const {
    variant: variantProp,
    size: sizeProp,
    width = 'default',
    shape: shapeProp,
    density: densityProp,
    disabled: disabledProp,
    icon,
    tooltip = true,
    classNames,
    className,
    // Only toggle props carry `selectedIcon`; the others read it as undefined.
    selectedIcon,
    iconTransition = 'swap',
    ...base
  } = props as IconButtonToggleProps & IconButtonProps;
  const rotates = iconTransition === 'rotate' && selectedIcon !== undefined;

  const context = useContext(ButtonContext);
  const toolbar = useContext(ToolbarContext);
  const inTooltipTrigger = useInTooltipTrigger();
  const size = sizeProp ?? context.size ?? 'sm';
  const shape = shapeProp ?? context.shape ?? 'round';
  const squareInFloatingToolbar = toolbar?.kind === 'floating' && shape === 'square';
  // Once per button, not on every render.
  useWarnOnce(
    squareInFloatingToolbar,
    '[@windmorph/react] Avoid square icon buttons in a floating toolbar (M3): their shape conflicts with its fully rounded container.',
  );
  useWarnOnce(
    toolbar?.orientation === 'vertical' && width === 'wide',
    '[@windmorph/react] Avoid wide icon buttons in a vertical toolbar (M3): use the default or narrow width.',
  );
  const variant = variantProp ?? context.iconButtonVariant ?? 'filled';
  const density = densityProp ?? context.density;
  const styles = iconButtonStyles({
    variant,
    size,
    width,
    shape,
    toggle: base.toggle === true,
    connected: context.connected ?? 'none',
    toolbar: toolbar?.color ?? 'none',
  });

  // Destructuring a union merges its members (see Button); `base` holds one member's props.
  // The component tokens' hooks (icon-button-tokens.ts), also public styling hooks for apps.
  const tokenAttributes = {
    'data-tokens': 'md-comp-icon-button',
    'data-variant': variant,
    'data-size': size,
  };
  const baseProps = {
    ...base,
    ...tokenAttributes,
    ...densityAttribute(density),
    disabled: disabledProp ?? context.disabled ?? false,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;

  const button = (
    <ButtonBase {...baseProps}>
      {({ isSelected }) => (
        <span className={styles.content({ class: classNames?.content })}>
          {(size === 'xs' || size === 'sm') && <TouchTarget />}
          <span
            aria-hidden="true"
            className={styles.icon({
              class: cn(rotates && iconFacesStyles().cell(), classNames?.icon),
            })}
          >
            {rotates ? (
              <IconFaces
                icon={icon}
                alternateIcon={selectedIcon}
                alternate={isSelected}
                transition="rotate"
              />
            ) : isSelected && selectedIcon ? (
              selectedIcon
            ) : (
              icon
            )}
          </span>
        </span>
      )}
    </ButtonBase>
  );

  const label = base['aria-label'];
  if (!tooltip || inTooltipTrigger || !label || base['aria-labelledby']) return button;
  return (
    <TooltipTrigger>
      <WithoutDescription>{button}</WithoutDescription>
      <LazyTooltip classNames={{ panel: classNames?.tooltip }}>{label}</LazyTooltip>
    </TooltipTrigger>
  );
}
