import { expect, test } from '@playwright/test';
import { componentStoryIds } from './catalog-stories';
import { FORCED_COLORS_EXCEPTIONS } from './forced-colors';
import { openStory } from './story';

/*
 * Forced-colours guard (2026-10-15). Windows high contrast repaints every background as
 * `Canvas` and drops shadows, so a component drawn only with a fill or an elevation vanishes
 * into the page, and a selection shown only by a fill disappears. The re-audit found it in
 * buttons, FABs, chips, sliders, menus, dialogs, sheets and pickers. Under
 * `emulateMedia({ forcedColors: 'active' })`, every component story must keep:
 *
 * - a visible boundary on each component root (`[data-tokens]`): a border, outline or
 *   background that isn't `Canvas`, on the root, a part inside it (a checkbox's box, a
 *   field's line, a pseudo-element), a progress indicator's strokes, or an enclosing
 *   component's root (a menu item inside a menu's outline). Components M3 draws without a
 *   container are listed in `FORCED_COLORS_EXCEPTIONS` with a reason;
 * - a selected state (`aria-selected`, `aria-checked`, `aria-pressed`, `aria-current`, a
 *   checked input) that looks different from an unselected peer of the same kind.
 *
 * One test per story, so the suite shards freely.
 */

interface Findings {
  edgeless: { key: string; name: string }[];
  undistinguished: string[];
}

/** Reads what forced colours leave of the story's components (runs in the page). */
function inspect(): Findings {
  const probe = document.createElement('span');
  probe.style.cssText = 'forced-color-adjust:none;color:Canvas';
  document.body.append(probe);
  const canvas = getComputedStyle(probe).color.replace(/\s/g, '');
  probe.remove();

  const alpha = (color: string) => {
    if (color === 'transparent') return 0;
    const match = color.match(/\/\s*([\d.]+%?)\s*\)|rgba\([^)]*,\s*([\d.]+)\s*\)/);
    const raw = match?.[1] ?? match?.[2];
    if (raw === undefined) return 1;
    return raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw);
  };
  /** `canvas` for colours that read as the page (Canvas at any alpha, or transparent). */
  const normal = (color: string) => {
    const opaque = color
      .replace(/\s/g, '')
      .replace(/^rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)$/, 'rgb($1,$2,$3)');
    return alpha(color) <= 0.05 || opaque === canvas ? 'canvas' : color.replace(/\s/g, '');
  };
  const shows = (color: string) => normal(color) !== 'canvas';

  const boxEdge = (element: Element, pseudo: string | null) => {
    const style = getComputedStyle(element, pseudo);
    if (pseudo && (style.content === 'none' || style.content === 'normal')) return false;
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
      if (
        parseFloat(style[`border${side}Width`]) > 0 &&
        !['none', 'hidden'].includes(style[`border${side}Style`]) &&
        shows(style[`border${side}Color`])
      ) {
        return true;
      }
    }
    if (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) {
      if (shows(style.outlineColor)) return true;
    }
    return shows(style.backgroundColor);
  };
  /** Whether the element draws an edge of its own: its box, a pseudo-element or a stroke. */
  const edge = (element: Element) => {
    if ([null, '::before', '::after'].some((pseudo) => boxEdge(element, pseudo))) return true;
    // A progress indicator is drawn with SVG strokes, not a container.
    if (element instanceof SVGGeometryElement && element.closest('[role=progressbar]')) {
      const style = getComputedStyle(element);
      return (
        (style.stroke !== 'none' && shows(style.stroke) && parseFloat(style.strokeWidth) > 0) ||
        (style.fill !== 'none' && shows(style.fill))
      );
    }
    return false;
  };
  const painted = (element: Element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return (
      (rect.width >= 1 || rect.height >= 1) &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity) > 0
    );
  };
  const storybookChrome =
    '[inert], [aria-hidden=true], #storybook-docs, .sb-errordisplay, .sb-nopreview, .sb-preparing-story, .sb-preparing-docs';
  const listed = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.width >= 4 && rect.height >= 4 && painted(element) && !element.closest(storybookChrome)
    );
  };
  const keyOf = (root: HTMLElement) => {
    // The component's own set comes first; an app's sets may follow it.
    const set = root.dataset.tokens!.split(' ')[0];
    const part = root.dataset.variant ?? root.dataset.layout;
    return part ? `${set}/${part}` : set;
  };
  const nameOf = (element: Element) =>
    (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 30);
  const enclosing = (element: Element) =>
    element.parentElement?.closest<HTMLElement>('[data-tokens^="md-comp-"]') ?? null;

  const edgeless: Findings['edgeless'] = [];
  for (const root of document.querySelectorAll<HTMLElement>('[data-tokens^="md-comp-"]')) {
    if (!listed(root)) continue;
    let found =
      edge(root) || [...root.querySelectorAll('*')].some((part) => painted(part) && edge(part));
    for (let outer = enclosing(root); outer && !found; outer = enclosing(outer))
      found = edge(outer);
    if (!found) edgeless.push({ key: keyOf(root), name: nameOf(root) });
  }

  /** The look of an element and its parts, colours read as forced colours paint them. */
  const look = (element: Element) =>
    [element, ...element.querySelectorAll('*')]
      .filter((part) => part.getBoundingClientRect().width > 0)
      .map((part) => {
        const style = getComputedStyle(part);
        const border =
          parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== 'none'
            ? normal(style.borderTopColor)
            : 'none';
        const outline =
          style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
            ? normal(style.outlineColor)
            : 'none';
        return [
          part.tagName,
          normal(style.backgroundColor),
          border,
          outline,
          normal(style.color),
          style.opacity,
          style.visibility,
          style.display,
          style.fill === 'none' ? 'none' : normal(style.fill),
          style.stroke === 'none' ? 'none' : normal(style.stroke),
          style.textDecorationLine,
        ].join(',');
      })
      .join('|');
  const SELECTED =
    '[aria-selected=true], [aria-checked=true], [aria-pressed=true], [aria-current]:not([aria-current=false]), input:checked';
  const DISABLED = ':disabled, [aria-disabled=true]';
  const shownBy = (element: Element) =>
    element instanceof HTMLInputElement
      ? (element.closest('label') ?? element.parentElement!)
      : element;
  const kind = (element: Element) =>
    `${element.tagName}:${element.getAttribute('role') ?? ''}:${element.getAttribute('type') ?? ''}`;

  const undistinguished: string[] = [];
  for (const selected of document.querySelectorAll(SELECTED)) {
    if (selected.matches(DISABLED) || !listed(shownBy(selected))) continue;
    const group =
      selected.parentElement?.closest(
        '[role=radiogroup], [role=tablist], [role=listbox], [role=grid], [role=group], [role=menu], [role=toolbar], nav, [data-tokens]',
      ) ?? document.body;
    const peer = [...group.querySelectorAll(selected.tagName)].find(
      (other) =>
        other !== selected &&
        kind(other) === kind(selected) &&
        !other.matches(SELECTED) &&
        !other.matches(DISABLED) &&
        listed(shownBy(other)),
    );
    if (peer && look(shownBy(selected)) === look(shownBy(peer))) {
      undistinguished.push(
        `${kind(selected)} "${nameOf(shownBy(selected))}" looks like "${nameOf(shownBy(peer))}"`,
      );
    }
  }
  return { edgeless, undistinguished };
}

test.describe('Forced-colours guard', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const id of componentStoryIds) {
    test(id, async ({ page }) => {
      test.setTimeout(20_000);
      await openStory(page, id);
      // Overlays open by default reach their resting state.
      await page.waitForTimeout(400);
      await page.emulateMedia({ forcedColors: 'active' });
      // Colours transition into their forced values.
      await page.waitForTimeout(500);
      const { edgeless, undistinguished } = await page.evaluate(inspect);
      const excused = (key: string) =>
        FORCED_COLORS_EXCEPTIONS.some(
          (exception) =>
            (exception.story === '*' || exception.story === id) &&
            key.startsWith(exception.component),
        );
      const missing = edgeless.filter(({ key }) => !excused(key));
      expect(missing, 'components with no visible boundary in forced colours').toEqual([]);
      expect(undistinguished, 'selected states forced colours hide').toEqual([]);
    });
  }
});
