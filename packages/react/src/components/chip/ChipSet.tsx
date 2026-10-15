'use client';

import {
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useObjectRef } from 'react-aria';
import { useToggleGroupState, type Key } from 'react-stately';
import { ToggleGroupStateContext } from '../../primitives/ButtonBase';
import { cn } from '../../utils/cn';
import { focusCheckedRadio, radioGroupKeyDown } from '../../utils/composite-keys';
import { chipSetStyles, type ChipSetLayout } from './chip-styles';

export interface ChipSetClassNames {
  /** The set's container, merged with `className`. */
  root?: string;
}

type Naming =
  | {
      /** Accessible name for the set of chips. Required unless `aria-labelledby` is set. */
      'aria-label': string;
    }
  | {
      /** The id of the element that names the set. Required unless `aria-label` is set. */
      'aria-labelledby': string;
    };

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
  /** Called with the selected chips' values when the selection changes. */
  onSelectionChange?: (keys: Set<Key>) => void;
  /** Keeps at least one chip selected. @default false */
  disallowEmptySelection?: boolean;
  /** Disables every chip that takes part in the selection. @default false */
  disabled?: boolean;
  /**
   * `wrap` onto new rows, or one row that `scroll`s sideways (M3 suggests scrolling past
   * two rows). @default "wrap"
   */
  layout?: ChipSetLayout;
  /** Classes for each part, by slot. */
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
 * back returns to the chip that had focus. A single-selection set is a radio group (WAI-ARIA
 * APG): the arrow keys, Home and End select the chip they move to, wrapping at the ends,
 * and Tab enters at the selected chip.
 */
function useChipSetKeyboard(single: boolean) {
  const lastFocused = useRef<HTMLElement | null>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (single && radioGroupKeyDown(event)) return;
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
    if (single && focusCheckedRadio(event)) return;
    if (target && target !== event.target && event.currentTarget.contains(target)) target.focus();
  };

  // A pointer press focuses the chip it lands on, never the one left with Tab.
  const onPointerDown = () => {
    lastFocused.current = null;
  };

  return { onKeyDown, onFocus, onPointerDown };
}

/**
 * Keeps focus in the set when the focused chip goes away, e.g. after Backspace or Delete
 * removes it (WCAG 2.4.3): focus moves to the next stop, or the previous one at the end,
 * or the set itself once it's empty. The stops are read whenever focus enters a stop or a
 * key is pressed, so the removed one's neighbours are known after it has left the DOM.
 */
function useFocusAfterRemoval(rootRef: { current: HTMLDivElement | null }) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let focused: HTMLElement | null = null;
    let stops: HTMLElement[] = [];
    const remember = () => {
      const active = root.ownerDocument.activeElement;
      stops = focusables(root);
      focused = active instanceof HTMLElement && stops.includes(active) ? active : null;
    };
    const forget = (event: globalThis.FocusEvent) => {
      // Focus moving elsewhere (not a removal, which leaves nothing focused) ends the watch.
      if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) {
        focused = null;
      }
    };
    const restore = () => {
      if (!focused || focused.isConnected) return;
      const active = root.ownerDocument.activeElement;
      const lost = focused;
      focused = null;
      if (active && active !== root.ownerDocument.body) return;
      const index = stops.indexOf(lost);
      const next =
        stops.slice(index + 1).find((stop) => stop.isConnected) ??
        stops
          .slice(0, index)
          .reverse()
          .find((stop) => stop.isConnected);
      (next ?? root).focus();
    };
    const observer = new MutationObserver(restore);
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener('focusin', remember);
    root.addEventListener('keydown', remember, true);
    root.addEventListener('focusout', forget);
    return () => {
      observer.disconnect();
      root.removeEventListener('focusin', remember);
      root.removeEventListener('keydown', remember, true);
      root.removeEventListener('focusout', forget);
    };
  }, [rootRef]);
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
  const keyboard = useChipSetKeyboard(selectionMode === 'single');
  const rootRef = useObjectRef(ref);
  useFocusAfterRemoval(rootRef);
  return (
    <div
      role={selectionMode === 'single' ? 'radiogroup' : 'group'}
      // Focusable from script only: it takes focus when its last chip is removed.
      tabIndex={-1}
      {...rest}
      ref={rootRef}
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
