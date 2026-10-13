/*
 * A polite announcement for content that isn't in a live region of its own (a snackbar
 * rendered without its host). Screen readers announce changes to a live region only once
 * they've registered it, and often skip content that arrives together with the region, so
 * one region is created on first use, kept for the page's life, and written to after
 * `LIVE_REGION_DELAY`.
 */

/** How long a new live region is given to be registered before content goes in. */
export const LIVE_REGION_DELAY = 100;

/** How long an announcement stays in the region; long enough to be read, then removed. */
const CLEAR_AFTER = 7000;

let region: { element: HTMLElement; readyAt: number } | null = null;

function liveRegion() {
  if (region?.element.isConnected) return region;
  const element = document.createElement('div');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-relevant', 'additions');
  element.dataset.windmorphAnnouncer = '';
  // Visually hidden, as Tailwind's `sr-only` (this element lives outside the React tree).
  Object.assign(element.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });
  document.body.append(element);
  region = { element, readyAt: Date.now() + LIVE_REGION_DELAY };
  return region;
}

/** Announces `message` politely (queued after what the screen reader is saying). */
export function announcePolite(message: string): void {
  const { element, readyAt } = liveRegion();
  const add = () => {
    const node = document.createElement('div');
    node.textContent = message;
    element.append(node);
    setTimeout(() => node.remove(), CLEAR_AFTER);
  };
  const wait = readyAt - Date.now();
  if (wait > 0) setTimeout(add, wait);
  else add();
}
