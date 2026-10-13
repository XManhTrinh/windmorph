'use client';

import {
  Children,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentPropsWithRef,
  type Key,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react';
import { mergeProps, mergeRefs, useObjectRef, useToggleButtonGroup, useToolbar } from 'react-aria';
import { useToggleGroupState } from 'react-stately';
import type { ButtonShape, ButtonSize, ButtonVariant } from '../../components/button/button-styles';
import {
  ButtonContext,
  ToggleGroupStateContext,
  type ButtonContextValue,
} from '../../components/button/ButtonContext';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { cn } from '../../utils/cn';
import { tv, type VariantProps } from '../../utils/tv';
import { usePressExpansion } from './use-press-expansion';

/**
 * Variant definitions for {@link ButtonGroup}, from the M3 Expressive button group specs
 * (2026-10-13). Standard groups space their buttons 18 / 12 / 8 / 8 / 8px apart (XS–XL), so
 * the XS and S buttons' 48px targets don't overlap. Connected groups are 2px apart at every
 * size, and span their container with the buttons sharing the extra width ("The connected
 * button group should span the width of the page or surface it's placed on"); a consumer
 * `w-fit` (or a `max-w-*`) narrows it.
 */
export const buttonGroupStyles = tv({
  base: 'items-center',
  variants: {
    variant: {
      standard: 'inline-flex',
      connected: 'flex w-full gap-[2px] *:grow',
    },
    size: { xs: '', sm: '', md: '', lg: '', xl: '' },
  },
  compoundVariants: [
    { variant: 'standard', size: 'xs', class: 'gap-[18px]' },
    { variant: 'standard', size: 'sm', class: 'gap-[12px]' },
    { variant: 'standard', size: ['md', 'lg', 'xl'], class: 'gap-[8px]' },
  ],
  defaultVariants: { variant: 'standard', size: 'sm' },
});

export type ButtonGroupVariant = NonNullable<VariantProps<typeof buttonGroupStyles>['variant']>;
export type ButtonGroupSelectionMode = 'none' | 'single' | 'multiple';

export interface ButtonGroupProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'defaultValue'
> {
  /**
   * `standard` spaces the buttons apart (18 / 12 / 8px by size) and grows a pressed button
   * into its neighbours' space; `connected` joins them 2px apart with shared inner corners
   * across the container's width (the M3 Expressive replacement for segmented buttons).
   * @default "standard"
   */
  variant?: ButtonGroupVariant;
  /** Size shared by every button and icon button in the group; it also sets the spacing. */
  size?: ButtonSize;
  /**
   * Shape shared by the buttons. A `square` connected group gives its outer corners the
   * size of its inner ones (4 / 8 / 8 / 16 / 20px).
   */
  shape?: ButtonShape;
  /** Variant shared by every `Button` in the group (icon buttons keep their own). */
  buttonVariant?: ButtonVariant;
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
  onSelectionChange?: (keys: Set<string>) => void;
  /** Prevents deselecting the last selected button. */
  disallowEmptySelection?: boolean;
  /**
   * How much a pressed button in a standard group grows, as a fraction of its width; its
   * neighbours shrink by the same amount. `0` turns the interaction off. Connected groups
   * never do this: only the pressed button's shape changes. @default 0.15
   */
  expandedRatio?: number;
  children?: ReactNode;
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
 * shrink; a `connected` group joins the buttons with shared inner corners and only
 * changes the pressed button's shape. Tab reaches the group and the arrow keys move
 * between its buttons (a `toolbar`). With `selectionMode`, toggle buttons that have a
 * `value` form a single or multiple selection.
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
  disallowEmptySelection,
  expandedRatio = 0.15,
  className,
  children,
  ref,
  directionRef,
  ...props
}: ButtonGroupProps & { directionRef: RefCallback<HTMLElement> }) {
  const domRef = useGroupRef(ref, directionRef);
  const parent = useContext(ButtonContext);
  const hasSelection = selectionMode !== 'none';

  // React Stately reports a change even when the selection is unchanged (e.g. clicking
  // the only selected button with disallowEmptySelection); only real changes reach callers.
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
    disallowEmptySelection,
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

  useLayoutEffect(() => {
    currentKeys.current = state.selectedKeys;
  });

  usePressExpansion(domRef, variant === 'standard' ? expandedRatio : 0);

  const shared = useMemo<ButtonContextValue>(
    () => ({
      variant: buttonVariant ?? parent.variant,
      size: size ?? parent.size,
      shape: shape ?? parent.shape,
      disabled: disabled ?? parent.disabled,
    }),
    [buttonVariant, size, shape, disabled, parent],
  );

  const items = Children.toArray(children).filter(isValidElement);
  const content = items.map((child, index) => (
    <ButtonContext
      key={child.key ?? index}
      value={
        variant === 'connected' ? { ...shared, connected: positionOf(index, items.length) } : shared
      }
    >
      {child}
    </ButtonContext>
  ));

  return (
    <div
      {...mergeProps(props, hasSelection ? groupProps : toolbarProps)}
      ref={domRef}
      data-variant={variant}
      className={cn(buttonGroupStyles({ variant, size: size ?? parent.size ?? 'sm' }), className)}
    >
      {hasSelection ? (
        <ToggleGroupStateContext value={state}>{content}</ToggleGroupStateContext>
      ) : (
        content
      )}
    </div>
  );
}
