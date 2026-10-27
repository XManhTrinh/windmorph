'use client';

import { useContext, type ReactElement, type ReactNode, type Ref } from 'react';
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
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { pendingClasses, useButtonPending, type ButtonLabels } from './button-pending';

export interface ButtonClassNames {
  /** The button element itself; merged with `className`. */
  root?: string;
  /** Inner wrapper around the icons and label. */
  content?: string;
  /** The label text. */
  label?: string;
  /** The leading icon. */
  icon?: string;
  /** The slot holding the loading indicator while `pending`, centred over the hidden content. */
  pendingIndicator?: string;
}

interface PendingProps {
  /**
   * Shows a loading indicator in place of the content while an action runs, and blocks
   * presses. The button keeps its width, its colours and keyboard focus; its accessible name
   * gains `labels.pending`, and a focused button announces it. The indicator appears after
   * 200ms, so a quick action doesn't flash. Use it for actions that take a moment, not for
   * every button in a list. A submit button doesn't submit again while pending.
   * @default false
   */
  pending?: boolean;
  /**
   * Replaces the loading indicator shown while `pending`, e.g. a `CircularProgressIndicator`
   * for a wait that may pass five seconds. It's centred over the content and takes the content
   * colour; a progress indicator also loses its track, as M3 asks inside a button.
   */
  pendingIndicator?: ReactElement;
}

/** A toggle's state is its selection: it has no pending state. */
interface NoPendingProps {
  /** Toggle buttons have no pending state. */
  pending?: never;
  /** Toggle buttons have no pending state. */
  pendingIndicator?: never;
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
  /** Words the button announces. */
  labels?: Partial<ButtonLabels>;
}

export interface ButtonActionProps
  extends
    ButtonOwnProps,
    PendingProps,
    Omit<ButtonBaseActionProps, keyof ButtonOwnProps | keyof PendingProps> {}

export interface ButtonLinkProps
  extends
    ButtonOwnProps,
    PendingProps,
    Omit<ButtonBaseLinkProps, keyof ButtonOwnProps | keyof PendingProps> {}

export interface ButtonToggleProps
  extends
    Omit<ButtonOwnProps, 'variant'>,
    NoPendingProps,
    Omit<ButtonBaseToggleProps, keyof ButtonOwnProps | keyof NoPendingProps> {
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
 * <Button type="submit" pending={isPending}>Save</Button>
 */
export function Button({
  variant: variantProp,
  size: sizeProp,
  shape: shapeProp,
  disabled: disabledProp,
  leadingIcon,
  pendingIndicator,
  labels,
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
  const pending = useButtonPending<HTMLElement>({
    pending: base.pending,
    pendingIndicator,
    labels,
    size,
    ariaLabel: base['aria-label'],
    ariaLabelledby: base['aria-labelledby'],
    ref: base.ref as Ref<HTMLElement> | undefined,
    indicatorClassName: cn(pendingClasses.indicator, classNames?.pendingIndicator),
  });
  const baseProps = {
    ...base,
    ...tokenAttributes,
    ...pending.rootProps,
    disabled: disabledProp ?? context.disabled ?? false,
    className: styles.root({ class: cn(classNames?.root, className) }),
  } as ButtonBaseProps;

  return (
    <ButtonBase {...baseProps}>
      {({ isSelected }) => {
        const icon = isSelected && selectedLeadingIcon ? selectedLeadingIcon : leadingIcon;
        const faces = (
          <>
            {icon && (
              <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
                {icon}
              </span>
            )}
            <span className={styles.label({ class: classNames?.label })}>
              {children}
              {pending.nameSuffix}
            </span>
          </>
        );
        return (
          <span
            {...pending.contentProps}
            className={styles.content({
              class: cn(pending.takesPending && pendingClasses.content, classNames?.content),
            })}
          >
            {(size === 'xs' || size === 'sm') && <TouchTarget />}
            {pending.takesPending ? (
              <span className={cn(pendingClasses.faces, pendingClasses.replaced)}>{faces}</span>
            ) : (
              faces
            )}
            {pending.indicator}
            {pending.hiddenName}
          </span>
        );
      }}
    </ButtonBase>
  );
}
