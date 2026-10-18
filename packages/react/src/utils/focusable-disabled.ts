/**
 * Disabled items stay focusable but can't be chosen, as WAI-ARIA APG's "Focusability of disabled
 * controls" asks for options, menu items and tabs, so screen reader users find them (M3 menus:
 * "Disabled menu items can receive focus but aren't selectable"). React Stately reads it from
 * the state options, though not every state hook's types list it.
 */
export const FOCUSABLE_DISABLED_OPTIONS = { disabledBehavior: 'selection' as const };
