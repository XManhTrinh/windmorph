'use client';

import {
  cloneElement,
  useContext,
  useMemo,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { PressEvent } from 'react-aria';
import { useControlledState } from 'react-stately/useControlledState';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
} from '../../primitives/ButtonBase';
import { TouchTarget } from '../../primitives/TouchTarget';
import { TriggerContext, type TriggerContextValue } from '../../primitives/TriggerContext';
import { cn } from '../../utils/cn';
import { MenuTrigger, type MenuProps } from '../menu/Menu';
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
  /** Inner wrapper of the trailing button, around its icon. */
  trailingContent?: string;
  menuIcon?: string;
}

interface SplitButtonOwnProps {
  /** @default "filled" */
  variant?: SplitButtonVariant;
  /** @default "sm" */
  size?: SplitButtonSize;
  /** Icon before the label, or on its own with `leadingLabel`. Hidden from assistive tech. */
  leadingIcon?: ReactElement;
  /** Accessible name of the trailing button, e.g. "More send options". */
  menuLabel: string;
  /**
   * The `<Menu>` the trailing button opens, 4px below it and aligned with its end edge
   * unless the menu sets its own `placement` or `offset`. Leave it out to open something
   * else: the trailing button then takes an enclosing trigger (a `DialogTrigger`, a
   * `RichTooltipTrigger`, …), or reports presses through `onTrailingPress` and `onOpenChange`.
   */
  menu?: ReactElement<MenuProps>;
  /** Called when the trailing button is pressed. Without a menu or trigger it also toggles `open`. */
  onTrailingPress?: (event: PressEvent) => void;
  /** Ref to the trailing button, e.g. to anchor a custom overlay to it. */
  trailingRef?: Ref<HTMLButtonElement>;
  /** Whether the trailing button's menu or overlay is open (controlled). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Disables both buttons. */
  disabled?: boolean;
  classNames?: SplitButtonClassNames;
}

/** The leading button shows a label, an icon and a label, or an icon alone. */
type LeadingContent =
  | {
      /** The leading button's label. */
      children: ReactNode;
      leadingLabel?: undefined;
    }
  | {
      children?: undefined;
      leadingIcon: ReactElement;
      /** Accessible name of an icon-only leading button. */
      leadingLabel: string;
    };

type LeadingProps =
  | Pick<ButtonBaseActionProps, 'onPress' | 'onPressStart' | 'onPressEnd' | 'type'>
  | Pick<ButtonBaseLinkProps, 'href' | 'target' | 'rel' | 'onPress'>;

export type SplitButtonProps = SplitButtonOwnProps &
  LeadingContent &
  LeadingProps &
  Omit<
    ComponentPropsWithRef<'div'>,
    | keyof SplitButtonOwnProps
    | 'children'
    | 'leadingLabel'
    | 'onPress'
    | 'onPressStart'
    | 'onPressEnd'
    | 'type'
  >;

/**
 * M3 Expressive split button: a leading action and a trailing button that opens a menu
 * of related actions (or another overlay). Five sizes (`xs`–`xl`) in the filled, tonal,
 * outlined and elevated styles. While the menu is open the trailing button becomes round
 * and its chevron turns over. `className`, `style` and `data-*` go on the wrapper;
 * leading-button props (`onPress`, `href`, …) go to the leading button.
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
    size = 'sm',
    children,
    leadingIcon,
    leadingLabel,
    menuLabel,
    menu,
    onTrailingPress,
    trailingRef,
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
  const outerTrigger = useContext(TriggerContext);
  const [isOpen, setOpen] = useControlledState(open, defaultOpen ?? false, onOpenChange);
  const styles = splitButtonStyles({ variant, size });
  const hasTouchTarget = size === 'xs' || size === 'sm';
  const leadingProps = {
    disabled,
    onPress,
    onPressStart,
    onPressEnd,
    'aria-label': leadingLabel,
    className: styles.leading({ class: classNames?.leading }),
    ...(href !== undefined ? { href, target, rel } : { type }),
  } as ButtonBaseActionProps | ButtonBaseLinkProps;

  const trailingProps = {
    label: menuLabel,
    disabled,
    hasTouchTarget,
    buttonRef: trailingRef,
    className: styles.trailing({ class: classNames?.trailing }),
    contentClassName: styles.trailingContent({ class: classNames?.trailingContent }),
    iconClassName: styles.menuIcon({ class: classNames?.menuIcon }),
  };

  let trailing: ReactNode;
  if (menu) {
    trailing = (
      <MenuTrigger open={isOpen} onOpenChange={setOpen}>
        <OpenOnMouseRelease>
          <TrailingButton {...trailingProps} open={isOpen} onPress={onTrailingPress} />
        </OpenOnMouseRelease>
        {cloneElement(menu, {
          placement: menu.props.placement ?? 'bottom end',
          offset: menu.props.offset ?? 4,
          // Aligned with the trailing button even against the window's edge.
          containerPadding: menu.props.containerPadding ?? 0,
        })}
      </MenuTrigger>
    );
  } else if (outerTrigger) {
    // An enclosing trigger (dialog, sheet, rich tooltip) opens its overlay from here.
    trailing = (
      <TrailingButton
        {...trailingProps}
        open={outerTrigger['aria-expanded'] === true}
        onPress={onTrailingPress}
      />
    );
  } else {
    trailing = (
      <TrailingButton
        {...trailingProps}
        open={isOpen}
        aria-expanded={isOpen}
        onPress={(event) => {
          setOpen(!isOpen);
          onTrailingPress?.(event);
        }}
      />
    );
  }

  return (
    <div {...root} className={styles.root({ class: cn(classNames?.root, className) })}>
      {/* The leading button must not pick up the trailing button's trigger props. */}
      <TriggerContext value={null}>
        <ButtonBase {...leadingProps}>
          <span className={styles.content({ class: classNames?.content })}>
            {hasTouchTarget && <TouchTarget />}
            {leadingIcon && (
              <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
                {leadingIcon}
              </span>
            )}
            {children != null && (
              <span className={styles.label({ class: classNames?.label })}>{children}</span>
            )}
          </span>
        </ButtonBase>
      </TriggerContext>
      {trailing}
    </div>
  );
}

/**
 * A menu trigger opens on pointer down for a mouse (React Aria, like native menus). The
 * split button opens it on release instead, so the trailing button's pressed shape shows
 * while it's held, as the spec draws it ("Pressed" before "Selected"; 2026-10-13). A
 * release outside the button doesn't open it. Keyboard and touch are unchanged.
 */
function OpenOnMouseRelease({ children }: { children: ReactNode }) {
  const trigger = useContext(TriggerContext);
  const value = useMemo<TriggerContextValue | null>(() => {
    if (!trigger) return null;
    const { onPressStart, onPress } = trigger;
    return {
      ...trigger,
      onPressStart: (event) => {
        if (event.pointerType !== 'mouse') onPressStart?.(event);
      },
      onPress: (event) => {
        if (event.pointerType === 'mouse') {
          // Focus the trigger first, so closing the menu returns focus to it.
          (event.target as Element).closest<HTMLElement>('button')?.focus({ preventScroll: true });
          onPressStart?.(event);
        }
        onPress?.(event);
      },
    };
  }, [trigger]);
  return <TriggerContext value={value}>{children}</TriggerContext>;
}

interface TrailingButtonProps {
  label: string;
  open: boolean;
  disabled?: boolean;
  hasTouchTarget: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onPress?: (event: PressEvent) => void;
  'aria-expanded'?: boolean;
  className: string;
  contentClassName: string;
  iconClassName: string;
}

/**
 * The trailing button. An enclosing trigger (the menu's or another overlay's) adds its
 * press handler and `aria-expanded` through `TriggerContext`.
 */
function TrailingButton({
  label,
  open,
  disabled,
  hasTouchTarget,
  buttonRef,
  onPress,
  'aria-expanded': ariaExpanded,
  className,
  contentClassName,
  iconClassName,
}: TrailingButtonProps) {
  return (
    <ButtonBase
      ref={buttonRef}
      aria-label={label}
      aria-expanded={ariaExpanded}
      data-open={open || undefined}
      disabled={disabled}
      onPress={onPress}
      className={className}
    >
      <span className={contentClassName}>
        {hasTouchTarget && <TouchTarget />}
        {/* M3: the trailing button always shows this icon, since it turns over when open. */}
        <span aria-hidden="true" data-motion="standard" className={iconClassName}>
          <ArrowDownIcon />
        </span>
      </span>
    </ButtonBase>
  );
}
