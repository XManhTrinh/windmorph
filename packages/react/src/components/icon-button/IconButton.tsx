'use client';

import { useContext, type ReactElement } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
  type ButtonBaseToggleProps,
} from '../../primitives/ButtonBase';
import { TouchTarget } from '../../primitives/TouchTarget';
import { cn } from '../../utils/cn';
import type { ButtonShape, ButtonSize } from '../button/button-styles';
import { ButtonContext } from '../button/ButtonContext';
import { ToolbarContext } from '../../primitives/ToolbarContext';
import { Tooltip, TooltipTrigger, useInTooltipTrigger } from '../tooltip/Tooltip';
import {
  iconButtonStyles,
  type IconButtonVariant,
  type IconButtonWidth,
} from './icon-button-styles';

export interface IconButtonClassNames {
  root?: string;
  /** Inner wrapper around the icon. */
  content?: string;
  icon?: string;
}

/** Icon buttons have no visible text, so an accessible name is required. */
type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

interface IconButtonOwnProps {
  /**
   * Colour style. Filled is the M3 default; toolbars and app bars default their icon
   * buttons to `standard` through `ButtonContext`.
   * @default "filled"
   */
  variant?: IconButtonVariant;
  /** @default "sm" */
  size?: ButtonSize;
  /** @default "default" */
  width?: IconButtonWidth;
  /** @default "round" */
  shape?: ButtonShape;
  /** The icon, e.g. a Material Symbols SVG. Hidden from assistive tech; `aria-label` names the button. */
  icon: ReactElement;
  /**
   * Shows the `aria-label` in a plain tooltip on hover and keyboard focus, as M3 asks of
   * icon buttons on the web. It steps aside when the button is already inside a
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
    disabled: disabledProp,
    icon,
    tooltip = true,
    classNames,
    className,
    // Only toggle props carry `selectedIcon`; the others read it as undefined.
    selectedIcon,
    ...base
  } = props as IconButtonToggleProps & IconButtonProps;

  const context = useContext(ButtonContext);
  const toolbar = useContext(ToolbarContext);
  const inTooltipTrigger = useInTooltipTrigger();
  const size = sizeProp ?? context.size ?? 'sm';
  const shape = shapeProp ?? context.shape ?? 'round';
  if (process.env.NODE_ENV !== 'production' && toolbar?.kind === 'floating' && shape === 'square') {
    console.warn(
      '[@windmorph/react] Avoid square icon buttons in a floating toolbar (M3): their shape conflicts with its fully rounded container.',
    );
  }
  const styles = iconButtonStyles({
    variant: variantProp ?? context.iconButtonVariant ?? 'filled',
    size,
    width,
    shape,
    toggle: base.toggle === true,
    connected: context.connected ?? 'none',
    toolbar: toolbar?.color ?? 'none',
  });

  // Destructuring a union merges its members (see Button); `base` holds one member's props.
  const baseProps = {
    ...base,
    disabled: disabledProp ?? context.disabled ?? false,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;

  const button = (
    <ButtonBase {...baseProps}>
      {({ isSelected }) => (
        <span className={styles.content({ class: classNames?.content })}>
          {(size === 'xs' || size === 'sm') && <TouchTarget />}
          <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
            {isSelected && selectedIcon ? selectedIcon : icon}
          </span>
        </span>
      )}
    </ButtonBase>
  );

  const label = base['aria-label'];
  if (!tooltip || inTooltipTrigger || !label || base['aria-labelledby']) return button;
  return (
    <TooltipTrigger>
      {button}
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}
