'use client';

import {
  useRef,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useToggleGroupState, type Key } from 'react-stately';
import { ToggleGroupStateContext } from '../../primitives/ButtonBase';
import { cn } from '../../utils/cn';
import { chipSetStyles, type ChipSetLayout } from './chip-styles';

export interface ChipSetClassNames {
  root?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface ChipSetOwnProps {
  /** The chips. Filter chips take part in the set's selection with a `value`. */
  children: ReactNode;
  /**
   * Filter chip selection: `single` (a radio group: selecting a chip clears the others)
   * or `multiple`. With `none`, each chip keeps its own state. @default "none"
   */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** The selected chips' values (controlled). */
  selectedKeys?: Iterable<Key>;
  /** The chips selected at first (uncontrolled). */
  defaultSelectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  /** Keeps at least one chip selected. */
  disallowEmptySelection?: boolean;
  /** Disables every chip that takes part in the selection. */
  disabled?: boolean;
  /**
   * `wrap` onto new rows, or one row that `scroll`s sideways (M3 suggests scrolling past
   * two rows). @default "wrap"
   */
  layout?: ChipSetLayout;
  classNames?: ChipSetClassNames;
}

export type ChipSetProps = ChipSetOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof ChipSetOwnProps | 'aria-label' | 'aria-labelledby'>;

const FOCUSABLE =
  'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), [tabindex="0"]';

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) => !element.closest('[hidden], [inert]'),
  );
}

/**
 * Keyboard use of a chip set (M3 chips, keyboard navigation): the set is one Tab stop,
 * arrow keys move between its chips (and a chip's remove button), Home and End go to the
 * first and last. Left and right follow the set's direction. Leaving with Tab and coming
 * back returns to the chip that had focus.
 */
function useChipSetKeyboard() {
  const lastFocused = useRef<HTMLElement | null>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const root = event.currentTarget;
    const items = focusables(root);
    const current = items.indexOf(event.target as HTMLElement);
    if (current < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = getComputedStyle(root).direction === 'rtl';
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = current + 1;
        break;
      case 'ArrowUp':
        next = current - 1;
        break;
      case 'ArrowRight':
        next = rtl ? current - 1 : current + 1;
        break;
      case 'ArrowLeft':
        next = rtl ? current + 1 : current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case 'Tab':
        // Leave the set: move to its first or last stop, and let the browser go on from there.
        lastFocused.current = items[current] ?? null;
        (event.shiftKey ? items[0] : items.at(-1))?.focus();
        return;
      default:
        return;
    }
    event.preventDefault();
    items[Math.max(0, Math.min(items.length - 1, next))]?.focus();
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const from = event.relatedTarget as Node | null;
    if (from && event.currentTarget.contains(from)) return;
    const target = lastFocused.current;
    lastFocused.current = null;
    if (target && target !== event.target && event.currentTarget.contains(target)) target.focus();
  };

  // A pointer press focuses the chip it lands on, never the one left with Tab.
  const onPointerDown = () => {
    lastFocused.current = null;
  };

  return { onKeyDown, onFocus, onPointerDown };
}

/**
 * M3 chip set: a labelled group of chips, 8px apart, that wraps or scrolls sideways. It is
 * one Tab stop, and arrow keys move between its chips. With `selectionMode`, its filter
 * chips (each with a `value`) share one selection.
 *
 * @example
 * <ChipSet aria-label="Diet" selectionMode="multiple" defaultSelectedKeys={['vegan']}>
 *   <FilterChip value="vegan">Vegan</FilterChip>
 *   <FilterChip value="gluten-free">Gluten-free</FilterChip>
 * </ChipSet>
 */
export function ChipSet({
  children,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disallowEmptySelection,
  disabled,
  layout,
  classNames,
  className,
  ref,
  onKeyDown,
  onFocus,
  onPointerDown,
  ...rest
}: ChipSetProps) {
  const state = useToggleGroupState({
    selectionMode: selectionMode === 'single' ? 'single' : 'multiple',
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    disallowEmptySelection,
    isDisabled: disabled,
  });
  const keyboard = useChipSetKeyboard();
  return (
    <div
      role={selectionMode === 'single' ? 'radiogroup' : 'group'}
      {...rest}
      ref={ref}
      data-layout={layout ?? 'wrap'}
      aria-disabled={disabled || undefined}
      onKeyDown={(event) => {
        keyboard.onKeyDown(event);
        onKeyDown?.(event);
      }}
      onFocus={(event) => {
        keyboard.onFocus(event);
        onFocus?.(event);
      }}
      onPointerDown={(event) => {
        keyboard.onPointerDown();
        onPointerDown?.(event);
      }}
      className={chipSetStyles({ layout }).root({ class: cn(classNames?.root, className) })}
    >
      <ToggleGroupStateContext value={selectionMode === 'none' ? null : state}>
        {children}
      </ToggleGroupStateContext>
    </div>
  );
}
