import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './story';

/*
 * Computed-style snapshot: the gate for component tokens. Every story's painted styles, in
 * two themes × light and dark × three contrast levels at rest, plus hover, focus and press
 * in light and dark, must match the baseline recorded before any token work exactly. Pixel
 * screenshots miss a one-percent colour shift; this doesn't.
 *
 * Theme dimensions are switched in place on every `[data-theme]` element (the story's
 * ThemeScope and any open overlay's wrapper), and states are forced by setting
 * `data-hovered`, `data-focus-visible` or `data-pressed` on every element whose classes react
 * to them, with transitions and animations off, so one load reads every combination.
 *
 * `RECORD_COMPUTED_STYLES=1 playwright test computed-styles` records the baseline. Record it
 * only on a commit whose styles are known good; a token change must never re-record it.
 */

const BASELINE_DIR = new URL('./__computed-styles__/', import.meta.url);
const RECORD = process.env.RECORD_COMPUTED_STYLES === '1';

/** Stories that only exist to probe component tokens (they set tokens on purpose). */
const SKIP_TAG = 'tokens-probe';

const PROPERTIES = [
  'background-color',
  'background-image',
  'color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'box-shadow',
  'outline-color',
  'fill',
  'stroke',
] as const;

interface Combo {
  name: string;
  theme: string;
  mode: 'light' | 'dark';
  contrast: 'standard' | 'medium' | 'high';
  state?: 'hovered' | 'focus-visible' | 'pressed';
}

const COMBOS: Combo[] = [
  ...['baseline', 'forest'].flatMap((theme) =>
    (['light', 'dark'] as const).flatMap((mode) =>
      (['standard', 'medium', 'high'] as const).map((contrast) => ({
        name: `${theme}-${mode}-${contrast}`,
        theme,
        mode,
        contrast,
      })),
    ),
  ),
  ...(['hovered', 'focus-visible', 'pressed'] as const).flatMap((state) =>
    (['light', 'dark'] as const).map((mode) => ({
      name: `baseline-${mode}-standard-${state}`,
      theme: 'baseline',
      mode,
      contrast: 'standard' as const,
      state,
    })),
  ),
];

/**
 * A story's styles, with every repeat stored once: `elements` names each element by its
 * child-index path from `body`; `values` holds each distinct property value; `rows` holds
 * each distinct element style as indexes into `values`, one per property, comma-joined; and
 * each combination lists, per element, an index into `rows`.
 */
interface Snapshot {
  properties: readonly string[];
  elements: string[];
  values: string[];
  rows: string[];
  combos: Record<string, number[]>;
}

/** The index of `item` in `list`, appending it the first time. */
function intern(list: string[], index: Map<string, number>, item: string): number {
  let at = index.get(item);
  if (at === undefined) {
    at = list.length;
    list.push(item);
    index.set(item, at);
  }
  return at;
}

/** One element's style in a snapshot: the property values, in `properties` order. */
function styleOf(snapshot: Snapshot, row: number | undefined): string[] {
  if (row === undefined) return [];
  return snapshot.rows[row]!.split(',').map((value) => snapshot.values[Number(value)]!);
}

interface StoryEntry {
  id: string;
  type: string;
  tags?: string[];
}

function storyIds(): string[] {
  // The static build's index, which the suite's web server serves.
  const index = JSON.parse(
    readFileSync(new URL('../storybook-static/index.json', import.meta.url), 'utf8'),
  ) as { entries: Record<string, StoryEntry> };
  return Object.values(index.entries)
    .filter((entry) => entry.type === 'story' && !entry.tags?.includes(SKIP_TAG))
    .map((entry) => entry.id);
}

async function readStyles(page: Page, combo: Combo) {
  return page.evaluate(
    ({ combo, properties }) => {
      for (const scope of document.querySelectorAll<HTMLElement>('[data-theme]')) {
        scope.dataset.theme = combo.theme;
        scope.dataset.mode = combo.mode;
        scope.dataset.contrast = combo.contrast;
      }
      const forced: HTMLElement[] = [];
      if (combo.state) {
        for (const element of document.querySelectorAll<HTMLElement>('body *')) {
          const classes = element.getAttribute('class') ?? '';
          // Classes with the state's variant, and the utilities that read the attribute.
          const reacts =
            classes.includes(`data-${combo.state}`) ||
            /(^|\s)(state-layer|focus-ring|focus-ring-inset)(\s|$)/.test(classes);
          if (reacts && !element.hasAttribute(`data-${combo.state}`)) {
            element.setAttribute(`data-${combo.state}`, 'true');
            forced.push(element);
          }
        }
      }
      const rows: [string, string[]][] = [];
      const walk = (element: Element, path: string) => {
        const style = getComputedStyle(element);
        rows.push([
          `${path} ${element.tagName.toLowerCase()}`,
          properties.map((property) => style.getPropertyValue(property)),
        ]);
        [...element.children].forEach((child, index) => {
          if (!['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE'].includes(child.tagName)) {
            walk(child, path ? `${path}.${index}` : String(index));
          }
        });
      };
      walk(document.body, '');
      for (const element of forced) element.removeAttribute(`data-${combo.state}`);
      return rows;
    },
    { combo, properties: PROPERTIES as readonly string[] },
  );
}

async function capture(page: Page, id: string): Promise<Snapshot> {
  await openStory(page, id);
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  // Let Motion's enter animations and any delayed layout settle before reading.
  await page.waitForTimeout(400);
  const snapshot: Snapshot = {
    properties: PROPERTIES,
    elements: [],
    values: [],
    rows: [],
    combos: {},
  };
  const valueIndex = new Map<string, number>();
  const rowIndex = new Map<string, number>();
  for (const combo of COMBOS) {
    const rows = await readStyles(page, combo);
    if (snapshot.elements.length === 0) snapshot.elements = rows.map(([key]) => key);
    expect(
      rows.map(([key]) => key),
      `${id}: the DOM changed while switching to ${combo.name}`,
    ).toEqual(snapshot.elements);
    snapshot.combos[combo.name] = rows.map(([, values]) =>
      intern(
        snapshot.rows,
        rowIndex,
        values.map((value) => intern(snapshot.values, valueIndex, value)).join(','),
      ),
    );
  }
  return snapshot;
}

/** The differences between two snapshots, one line each, readable in a test failure. */
function differences(expected: Snapshot, actual: Snapshot): string[] {
  if (expected.elements.join() !== actual.elements.join()) {
    return [`the DOM differs: ${expected.elements.length} → ${actual.elements.length} elements`];
  }
  const lines: string[] = [];
  for (const [combo, indexes] of Object.entries(expected.combos)) {
    const actualIndexes = actual.combos[combo] ?? [];
    indexes.forEach((row, element) => {
      const before = styleOf(expected, row);
      const after = styleOf(actual, actualIndexes[element]);
      expected.properties.forEach((property, p) => {
        if (before[p] !== after[p]) {
          lines.push(
            `${combo} · ${expected.elements[element]} · ${property}: ${before[p]} → ${after[p]}`,
          );
        }
      });
    });
  }
  return lines;
}

test.describe('Computed styles match the baseline', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const id of storyIds()) {
    test(id, async ({ page }) => {
      const file = new URL(`${id}.json`, BASELINE_DIR);
      const actual = await capture(page, id);
      if (RECORD) {
        mkdirSync(BASELINE_DIR, { recursive: true });
        writeFileSync(file, `${JSON.stringify(actual)}\n`);
        return;
      }
      expect(existsSync(file), `no baseline for ${id}: record one on a known-good commit`).toBe(
        true,
      );
      const expected = JSON.parse(readFileSync(file, 'utf8')) as Snapshot;
      const lines = differences(expected, actual);
      expect(lines.slice(0, 40), `${lines.length} computed styles changed`).toEqual([]);
    });
  }
});
