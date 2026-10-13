const TABBABLE = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/**
 * The first element inside `root` that Tab would reach: focusable, not disabled, not
 * `tabindex="-1"`, and not in an `inert` or `hidden` subtree. Null when there's none.
 * (React Aria's tree walker isn't part of its public API.)
 */
export function firstTabbable(root: Element): HTMLElement | null {
  for (const el of root.querySelectorAll<HTMLElement>(TABBABLE)) {
    if (el.tabIndex < 0 || el.matches(':disabled') || el.closest('[inert], [hidden]')) continue;
    return el;
  }
  return null;
}

/** A key combination such as `"Alt+G"` or `"Control+Shift+K"`, matched against an event. */
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split('+').map((part) => part.trim().toLowerCase());
  const key = parts.pop();
  if (!key) return false;
  const wants = (name: string) => parts.includes(name);
  if (event.altKey !== wants('alt')) return false;
  if (event.ctrlKey !== (wants('control') || wants('ctrl'))) return false;
  if (event.shiftKey !== wants('shift')) return false;
  if (event.metaKey !== (wants('meta') || wants('cmd'))) return false;
  // Alt changes the character on some layouts (Alt+G types "©" on a Mac), so letters and
  // digits match the physical key too.
  if (event.key.toLowerCase() === key) return true;
  if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return event.code === `Digit${key}`;
  return false;
}
