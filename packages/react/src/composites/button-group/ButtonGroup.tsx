'use client';

import {
  Children,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
  type RefObject,
} from 'react';
import { mergeProps, mergeRefs, useObjectRef, useToggleButtonGroup, useToolbar } from 'react-aria';
import { useToggleGroupState } from 'react-stately';
import { Button } from '../../components/button/Button';
import type { ButtonShape, ButtonSize, ButtonVariant } from '../../components/button/button-styles';
import {
  ButtonContext,
  ToggleGroupStateContext,
  type ButtonContextValue,
} from '../../components/button/ButtonContext';
import { IconButton } from '../../components/icon-button/IconButton';
import type { IconButtonVariant } from '../../components/icon-button/icon-button-styles';
import { MenuTrigger } from '../../components/menu/menu-trigger';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { cn } from '../../utils/cn';
import {
  focusCheckedRadio,
  notePointerDown,
  radioGroupKeyDown,
} from '../../utils/radio-group-keys';
import { toolbarKeyDown } from '../../utils/toolbar-keys';
import type { VariantProps } from '../../utils/tv';
import { useWarnOnce } from '../../utils/warn-once';
import { buttonGroupStyles } from './button-group-styles';
import { LazyOverflowMenuList } from './lazy-overflow-menu';
import { useOverflow } from './use-overflow';
import { usePressExpansion } from './use-press-expansion';

/** Material Symbols `more_vert` (Apache-2.0), the overflow indicator's icon. */
function MoreVertIcon() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
    </svg>
  );
}

export type ButtonGroupVariant = NonNullable<VariantProps<typeof buttonGroupStyles>['variant']>;
export type ButtonGroupSelectionMode = 'none' | 'single' | 'multiple';

/** Text the group adds for assistive tech and its tooltip; translate it for your locale. */
export interface ButtonGroupLabels {
  /** The overflow indicator's name and tooltip. @default "More options" */
  more: string;
}

const DEFAULT_LABELS: ButtonGroupLabels = { more: 'More options' };

export interface ButtonGroupClassNames {
  /** The group's outer element; `className` is merged here too. */
  root?: string;
  /** The overflow indicator, the "More options" icon button (`overflow`). */
  overflowButton?: string;
  /** The overflow indicator's menu of folded buttons (`overflow`). */
  overflowMenu?: string;
}

export interface ButtonGroupProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'defaultValue'
> {
  /**
   * `standard` spaces the buttons apart (18 / 12 / 8px by size); `connected` joins them 2px
   * apart with shared inner corners across the container's width (the M3 Expressive
   * replacement for segmented buttons). A standard group grows a pressed button into its
   * neighbours' space; a connected one only changes its shape unless `expandedRatio` is set.
   * @default "standard"
   */
  variant?: ButtonGroupVariant;
  /**
   * Size shared by every button and icon button in the group; it also sets the spacing.
   * Unset, the buttons keep their own (or an enclosing toolbar's) size.
   * @default "sm"
   */
  size?: ButtonSize;
  /**
   * Shape shared by the buttons. A `square` connected group gives its outer corners the
   * size of its inner ones (4 / 8 / 8 / 16 / 20px). Unset, the buttons keep their own.
   * @default "round"
   */
  shape?: ButtonShape;
  /**
   * Variant shared by every `Button` in the group. `filled`, `tonal` and `outlined` reach
   * the `IconButton`s too, so a group never mixes colour styles; a button's own `variant`
   * wins. Unset, the buttons keep their own.
   * @default "filled"
   */
  buttonVariant?: ButtonVariant;
  /** Disables every button in the group. @default false */
  disabled?: boolean;
  /**
   * Lets toggle buttons with a `value` act as one selection. `single` behaves like
   * radio buttons, `multiple` like checkboxes. @default "none"
   */
  selectionMode?: ButtonGroupSelectionMode;
  /** Controlled selection: the `value`s of the selected toggle buttons. */
  selectedKeys?: Iterable<string>;
  /** Initial selection when uncontrolled. */
  defaultSelectedKeys?: Iterable<string>;
  /** Called with the selected toggle buttons' `value`s when the selection changes. */
  onSelectionChange?: (keys: Set<string>) => void;
  /**
   * The last selected button can be deselected, leaving none. `false` keeps at least one
   * selected. @default true
   */
  deselectable?: boolean;
  /**
   * How much a pressed button grows, as a fraction of its width; its neighbours shrink by the
   * same amount and the group keeps its width. `0` turns it off. Standard groups default to
   * 0.15. Connected groups default to 0 (the spec: they "don't affect adjacent buttons", as
   * in Compose's connected sample); set a ratio to opt in, as Compose can by combining a
   * button group's `animateWidth` with the connected shapes. Under reduced motion there's
   * no bump. @default 0.15, or 0 when `variant` is "connected"
   */
  expandedRatio?: number;
  /**
   * Folds the trailing buttons that don't fit into a menu behind a trailing "More options"
   * icon button (M3: "Buttons at the trailing edge of the button group can be customized to
   * collapse into an overflow menu at smaller breakpoints"). The group then fills its
   * container's width and re-measures as it resizes. Each folded button becomes a menu
   * item with its label (an icon button's `aria-label`) and icon; disabled buttons stay
   * disabled, and toggles show their selection. Choosing an item presses the button.
   * @default false
   */
  overflow?: boolean;
  /**
   * Text for assistive tech, e.g. the overflow indicator's name.
   * @default { more: "More options" }
   */
  labels?: Partial<ButtonGroupLabels>;
  /** Classes for each part. `classNames.root` is merged with `className`. */
  classNames?: ButtonGroupClassNames;
  children?: ReactNode;
}

/** The props the group reads from its children for the overflow menu and warnings. */
interface ChildProps {
  variant?: string;
  toggle?: boolean;
  value?: string;
  disabled?: boolean;
  children?: ReactNode;
  leadingIcon?: ReactElement;
  selectedLeadingIcon?: ReactElement;
  icon?: ReactElement;
  selectedIcon?: ReactElement;
  'aria-label'?: string;
}

const ICON_BUTTON_VARIANTS: readonly string[] = ['filled', 'tonal', 'outlined'];

/** The icon button variant a group's `buttonVariant` implies, if it exists for icon buttons. */
function iconVariantOf(variant: ButtonVariant | undefined): IconButtonVariant | undefined {
  return variant && ICON_BUTTON_VARIANTS.includes(variant)
    ? (variant as IconButtonVariant)
    : undefined;
}

type Position = NonNullable<ButtonContextValue['connected']>;

function positionOf(index: number, count: number): Position | undefined {
  if (count < 2) return undefined;
  if (index === 0) return 'leading';
  if (index === count - 1) return 'trailing';
  return 'middle';
}

/** The group's ref, also reporting its element to `DomDirectionLocale`. */
function useGroupRef(ref: Ref<HTMLDivElement> | undefined, directionRef: RefCallback<HTMLElement>) {
  // Arrow keys follow the laid-out direction, which React Aria reads from its locale.
  const merged = useMemo(
    () => mergeRefs<HTMLDivElement>(ref, directionRef as RefCallback<HTMLDivElement>),
    [ref, directionRef],
  );
  return useObjectRef<HTMLDivElement>(merged);
}

/**
 * M3 Expressive button group. Shares size, shape, variant and disabled with its `Button`
 * and `IconButton` children. A standard group grows a pressed button while its neighbours
 * shrink; a `connected` group joins the buttons with shared inner corners and, by default,
 * only changes the pressed button's shape (`expandedRatio` opts it into the bump). Tab reaches the group and the arrow keys move
 * between its buttons, wrapping, with Home and End (a `toolbar`). With `selectionMode`, toggle
 * buttons that have a `value` form a single or multiple selection; a single selection is a
 * radio group, whose arrow keys select as they move.
 *
 * Children must be direct `Button` / `IconButton` elements so each gets its position.
 *
 * @example
 * <ButtonGroup variant="connected" selectionMode="single" defaultSelectedKeys={['week']}
 *   aria-label="Calendar view">
 *   <Button toggle value="day">Day</Button>
 *   <Button toggle value="week">Week</Button>
 *   <Button toggle value="month">Month</Button>
 * </ButtonGroup>
 */
export function ButtonGroup(props: ButtonGroupProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <ButtonGroupRoot {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

function ButtonGroupRoot({
  variant = 'standard',
  size,
  shape,
  buttonVariant,
  disabled,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  deselectable = true,
  expandedRatio,
  overflow = false,
  labels,
  className,
  classNames,
  children,
  ref,
  directionRef,
  ...props
}: ButtonGroupProps & { directionRef: RefCallback<HTMLElement> }) {
  const domRef = useGroupRef(ref, directionRef);
  const parent = useContext(ButtonContext);
  const hasSelection = selectionMode !== 'none';

  // React Stately reports a change even when the selection is unchanged (e.g. clicking
  // the only selected button of a group that isn't `deselectable`); only real changes reach callers.
  const currentKeys = useRef<ReadonlySet<Key>>(new Set());
  const handleSelectionChange = (keys: Set<Key>) => {
    const previous = currentKeys.current;
    if (keys.size === previous.size && [...keys].every((key) => previous.has(key))) return;
    onSelectionChange?.(keys as Set<string>);
  };

  const state = useToggleGroupState({
    selectionMode: hasSelection ? selectionMode : 'single',
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange: handleSelectionChange,
    disallowEmptySelection: !deselectable,
    isDisabled: disabled,
  });
  const { groupProps } = useToggleButtonGroup(
    { ...props, isDisabled: disabled, orientation: 'horizontal' },
    state,
    domRef,
  );
  // Without a selection the group is a React Aria toolbar: Tab enters and leaves it as one
  // stop, and the arrow keys move between its buttons.
  const { toolbarProps } = useToolbar({ ...props, orientation: 'horizontal' }, domRef);
  const groupAria = withGroupKeys(
    hasSelection ? groupProps : toolbarProps,
    selectionMode === 'single',
  );

  useLayoutEffect(() => {
    currentKeys.current = state.selectedKeys;
  });

  usePressExpansion(domRef, expandedRatio ?? (variant === 'standard' ? 0.15 : 0));

  const groupSize = size ?? parent.size ?? 'sm';
  const iconButtonVariant = iconVariantOf(buttonVariant);
  const shared = useMemo<ButtonContextValue>(
    () => ({
      variant: buttonVariant ?? parent.variant,
      size: size ?? parent.size,
      shape: shape ?? parent.shape,
      disabled: disabled ?? parent.disabled,
      iconButtonVariant: iconButtonVariant ?? parent.iconButtonVariant,
      density: parent.density,
    }),
    [buttonVariant, iconButtonVariant, size, shape, disabled, parent],
  );

  const items = Children.toArray(children).filter(isValidElement) as ReactElement<ChildProps>[];
  const visible = useOverflow(domRef, overflow, items.length);
  const overflowing = overflow && visible < items.length;

  useGroupWarnings(variant, items, buttonVariant, iconButtonVariant);

  // Connected corners follow the buttons that show, the overflow indicator last.
  const shown = overflowing ? visible + 1 : items.length;
  const contextFor = (index: number): ButtonContextValue =>
    variant === 'connected' ? { ...shared, connected: positionOf(index, shown) } : shared;
  const content = items.map((child, index) => (
    <ButtonContext key={child.key ?? index} value={contextFor(Math.min(index, shown - 1))}>
      {child}
    </ButtonContext>
  ));
  if (overflow) {
    content.push(
      <ButtonContext key="overflow" value={contextFor(shown - 1)}>
        <OverflowMenu
          groupRef={domRef}
          hidden={items.slice(visible)}
          offset={visible}
          label={labels?.more ?? DEFAULT_LABELS.more}
          selectionMode={selectionMode}
          selectedKeys={state.selectedKeys}
          disabled={Boolean(disabled ?? parent.disabled)}
          classNames={classNames}
        />
      </ButtonContext>,
    );
  }

  return (
    <div
      {...mergeProps(props, groupAria)}
      ref={domRef}
      // Public styling hooks for apps, as on Button: the group's variant and the size it spaces
      // its buttons for (its own, an enclosing toolbar's, or `sm`).
      data-variant={variant}
      data-size={groupSize}
      className={cn(
        buttonGroupStyles({ variant, size: groupSize, overflow }),
        classNames?.root,
        className,
      )}
    >
      {hasSelection ? (
        <ToggleGroupStateContext value={state}>{content}</ToggleGroupStateContext>
      ) : (
        content
      )}
    </div>
  );
}

/**
 * The group's arrow keys. React Aria's toolbar keys (kept for Tab, which enters and leaves
 * the group as one stop) are replaced: a toolbar's arrows wrap and Home and End reach its
 * ends (WAI-ARIA APG toolbar), and a single selection is a radio group whose arrows also
 * select (APG radio group, as `RadioGroup` does) and which Tab enters at the selected
 * button. A group nested in a toolbar leaves its keys to the toolbar, as React Aria does.
 */
function withGroupKeys(
  aria: HTMLAttributes<HTMLElement>,
  single: boolean,
): HTMLAttributes<HTMLElement> {
  const ariaKeyDown = aria.onKeyDownCapture;
  if (!ariaKeyDown) return aria;
  return {
    ...aria,
    onKeyDownCapture: (event) => {
      if (event.key === 'Tab') ariaKeyDown(event);
      else if (single) radioGroupKeyDown(event);
      else toolbarKeyDown(event, 'horizontal');
    },
    onFocus: single ? (event) => void focusCheckedRadio(event) : undefined,
    onPointerDownCapture: single ? notePointerDown : undefined,
  };
}

/**
 * Development warnings, once per group, for what the M3 button group guidelines advise
 * against: standard icon buttons and text buttons in a group ("they have no container
 * treatment"), and a connected group with nothing to select ("Avoid using a connected
 * group when none of the buttons can be toggled"). Only the variants the group or the
 * buttons set count: a toolbar's standard default doesn't.
 */
function useGroupWarnings(
  variant: ButtonGroupVariant,
  items: ReactElement<ChildProps>[],
  buttonVariant: ButtonVariant | undefined,
  iconButtonVariant: IconButtonVariant | undefined,
) {
  const containerless = items.some((child) =>
    child.type === IconButton
      ? (child.props.variant ?? iconButtonVariant) === 'standard'
      : child.type === Button && (child.props.variant ?? buttonVariant) === 'text',
  );
  const nothingToSelect =
    variant === 'connected' && items.length > 0 && !items.some((child) => child.props.toggle);
  useWarnOnce(
    containerless,
    '[@windmorph/react] Avoid standard icon buttons and text buttons in a ButtonGroup (M3): they have no container, so the group has nothing to shape.',
  );
  useWarnOnce(
    nothingToSelect,
    '[@windmorph/react] A connected ButtonGroup is for selection (M3): use toggle buttons in it, or a standard group for actions.',
  );
}

interface OverflowMenuProps {
  groupRef: RefObject<HTMLDivElement | null>;
  /** The folded buttons, in order. */
  hidden: ReactElement<ChildProps>[];
  /** The index of the first folded button among the group's children. */
  offset: number;
  label: string;
  selectionMode: ButtonGroupSelectionMode;
  selectedKeys: ReadonlySet<Key>;
  disabled: boolean;
  classNames: ButtonGroupClassNames | undefined;
}

/**
 * The overflow indicator (Compose `ButtonGroupDefaults.OverflowIndicator`: a filled icon
 * button with `more_vert` and a "More options" tooltip, here the group's icon button
 * variant) and its menu. Choosing an item clicks the folded button itself, so its own
 * press handler, link, toggle or group selection runs as if it had been pressed. The menu's
 * code loads once a button folds (see `LazyOverflowMenuList`); the indicator is always
 * rendered, so the group can measure it.
 */
function OverflowMenu({
  groupRef,
  hidden,
  offset,
  label,
  selectionMode,
  selectedKeys,
  disabled,
  classNames,
}: OverflowMenuProps) {
  // Folded standalone toggles keep their state inside them: read it when the menu opens
  // and after each choice.
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  const elementAt = (key: string) =>
    groupRef.current?.children[Number(key)] as HTMLElement | undefined;
  const keyOf = (index: number) => String(offset + index);
  const readPressed = () =>
    setPressed(
      new Set(
        hidden
          .map((_, index) => keyOf(index))
          .filter((key) => elementAt(key)?.getAttribute('aria-pressed') === 'true'),
      ),
    );

  // A choice made with the mouse closed the menu with focus still on its item, which then
  // left with the menu and dropped focus on <body>. Once the menu has closed, focus still in
  // it (or on the page) goes back to the indicator, as after a keyboard choice (2026-10-15).
  const indicator = useRef<HTMLElement | null>(null);
  const keepFocus = () =>
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active.closest('[role="menu"]')) {
        indicator.current?.focus({ preventScroll: true });
      }
    });

  const grouped = selectionMode !== 'none';
  const hasToggles = hidden.some((child) => child.props.toggle);
  const menuSelectionMode = grouped ? selectionMode : hasToggles ? 'multiple' : 'none';
  const selected = hidden
    .map((child, index) => ({ child, key: keyOf(index) }))
    .filter(({ child, key }) =>
      grouped
        ? child.props.value !== undefined && selectedKeys.has(child.props.value)
        : pressed.has(key),
    )
    .map(({ key }) => key);
  const disabledKeys = hidden
    .map((child, index) => ({ child, key: keyOf(index) }))
    .filter(({ child }) => disabled || child.props.disabled)
    .map(({ key }) => key);

  return (
    <MenuTrigger onOpenChange={(open) => (open ? readPressed() : keepFocus())}>
      <IconButton
        icon={<MoreVertIcon />}
        aria-label={label}
        className={classNames?.overflowButton}
        onPressStart={(event) => {
          indicator.current = event.target as HTMLElement;
        }}
      />
      {hidden.length > 0 && (
        <LazyOverflowMenuList
          items={hidden.map((child, index) => ({
            key: keyOf(index),
            ...describe(child, selected.includes(keyOf(index))),
            // Only a toggle (or a button in the group's selection) is checkable; an action
            // stays a plain item even when the menu is selectable.
            checkable: grouped ? child.props.value !== undefined : Boolean(child.props.toggle),
          }))}
          selectionMode={menuSelectionMode}
          selectedKeys={selected}
          disabledKeys={disabledKeys}
          classNames={{ panel: classNames?.overflowMenu }}
          onAction={(key) => {
            elementAt(String(key))?.click();
            // The button updates once this event is handled.
            setTimeout(readPressed);
          }}
        />
      )}
    </MenuTrigger>
  );
}

/** A folded button's menu label and icon. */
function describe(child: ReactElement<ChildProps>, isSelected: boolean) {
  const { props } = child;
  if (child.type === IconButton) {
    return {
      label: props['aria-label'],
      icon: (isSelected && props.selectedIcon) || props.icon,
    };
  }
  return {
    label: props.children,
    icon: (isSelected && props.selectedLeadingIcon) || props.leadingIcon,
  };
}
