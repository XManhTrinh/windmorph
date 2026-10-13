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

export interface ButtonClassNames {
  root?: string;
  /** Inner wrapper around the icons and label. */
  content?: string;
  label?: string;
  icon?: string;
}

interface ButtonOwnProps {
  /** @default "filled" */
  variant?: ButtonVariant;
  /** @default "sm" */
  size?: ButtonSize;
  /** @default "round" */
  shape?: ButtonShape;
  /** Icon before the label, e.g. a Material Symbols SVG. Decorative; the label names the button. */
  leadingIcon?: ReactElement;
  /** Icon after the label. */
  trailingIcon?: ReactElement;
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
 * <Button toggle selected={starred} onSelectedChange={setStarred}>Starred</Button>
 * <Button href="/docs" variant="text">Docs</Button>
 */
export function Button({
  variant: variantProp,
  size: sizeProp,
  shape: shapeProp,
  disabled: disabledProp,
  leadingIcon,
  trailingIcon,
  classNames,
  className,
  children,
  ...base
}: ButtonProps) {
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
    hasLeadingIcon: Boolean(leadingIcon),
    connected: context.connected ?? 'none',
  });

  // Destructuring a union merges its members, so TypeScript loses the pairing of
  // `href`/`toggle` with their `ref` types. `base` still holds exactly one member's props.
  const baseProps = {
    ...base,
    disabled: disabledProp ?? context.disabled ?? false,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;

  return (
    <ButtonBase {...baseProps}>
      <span className={styles.content({ class: classNames?.content })}>
        {(size === 'xs' || size === 'sm') && <TouchTarget />}
        {leadingIcon && (
          <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
            {leadingIcon}
          </span>
        )}
        <span className={styles.label({ class: classNames?.label })}>{children}</span>
        {trailingIcon && (
          <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
            {trailingIcon}
          </span>
        )}
      </span>
    </ButtonBase>
  );
}
