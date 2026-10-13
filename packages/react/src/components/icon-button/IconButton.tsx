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
  /** @default "standard" */
  variant?: IconButtonVariant;
  /** @default "sm" */
  size?: ButtonSize;
  /** @default "default" */
  width?: IconButtonWidth;
  /** @default "round" */
  shape?: ButtonShape;
  /** The icon, e.g. a Material Symbols SVG. Hidden from assistive tech; `aria-label` names the button. */
  icon: ReactElement;
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
 * M3 Expressive icon button: standard, filled, tonal and outlined variants; XS–XL
 * sizes; narrow, default or wide widths; round or square shape; an optional toggle
 * form; and a press morph. Standard and outlined icon buttons take the surrounding
 * text colour, like Compose's `LocalContentColor`.
 *
 * Shares `size`, `shape` and `disabled` with `ButtonContext`, so it fits in button groups.
 *
 * @example
 * <IconButton icon={<SearchIcon />} aria-label="Search" onPress={openSearch} />
 * <IconButton toggle variant="filled" icon={<StarIcon />} selectedIcon={<StarFilledIcon />}
 *   aria-label="Favourite" selected={isFavourite} onSelectedChange={setFavourite} />
 */
export function IconButton(props: IconButtonProps) {
  const {
    variant = 'standard',
    size: sizeProp,
    width = 'default',
    shape: shapeProp,
    disabled: disabledProp,
    icon,
    classNames,
    className,
    // Only toggle props carry `selectedIcon`; the others read it as undefined.
    selectedIcon,
    ...base
  } = props as IconButtonToggleProps & IconButtonProps;

  const context = useContext(ButtonContext);
  const size = sizeProp ?? context.size ?? 'sm';
  const styles = iconButtonStyles({
    variant,
    size,
    width,
    shape: shapeProp ?? context.shape ?? 'round',
    toggle: base.toggle === true,
    connected: context.connected ?? 'none',
  });

  // Destructuring a union merges its members (see Button); `base` holds one member's props.
  const baseProps = {
    ...base,
    disabled: disabledProp ?? context.disabled ?? false,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;

  return (
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
}
