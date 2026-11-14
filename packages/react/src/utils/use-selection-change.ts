import { useRef } from 'react';
import type { Key } from 'react-stately';

/**
 * React Stately's toggle group reports a change even when the selection is the same, such as
 * a press on the only selected item of a group that isn't `deselectable`. This passes on only
 * the real changes. Give `onChange` to the group's state, and `track` the state's keys on
 * every render.
 */
export function useSelectionChange(onSelectionChange: ((keys: Set<Key>) => void) | undefined) {
  const current = useRef<ReadonlySet<Key>>(new Set());
  return {
    onChange(keys: Set<Key>) {
      const previous = current.current;
      if (keys.size === previous.size && [...keys].every((key) => previous.has(key))) return;
      onSelectionChange?.(keys);
    },
    track(keys: ReadonlySet<Key>) {
      current.current = keys;
    },
  };
}
