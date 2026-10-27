'use client';

import {
  createContext,
  useContext,
  useEffect,
  type RefObject,
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

/**
 * The pending state `Button` and `IconButton` build on. It isn't part of the other props types,
 * so components that extend them (FABs, chips, cards) don't inherit it; pass it to `ButtonBase`
 * alongside them.
 */
export interface ButtonBasePendingProps {
  /**
   * An action started by the element is running: presses are blocked (`onPress`, `onClick`,
   * Enter and Space do nothing, no hover or pressed state), but the element stays focusable and
   * in the Tab order, unlike `disabled`. Sets `aria-disabled="true"` and `data-pending`; a
   * submit button renders `type="button"` meanwhile, so the form isn't submitted again, and a
   * link keeps its `href` with its navigation prevented. `disabled` wins when both are set.
   * A toggle ignores it.
   * @default false
   */
  pending?: boolean;
}

type OwnKeys = keyof ButtonBaseCommonProps | 'color';

export interface ButtonBaseActionProps
  extends ButtonBaseCommonProps, Omit<ComponentPropsWithoutRef<'button'>, OwnKeys> {
  /** Ref to the root `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
  /** The element rendered: a native `<button>`. @default "button" */
  as?: 'button';
  /**
   * The value a submit button sends with its form, under its `name`. On a toggle (`toggle`)
   * it's a `string` naming the button in a selection group instead, required to take part in
   * the group's selection.
   */
  value?: ComponentPropsWithoutRef<'button'>['value'];
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
  as: 'div';
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

function splitProps<T extends ButtonBaseCommonProps & { pending?: boolean }>(props: T) {
  const {
    disabled = false,
    pending: pendingProp = false,
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
  // `disabled` wins: a disabled element is natively disabled even while its action runs.
  const pending = pendingProp && !disabled;
  return {
    disabled,
    pending,
    /** Presses, hover and the pressed state are off: disabled, or pending. */
    blocked: disabled || pending,
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

/**
 * While a submit button is pending it renders `type="button"`, but a form left without a submit
 * button still submits on Enter in its only field (HTML's implicit submission). This stops a
 * submission with no submitter (or this button) before it reaches React or the browser, so
 * Enter doesn't send the form again; another submit button of the form still works.
 */
function useBlockImplicitSubmit(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const button = ref.current;
    const form = button instanceof HTMLButtonElement ? button.form : null;
    if (!enabled || !form) return;
    const block = (event: Event) => {
      // A plain `Event` (no `submitter`) counts as implicit too.
      const submitter = (event as Partial<SubmitEvent>).submitter;
      if (submitter && submitter !== button) return;
      event.preventDefault();
      event.stopPropagation();
    };
    form.addEventListener('submit', block, true);
    return () => form.removeEventListener('submit', block, true);
  }, [ref, enabled]);
}

/** A pending element ignores clicks: a consumer's `onClick` is left out while it waits. */
function withoutClickWhilePending<T extends { onClick?: unknown }>(dom: T, pending: boolean) {
  if (!pending) return dom;
  const { onClick: _onClick, ...rest } = dom;
  return rest;
}

/**
 * What a pending element changes on top of the blocked hooks' props (React Aria's pending
 * `Button`): it stays focusable (React Aria's `isDisabled` would make a `<button>` natively
 * disabled and drop its tab stop), says it's unavailable with `aria-disabled`, and keeps the
 * enabled look (`data-disabled` only for `disabled`).
 */
function pendingAttributes(pending: boolean, dom: { tabIndex?: number }) {
  return pending
    ? {
        disabled: undefined,
        tabIndex: dom.tabIndex ?? 0,
        'aria-disabled': true as const,
        'data-disabled': undefined,
        'data-pending': true as const,
      }
    : {};
}

const render = (children: ButtonBaseCommonProps['children'], isSelected: boolean) =>
  typeof children === 'function' ? children({ isSelected }) : children;

function ActionBase(
  props: (ButtonBaseActionProps | ButtonBaseDivActionProps) & ButtonBasePendingProps,
) {
  const { ref, as: elementType = 'button', ...rest } = props;
  const type =
    elementType === 'button' ? ((rest as ButtonBaseActionProps).type ?? 'button') : undefined;
  const { pending, blocked, isDragged, element, children, press, dom } = splitProps(rest);
  const domRest = withoutClickWhilePending(dom, pending);
  const domRef = useObjectRef(ref as Ref<HTMLElement>);
  const { buttonProps, isPressed } = useButton(
    { ...press, type, isDisabled: blocked, elementType },
    domRef,
  );
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: blocked, isPressed, isDragged },
    domRef,
  );
  useBlockImplicitSubmit(domRef, pending && type === 'submit');
  const elementProps = {
    ...mergeProps(domRest, buttonProps, interactionProps),
    ...dataAttributes,
    ...pendingAttributes(pending, domRest),
    // Enter in a form's field would submit it again through a pending submit button.
    ...(pending && type === 'submit' ? { type: 'button' as const } : {}),
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

function LinkBase({ ref, href, ...props }: ButtonBaseLinkProps & ButtonBasePendingProps) {
  const { disabled, pending, blocked, isDragged, element, children, press, dom } =
    splitProps(props);
  const domRest = withoutClickWhilePending(dom, pending);
  const domRef = useObjectRef(ref);
  const { linkProps, isPressed } = useLink(
    // While blocked, the press hook prevents a click's navigation.
    { ...press, href, isDisabled: blocked, elementType: 'a' },
    domRef,
  );
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: blocked, isPressed, isDragged },
    domRef,
  );
  return (
    <a
      {...mergeProps(domRest, linkProps, interactionProps)}
      {...dataAttributes}
      {...pendingAttributes(pending, domRest)}
      {...element}
      // A pending link stays a link (role and tab stop); only a disabled one drops `href`.
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
 * `pending` blocks presses but keeps focus (see {@link ButtonBasePendingProps}).
 */
export function ButtonBase(ownProps: ButtonBaseProps & ButtonBasePendingProps) {
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
