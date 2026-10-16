'use client';

import { useContext, type ReactElement, type ReactNode } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
  type ButtonBaseProps,
  type ButtonBaseToggleProps,
} from '../../primitives/ButtonBase';
import { TouchTarget } from '../../primitives/TouchTarget';
import { cn } from '../../utils/cn';
import {
  buttonStyles,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from './button-styles';
import { ButtonContext } from './ButtonContext';
import { mergeDataTokens } from '../../utils/split-data-attributes';

export interface ButtonClassNames {
  /** The button element itself; merged with `className`. */
  root?: string;
  /** Inner wrapper around the icons and label. */
  content?: string;
  /** The label text. */
  label?: string;
  /** The leading icon. */
  icon?: string;
}

interface ButtonOwnProps {
  /** The M3 style: filled, tonal, outlined, elevated or text. @default "filled" */
  variant?: ButtonVariant;
  /** Height, padding and label size, from extra small to extra large. @default "sm" */
  size?: ButtonSize;
  /** Fully round corners, or square ones (still rounded, but less). @default "round" */
  shape?: ButtonShape;
  /**
   * Icon before the label, e.g. a Material Symbols SVG. Decorative; the label names the
   * button. M3 allows one icon, on the leading side ("Don't use two icons in the same
   * button"), so there's no trailing icon.
   */
  leadingIcon?: ReactElement;
  /** The visible label. Required: buttons without text are `IconButton`s. */
  children: Exclude<ReactNode, null | undefined | boolean>;
  /** Classes for each part. `classNames.root` is merged with `className`. */
  classNames?: ButtonClassNames;
}

export interface ButtonActionProps
  extends ButtonOwnProps, Omit<ButtonBaseActionProps, keyof ButtonOwnProps> {}

export interface ButtonLinkProps
  extends ButtonOwnProps, Omit<ButtonBaseLinkProps, keyof ButtonOwnProps> {}

export interface ButtonToggleProps
  extends Omit<ButtonOwnProps, 'variant'>, Omit<ButtonBaseToggleProps, keyof ButtonOwnProps> {
  /** Text buttons have no toggle form. @default "filled" */
  variant?: Exclude<ButtonVariant, 'text'>;
  /**
   * Leading icon shown while selected, e.g. the filled form of `leadingIcon` (M3: "use an
   * outlined icon when unselected, and a filled version of the icon when selected").
   * @default leadingIcon
   */
  selectedLeadingIcon?: ReactElement;
}

export type ButtonProps = ButtonActionProps | ButtonLinkProps | ButtonToggleProps;

/**
 * M3 Expressive button: five variants, five sizes (XS–XL), round or square shape,
 * an optional toggle form, and a press morph that squares the corners while pressed.
 *
 * Renders a `<button>`, or an `<a>` when `href` is set. `className` and `style` go on
 * that element, and consumer classes always win.
 *
 * @example
 * <Button variant="tonal" size="md" leadingIcon={<EditIcon />} onPress={edit}>Edit</Button>
 * <Button toggle leadingIcon={<StarIcon />} selectedLeadingIcon={<StarFilledIcon />}
 *   selected={starred} onSelectedChange={setStarred}>Starred</Button>
 * <Button href="/docs" variant="text">Docs</Button>
 */
export function Button({
  variant: variantProp,
  size: sizeProp,
  shape: shapeProp,
  disabled: disabledProp,
  leadingIcon,
  classNames,
  className,
  children,
  ...rest
}: ButtonProps) {
  // Only toggle props carry `selectedLeadingIcon`; the others read it as undefined.
  const { selectedLeadingIcon, ...base } = rest as typeof rest & {
    selectedLeadingIcon?: ReactElement;
  };
  const context = useContext(ButtonContext);
  const toggle = base.toggle === true;
  let variant = variantProp ?? context.variant ?? 'filled';
  if (toggle && variant === 'text') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[@windmorph/react] Text buttons have no toggle form; using "filled".');
    }
    variant = 'filled';
  }
  const size = sizeProp ?? context.size ?? 'sm';
  const styles = buttonStyles({
    variant,
    size,
    shape: shapeProp ?? context.shape ?? 'round',
    toggle,
    connected: context.connected ?? 'none',
  });

  // Destructuring a union merges its members, so TypeScript loses the pairing of
  // `href`/`toggle` with their `ref` types. `base` still holds exactly one member's props.
  // The component tokens' hooks (button-tokens.ts), also public styling hooks for apps.
  const tokenAttributes = {
    'data-tokens': mergeDataTokens('md-comp-button', base),
    'data-variant': variant,
    'data-size': size,
  };
  const baseProps = {
    ...base,
    ...tokenAttributes,
    disabled: disabledProp ?? context.disabled ?? false,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;

  return (
    <ButtonBase {...baseProps}>
      {({ isSelected }) => {
        const icon = isSelected && selectedLeadingIcon ? selectedLeadingIcon : leadingIcon;
        return (
          <span className={styles.content({ class: classNames?.content })}>
            {(size === 'xs' || size === 'sm') && <TouchTarget />}
            {icon && (
              <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
                {icon}
              </span>
            )}
            <span className={styles.label({ class: classNames?.label })}>{children}</span>
          </span>
        );
      }}
    </ButtonBase>
  );
}
