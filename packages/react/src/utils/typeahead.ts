import { useMemo, type RefObject } from 'react';
import { ListKeyboardDelegate, useCollator } from 'react-aria';
import type { Collection, DisabledBehavior, Key, Node } from 'react-stately';

/** One character typed once or several times over ("p", "ppp"). */
function repeatedCharacter(search: string): string | null {
  const [first, ...rest] = Array.from(search);
  return first !== undefined && rest.every((character) => character === first) ? first : null;
}

/**
 * A list keyboard delegate whose typeahead follows the M3 menu keyboard table: "Letters —
 * Focus moves to the next menu item starting with letter". React Aria's search starts *at*
 * the focused item, so pressing a letter again stayed put. A single character (or the same
 * one repeated, as WAI-ARIA's typeahead cycles) now searches from the item after the focused
 * one (or after `currentKey`, a closed `Select`'s chosen option, when nothing has focus),
 * wrapping to the top. A longer search still starts at the focused item, so typing on
 * refines the match.
 */
export class TypeaheadKeyboardDelegate<T> extends ListKeyboardDelegate<T> {
  private readonly currentKey: Key | null;

  constructor(
    options: ConstructorParameters<typeof ListKeyboardDelegate<T>>[0],
    currentKey: Key | null = null,
  ) {
    super(options);
    this.currentKey = currentKey;
  }

  override getKeyForSearch(search: string, fromKey?: Key | null): Key | null {
    const character = repeatedCharacter(search);
    if (character === null) return super.getKeyForSearch(search, fromKey ?? undefined);
    const start = fromKey ?? this.currentKey;
    const next = start == null ? null : this.getNextKey(start);
    return (
      (next == null ? null : super.getKeyForSearch(character, next)) ??
      super.getKeyForSearch(character)
    );
  }
}

/** What {@link useTypeaheadDelegate} reads from a list or tree state. */
interface TypeaheadState<T> {
  collection: Collection<Node<T>>;
  disabledKeys: Set<Key>;
  selectionManager: { disabledBehavior: DisabledBehavior };
}

/**
 * The {@link TypeaheadKeyboardDelegate} for a collection, built as React Aria builds its
 * default list delegate (a base-sensitivity search collator, the state's disabled keys and
 * behaviour), for `useListBox`, `useMenu` or `useSelect`'s `keyboardDelegate`.
 * `disabledBehavior` overrides the state's (a closed `Select`'s typeahead skips disabled
 * options even when its list lets them take focus); `currentKey` is where a search starts
 * when nothing has focus.
 */
export function useTypeaheadDelegate<T>(
  state: TypeaheadState<T>,
  ref: RefObject<HTMLElement | null>,
  {
    disabledBehavior = state.selectionManager.disabledBehavior,
    currentKey = null,
  }: { disabledBehavior?: DisabledBehavior; currentKey?: Key | null } = {},
): TypeaheadKeyboardDelegate<T> {
  const collator = useCollator({ usage: 'search', sensitivity: 'base' });
  const { collection, disabledKeys } = state;
  return useMemo(
    () =>
      new TypeaheadKeyboardDelegate<T>(
        { collection, disabledKeys, disabledBehavior, ref, collator },
        currentKey,
      ),
    [collection, disabledKeys, disabledBehavior, ref, collator, currentKey],
  );
}
