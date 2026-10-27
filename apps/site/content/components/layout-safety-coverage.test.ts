import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from './catalog';

/**
 * Architecture §10: every core component page has a layout-override story in `apps/docs`
 * and a Playwright spec that runs the override matrix on it. Each page lists the story ids
 * that cover what it documents (both parts of a family, a trigger and its overlay).
 */
const COVERAGE: Record<string, readonly string[]> = {
  button: ['components-button--layout-override'],
  'icon-button': ['components-iconbutton--layout-override'],
  'button-group': ['composites-buttongroup--layout-override'],
  'split-button': ['components-splitbutton--layout-override'],
  fab: ['components-fab--layout-override'],
  'fab-menu': ['components-fabmenu--layout-override'],
  'text-field': ['components-textfield--layout-override'],
  select: ['components-select--layout-override'],
  autocomplete: ['components-autocomplete--layout-override'],
  checkbox: ['components-checkbox--layout-override'],
  'radio-group': ['components-radio--layout-override'],
  switch: ['components-switch--layout-override'],
  slider: ['components-slider--layout-override'],
  chips: ['components-chips--layout-override'],
  card: ['components-card--layout-override'],
  dialog: ['components-dialog--layout-override', 'components-dialog--positioner-override'],
  menu: ['components-menu--layout-override'],
  tooltip: ['components-tooltip--layout-override'],
  sheets: ['components-sheet--layout-override', 'components-sheet--bottom-layout-override'],
  list: ['components-list--layout-override'],
  carousel: ['components-carousel--layout-override'],
  badge: ['components-badge--layout-override'],
  divider: ['components-divider--layout-override'],
  'navigation-rail': ['components-navigation--rail-layout-override'],
  'navigation-bar': ['components-navigation--layout-override'],
  tabs: ['components-tabs--layout-override'],
  'top-app-bar': ['components-topappbar--layout-override'],
  search: ['components-search--layout-override'],
  toolbars: ['components-toolbar--layout-override', 'components-toolbar--docked-layout-override'],
  snackbar: ['components-snackbar--layout-override'],
  progress: [
    'components-progress--layout-override',
    'components-progress--circular-layout-override',
  ],
  'loading-indicator': ['components-loadingindicator--layout-override'],
  'pull-to-refresh': ['components-pulltorefresh--layout-override'],
  'date-picker': ['components-pickers--layout-override'],
  'time-picker': ['components-pickers--time-layout-override'],
  'picker-dialog': ['components-pickers--dialog-layout-override'],
};

/** Core pages with nothing to render, and why. */
const EXEMPT: Record<string, string> = {
  primitives: 'documents hooks, not a component',
};

const docsDir = resolve(process.cwd(), '../docs');

/** Storybook's id for a title: lower case, with every run of other characters a dash. */
const titleId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Each story file's source, by its title's id (`components-fabmenu`). */
function storiesByTitle(): Map<string, string> {
  const dir = resolve(docsDir, 'stories');
  const files = new Map<string, string>();
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.stories.tsx'))) {
    const source = readFileSync(resolve(dir, file), 'utf8');
    const title = /\btitle:\s*'([^']+\/[^']+)'/.exec(source)?.[1];
    if (title) files.set(titleId(title), source);
  }
  return files;
}

/** Every spec's source, joined. */
function specs(): string {
  const dir = resolve(docsDir, 'e2e');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.spec.ts'))
    .map((name) => readFileSync(resolve(dir, name), 'utf8'))
    .join('\n');
}

/** `layout-override` → `LayoutOverride`. */
const exportName = (story: string) =>
  story
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('layout-safety coverage (architecture §10)', () => {
  const core = COMPONENT_META.filter((meta) => !meta.pro).map((meta) => meta.slug);
  const stories = storiesByTitle();
  const specSource = specs();
  const ids = Object.values(COVERAGE).flat();

  it('lists every core page, and only core pages', () => {
    expect(core.filter((slug) => !(slug in COVERAGE) && !(slug in EXEMPT))).toEqual([]);
    expect(Object.keys({ ...COVERAGE, ...EXEMPT }).filter((slug) => !core.includes(slug))).toEqual(
      [],
    );
    expect(Object.entries(COVERAGE).filter(([, list]) => list.length === 0)).toEqual([]);
  });

  it('finds the stories', () => {
    expect(stories.size).toBeGreaterThan(0);
    const missing = ids.filter((id) => {
      const [title = '', story = ''] = id.split('--');
      const source = stories.get(title);
      return !source || !new RegExp(`export const ${exportName(story)}\\b`).test(source);
    });
    expect(missing).toEqual([]);
  });

  it('runs the override matrix on every story', () => {
    const unchecked = ids.filter((id) => {
      const quoted = `'${escape(id)}'`;
      return !new RegExp(
        `layoutSafetySuite\\(\\s*${quoted}|openStory\\(\\s*page,\\s*${quoted}`,
      ).test(specSource);
    });
    expect(unchecked).toEqual([]);
  });
});
