'use client';

import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
} from '../../primitives/ButtonBase';
import { useControlledState } from 'react-stately/useControlledState';
import { TriggerContext } from '../../primitives/TriggerContext';
import { cn } from '../../utils/cn';
import { MenuTrigger } from '../menu/Menu';
import {
  splitButtonStyles,
  type SplitButtonSize,
  type SplitButtonVariant,
} from './split-button-styles';

/** Material Symbols "keyboard_arrow_down" (Apache-2.0). */
function ArrowDownIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
    </svg>
  );
}

export interface SplitButtonClassNames {
  root?: string;
  leading?: string;
  content?: string;
  label?: string;
  icon?: string;
  trailing?: string;
  menuIcon?: string;
}

interface SplitButtonOwnProps {
  /** @default "filled" */
  variant?: SplitButtonVariant;
  /** @default "sm" */
  size?: SplitButtonSize;
  /** The leading button's label. */
  children: ReactNode;
  /** Icon before the label. Hidden from assistive tech. */
  leadingIcon?: ReactElement;
  /** Accessible name of the trailing button, e.g. "More send options". */
  menuLabel: string;
  /** The `<Menu>` the trailing button opens. */
  menu: ReactElement;
  /** Replaces the trailing chevron (which turns over while the menu is open). */
  menuIcon?: ReactElement;
  /** Whether the menu is open (controlled). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Disables both buttons. */
  disabled?: boolean;
  classNames?: SplitButtonClassNames;
}

type LeadingProps =
  | Pick<ButtonBaseActionProps, 'onPress' | 'onPressStart' | 'onPressEnd' | 'type'>
  | Pick<ButtonBaseLinkProps, 'href' | 'target' | 'rel' | 'onPress'>;

export type SplitButtonProps = SplitButtonOwnProps &
  LeadingProps &
  Omit<
    ComponentPropsWithRef<'div'>,
    keyof SplitButtonOwnProps | 'onPress' | 'onPressStart' | 'onPressEnd' | 'type'
  >;

/**
 * M3 Expressive split button: a leading action and a trailing button that opens a menu
 * of related actions. Five sizes (`xs`–`xl`) in the filled, tonal, outlined and elevated
 * styles. While the menu is open the trailing button becomes round and its chevron turns
 * over. `className`, `style` and `data-*` go on the wrapper; leading-button props
 * (`onPress`, `href`, …) go to the leading button.
 *
 * @example
 * <SplitButton
 *   leadingIcon={<SendIcon />}
 *   onPress={send}
 *   menuLabel="More send options"
 *   menu={<Menu onAction={schedule}><MenuItem key="later">Send later</MenuItem></Menu>}
 * >
 *   Send
 * </SplitButton>
 */
export function SplitButton(props: SplitButtonProps) {
  const {
    variant,
    size,
    children,
    leadingIcon,
    menuLabel,
    menu,
    menuIcon,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    classNames,
    className,
    onPress,
    ...rest
  } = props;
  const { href, target, rel, type, onPressStart, onPressEnd, ...root } = rest as typeof rest & {
    href?: string;
    target?: string;
    rel?: string;
    type?: ButtonBaseActionProps['type'];
    onPressStart?: ButtonBaseActionProps['onPressStart'];
    onPressEnd?: ButtonBaseActionProps['onPressEnd'];
  };
  const [isOpen, setOpen] = useControlledState(open, defaultOpen ?? false, onOpenChange);
  const styles = splitButtonStyles({ variant, size });
  const leadingProps = {
    disabled,
    onPress,
    onPressStart,
    onPressEnd,
    className: styles.leading({ class: classNames?.leading }),
    ...(href !== undefined ? { href, target, rel } : { type }),
  } as ButtonBaseActionProps | ButtonBaseLinkProps;

  return (
    <div {...root} className={styles.root({ class: cn(classNames?.root, className) })}>
      {/* The leading button must not pick up the menu trigger's props. */}
      <TriggerContext value={null}>
        <ButtonBase {...leadingProps}>
          <span className={styles.content({ class: classNames?.content })}>
            {leadingIcon && (
              <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
                {leadingIcon}
              </span>
            )}
            <span className={styles.label({ class: classNames?.label })}>{children}</span>
          </span>
        </ButtonBase>
      </TriggerContext>
      <MenuTrigger open={isOpen} onOpenChange={setOpen}>
        <TrailingButton
          label={menuLabel}
          open={isOpen}
          disabled={disabled}
          className={styles.trailing({ class: classNames?.trailing })}
          iconClassName={styles.menuIcon({ class: classNames?.menuIcon })}
          icon={menuIcon ?? <ArrowDownIcon />}
        />
        {menu}
      </MenuTrigger>
    </div>
  );
}

interface TrailingButtonProps {
  label: string;
  open: boolean;
  disabled?: boolean;
  className: string;
  iconClassName: string;
  icon: ReactElement;
}

/** The menu trigger: MenuTrigger supplies its press handler and `aria-expanded`. */
function TrailingButton({
  label,
  open,
  disabled,
  className,
  iconClassName,
  icon,
}: TrailingButtonProps) {
  return (
    <ButtonBase
      aria-label={label}
      data-open={open || undefined}
      disabled={disabled}
      className={className}
    >
      <span aria-hidden="true" className={iconClassName}>
        {icon}
      </span>
    </ButtonBase>
  );
}
