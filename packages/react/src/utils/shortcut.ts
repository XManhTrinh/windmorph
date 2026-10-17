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
