'use client';

import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  mergeRefs,
  useButton,
  useLink,
  useObjectRef,
  useToggleButton,
  useToggleButtonGroupItem,
  type PressEvents,
} from 'react-aria';
import { useToggleState, type ToggleGroupState } from 'react-stately';
import { TriggerContext, type TriggerContextValue } from './TriggerContext';
import { useM3Interaction } from './use-m3-interaction';

/**
 * Selection state of an enclosing toggle group (e.g. a connected `ButtonGroup`). Toggle
 * buttons with a `value` inside it are selected through the group instead of on their own.
 */
export const ToggleGroupStateContext = createContext<ToggleGroupState | null>(null);

type PressHandlers = Pick<
  PressEvents,
  'onPress' | 'onPressStart' | 'onPressEnd' | 'onPressChange' | 'onPressUp'
> & {
  /** Don't move focus to the element on press (set by menu triggers). @default false */
  preventFocusOnPress?: boolean;
};

export interface ButtonBaseRenderState {
  isSelected: boolean;
}

interface ButtonBaseCommonProps extends PressHandlers {
  /** Disables the element: it can't be pressed or focused, and shows the disabled style. @default false */
  disabled?: boolean;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /**
   * The element is being dragged (e.g. a card picked up to move it): sets `data-dragged`
   * for the dragged state layer. A consumer's own `data-dragged` attribute counts too.
   * @default false
   */
  dragged?: boolean;
  /** Content, or a function of the selection state (e.g. to swap a toggle's icon). */
  children?: ReactNode | ((state: ButtonBaseRenderState) => ReactNode);
}

type OwnKeys = keyof ButtonBaseCommonProps | 'color';

export interface ButtonBaseActionProps
  extends ButtonBaseCommonProps, Omit<ComponentPropsWithoutRef<'button'>, OwnKeys> {
  /** Ref to the root `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
  /** The element rendered: a native `<button>`. @default "button" */
  elementType?: 'button';
  /** Renders a link (`<a>`) instead of a button. */
  href?: undefined;
  /** Makes the button a toggle (`aria-pressed`) with `selected` and `onSelectedChange`. @default false */
  toggle?: false;
}

/**
 * A `div` with `role="button"`, for pressable containers whose content a `<button>` may
 * not hold (headings, images, block layout), such as clickable cards.
 */
export interface ButtonBaseDivActionProps
  extends ButtonBaseCommonProps, Omit<ComponentPropsWithoutRef<'div'>, OwnKeys> {
  /** Ref to the root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
  /** Renders a `div` with `role="button"`, for content a `<button>` may not hold. */
  elementType: 'div';
  /** Renders a link (`<a>`) instead of a button. */
  href?: undefined;
  /** Makes the button a toggle (`aria-pressed`) with `selected` and `onSelectedChange`. @default false */
  toggle?: false;
}

export interface ButtonBaseLinkProps
  extends ButtonBaseCommonProps, Omit<ComponentPropsWithoutRef<'a'>, OwnKeys | 'href'> {
  /** Ref to the root `<a>` element. */
  ref?: Ref<HTMLAnchorElement>;
  /** Renders a link. Navigation goes through React Aria's `RouterProvider` when one is set. */
  href: string;
  /** Makes the button a toggle (`aria-pressed`) with `selected` and `onSelectedChange`. @default false */
  toggle?: false;
}

export interface ButtonBaseToggleProps
  extends
    ButtonBaseCommonProps,
    Omit<ComponentPropsWithoutRef<'button'>, OwnKeys | 'aria-pressed' | 'onChange'> {
  /** Ref to the root `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
  /** Renders a link (`<a>`) instead of a button. */
  href?: undefined;
  /** Makes the button a toggle (`aria-pressed`). */
  toggle: true;
  /** Identifies the button in a selection group; required to take part in its selection. */
  value?: string;
  /** Controlled selection. Ignored inside a selection group. */
  selected?: boolean;
  /** Initial selection when uncontrolled. */
  defaultSelected?: boolean;
  /** Called with the new selection when the user toggles the button. */
  onSelectedChange?: (selected: boolean) => void;
}

export type ButtonBaseProps =
  ButtonBaseActionProps | ButtonBaseDivActionProps | ButtonBaseLinkProps | ButtonBaseToggleProps;

function splitProps<T extends ButtonBaseCommonProps>(props: T) {
  const {
    disabled = false,
    className,
    style,
    children,
    onPress,
    onPressStart,
    onPressEnd,
    onPressChange,
    onPressUp,
    preventFocusOnPress,
    dragged,
    ...dom
  } = props;
  const consumerDragged = (dom as Record<string, unknown>)['data-dragged'];
  return {
    disabled,
    // Our `data-*` attributes are spread last, so a consumer's `data-dragged` feeds the state.
    isDragged:
      dragged ??
      (consumerDragged !== undefined && consumerDragged !== false && consumerDragged !== 'false'),
    element: { className, style },
    children,
    // React Aria options, not DOM attributes: they go to the press hooks.
    press: { onPress, onPressStart, onPressEnd, onPressChange, onPressUp, preventFocusOnPress },
    dom,
  };
}

const render = (children: ButtonBaseCommonProps['children'], isSelected: boolean) =>
  typeof children === 'function' ? children({ isSelected }) : children;

function ActionBase(props: ButtonBaseActionProps | ButtonBaseDivActionProps) {
  const { ref, elementType = 'button', ...rest } = props;
  const type =
    elementType === 'button' ? ((rest as ButtonBaseActionProps).type ?? 'button') : undefined;
  const { disabled, isDragged, element, children, press, dom } = splitProps(rest);
  const domRef = useObjectRef(ref as Ref<HTMLElement>);
  const { buttonProps, isPressed } = useButton(
    { ...press, type, isDisabled: disabled, elementType },
    domRef,
  );
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled, isPressed, isDragged },
    domRef,
  );
  const elementProps = {
    ...mergeProps(dom, buttonProps, interactionProps),
    ...dataAttributes,
    ...element,
  };
  return elementType === 'div' ? (
    <div {...elementProps} ref={domRef as Ref<HTMLDivElement>}>
      {render(children, false)}
    </div>
  ) : (
    <button {...elementProps} ref={domRef as Ref<HTMLButtonElement>}>
      {render(children, false)}
    </button>
  );
}

function LinkBase({ ref, href, ...props }: ButtonBaseLinkProps) {
  const { disabled, isDragged, element, children, press, dom } = splitProps(props);
  const domRef = useObjectRef(ref);
  const { linkProps, isPressed } = useLink(
    { ...press, href, isDisabled: disabled, elementType: 'a' },
    domRef,
  );
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled, isPressed, isDragged },
    domRef,
  );
  return (
    <a
      {...mergeProps(dom, linkProps, interactionProps)}
      {...dataAttributes}
      {...element}
      href={disabled ? undefined : href}
      ref={domRef}
    >
      {render(children, false)}
    </a>
  );
}

function ToggleBase({
  ref,
  type = 'button',
  selected,
  defaultSelected,
  onSelectedChange,
  toggle,
  ...props
}: ButtonBaseToggleProps) {
  const { disabled, isDragged, element, children, press, dom } = splitProps(props);
  const domRef = useObjectRef(ref);
  const options = {
    ...press,
    type,
    isDisabled: disabled,
    isSelected: selected,
    defaultSelected,
    onChange: onSelectedChange,
    elementType: 'button' as const,
  };
  const state = useToggleState(options);
  const { buttonProps, isPressed, isSelected } = useToggleButton(options, state, domRef);
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled, isPressed, isSelected, isDragged },
    domRef,
  );
  return (
    <button
      {...mergeProps(dom, buttonProps, interactionProps)}
      {...dataAttributes}
      {...element}
      ref={domRef}
    >
      {render(children, isSelected)}
    </button>
  );
}

function GroupItemBase({
  ref,
  type = 'button',
  value,
  state,
  ...props
}: Omit<ButtonBaseToggleProps, 'selected' | 'defaultSelected' | 'onSelectedChange' | 'toggle'> & {
  value: string;
  state: ToggleGroupState;
}) {
  const { disabled, isDragged, element, children, press, dom } = splitProps(props);
  const domRef = useObjectRef(ref);
  const { buttonProps, isPressed, isSelected } = useToggleButtonGroupItem(
    { ...press, id: value, isDisabled: disabled, elementType: 'button' },
    state,
    domRef,
  );
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled || state.isDisabled, isPressed, isSelected, isDragged },
    domRef,
  );
  return (
    <button
      {...mergeProps(dom, buttonProps, interactionProps)}
      {...dataAttributes}
      {...element}
      type={type}
      value={value}
      ref={domRef}
    >
      {render(children, isSelected)}
    </button>
  );
}

function withTrigger(
  props: ButtonBaseProps,
  { ref: triggerRef, ...trigger }: TriggerContextValue,
): ButtonBaseProps {
  const merged = mergeProps(trigger, props) as ButtonBaseProps;
  return {
    ...merged,
    ref: mergeRefs(props.ref as Ref<HTMLElement>, triggerRef as Ref<HTMLElement>),
  } as ButtonBaseProps;
}

/**
 * Unstyled button behaviour shared by every button-like component: a `<button>`, a
 * link (`href`) or a toggle (`toggle`), with React Aria press, focus and keyboard
 * handling, and the M3 interaction `data-*` attributes and ripple origin from
 * `useM3Interaction`. DOM props pass through; `className` and `style` go on the element.
 */
export function ButtonBase(ownProps: ButtonBaseProps) {
  const groupState = useContext(ToggleGroupStateContext);
  const trigger = useContext(TriggerContext);
  // An enclosing overlay trigger adds its press handler (chained), ARIA attributes and ref.
  const props = trigger ? withTrigger(ownProps, trigger) : ownProps;
  if (props.href !== undefined) return <LinkBase {...props} />;
  if (props.toggle) {
    if (groupState && props.value !== undefined) {
      const { selected, defaultSelected, onSelectedChange, toggle, value, ...item } = props;
      if (
        process.env.NODE_ENV !== 'production' &&
        (selected !== undefined || defaultSelected !== undefined || onSelectedChange)
      ) {
        console.warn(
          `[@windmorph/react] Toggle "${value}" is inside a selection group; use the group's selectedKeys instead of selected / onSelectedChange.`,
        );
      }
      return <GroupItemBase {...item} value={value} state={groupState} />;
    }
    return <ToggleBase {...props} />;
  }
  return <ActionBase {...props} />;
}
