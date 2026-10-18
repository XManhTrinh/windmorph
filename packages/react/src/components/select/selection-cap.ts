import type { Key } from 'react-stately';
import { useControlledState } from 'react-stately/useControlledState';

interface SelectionCapOptions {
  multiple: boolean;
  maxSelections: number | undefined;
  value: unknown;
  defaultValue: unknown;
  onChange: ((value: never) => void) | undefined;
}

export interface SelectionCap {
  /** Value props for the React Stately state: the capped selection when a cap applies. */
  valueProps: Record<string, unknown>;
  /** Whether an option can't be chosen because the cap is reached. */
  isBlocked: (key: Key) => boolean;
}

/**
 * `maxSelections` for multiple selection: owns the chosen keys (controlled or not), turns
 * away a change that would pass the cap (a click or the keyboard's Enter alike), and tells
 * the list which options to show as disabled while the cap is reached.
 */
export function useSelectionCap({
  multiple,
  maxSelections,
  value,
  defaultValue,
  onChange,
}: SelectionCapOptions): SelectionCap {
  const capped = multiple && maxSelections !== undefined;
  const [keys, setKeys] = useControlledState<readonly Key[], Key[]>(
    value as readonly Key[] | undefined,
    (defaultValue as readonly Key[] | undefined) ?? [],
    onChange as ((value: Key[]) => void) | undefined,
  );
  if (!capped) return { valueProps: {}, isBlocked: () => false };

  const atCap = keys.length >= maxSelections;
  return {
    valueProps: {
      value: keys,
      defaultValue: (defaultValue as readonly Key[] | undefined) ?? [],
      onChange: (next: Key[]) => {
        if (next.length <= maxSelections) setKeys(next);
      },
    },
    isBlocked: (key) => atCap && !keys.includes(key),
  };
}
