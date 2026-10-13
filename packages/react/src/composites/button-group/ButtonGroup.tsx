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
} from 'react';
import { mergeProps, useObjectRef, useToggleButtonGroup } from 'react-aria';
import { useToggleGroupState } from 'react-stately';
import type { ButtonShape, ButtonSize, ButtonVariant } from '../../components/button/button-styles';
import {
  ButtonContext,
  ToggleGroupStateContext,
  type ButtonContextValue,
} from '../../components/button/ButtonContext';
import { cn } from '../../utils/cn';
import { tv, type VariantProps } from '../../utils/tv';
import { usePressExpansion } from './use-press-expansion';

/** Variant definitions for {@link ButtonGroup}. */
export const buttonGroupStyles = tv({
  base: 'inline-flex items-center',
  variants: {
    variant: {
      // Compose ButtonGroupSmallTokens / ConnectedButtonGroupSmallTokens (one value for all sizes).
      standard: 'gap-[12px]',
      connected: 'gap-[2px]',
    },
  },
  defaultVariants: { variant: 'standard' },
});

export type ButtonGroupVariant = NonNullable<VariantProps<typeof buttonGroupStyles>['variant']>;
export type ButtonGroupSelectionMode = 'none' | 'single' | 'multiple';

export interface ButtonGroupProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'defaultValue'
> {
  /**
   * `standard` spaces buttons 12px apart; `connected` joins them 2px apart with shared
   * inner corners (the M3 Expressive replacement for segmented buttons).
   * @default "standard"
   */
  variant?: ButtonGroupVariant;
  /** Size shared by every button and icon button in the group. */
  size?: ButtonSize;
  /** Shape shared by the buttons of a standard group. Connected groups set their own corners. */
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
   * How much a pressed button grows, as a fraction of its width; its neighbours shrink
   * by the same amount. `0` turns the interaction off. @default 0.15
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

/**
 * M3 Expressive button group. Shares size, shape, variant and disabled with its `Button`
 * and `IconButton` children, grows a pressed button while its neighbours shrink, and in
 * the `connected` variant joins the buttons with shared inner corners. With
 * `selectionMode`, toggle buttons that have a `value` form a single or multiple selection.
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
export function ButtonGroup({
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
  ...props
}: ButtonGroupProps) {
  const domRef = useObjectRef(ref);
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

  useLayoutEffect(() => {
    currentKeys.current = state.selectedKeys;
  });

  usePressExpansion(domRef, expandedRatio);

  const shared = useMemo<ButtonContextValue>(
    () => ({
      variant: buttonVariant ?? parent.variant,
      size: size ?? parent.size,
      shape: variant === 'standard' ? (shape ?? parent.shape) : undefined,
      disabled: disabled ?? parent.disabled,
    }),
    [buttonVariant, size, shape, disabled, variant, parent],
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
      {...(hasSelection ? mergeProps(props, groupProps) : { role: 'group', ...props })}
      ref={domRef}
      data-variant={variant}
      className={cn(buttonGroupStyles({ variant }), className)}
    >
      {hasSelection ? (
        <ToggleGroupStateContext value={state}>{content}</ToggleGroupStateContext>
      ) : (
        content
      )}
    </div>
  );
}
