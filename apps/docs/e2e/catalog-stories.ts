import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { COMPONENT_META } from '../../site/content/components/catalog';

/*
 * Which Storybook stories show which component of the docs site's catalog, for the guard
 * suites that run every component story (scroll-guard, forced-colors-guard) and their
 * coverage checks: a new catalog component, or a story under a title nobody mapped, fails
 * `catalog-coverage.spec.ts` until it's added here.
 */

const INDEX = fileURLToPath(new URL('../storybook-static/index.json', import.meta.url));

interface IndexEntry {
  id: string;
  type: 'story' | 'docs';
}

/** Every story id in the static build (`turbo run test:e2e` builds it first). */
export const allStoryIds: string[] = existsSync(INDEX)
  ? Object.values(
      (JSON.parse(readFileSync(INDEX, 'utf8')) as { entries: Record<string, IndexEntry> }).entries,
    )
      .filter((entry) => entry.type === 'story')
      .map((entry) => entry.id)
  : [];

/** Story titles that hold one catalog component each, by the story id's title part. */
const TITLES: Record<string, string> = {
  'components-autocomplete': 'autocomplete',
  'components-badge': 'badge',
  'components-button': 'button',
  'components-card': 'card',
  'components-carousel': 'carousel',
  'components-checkbox': 'checkbox',
  'components-chips': 'chips',
  'components-dialog': 'dialog',
  'components-divider': 'divider',
  'components-fab': 'fab',
  'components-fabmenu': 'fab-menu',
  'components-iconbutton': 'icon-button',
  'components-list': 'list',
  'components-loadingindicator': 'loading-indicator',
  'components-menu': 'menu',
  'components-progress': 'progress',
  'components-pulltorefresh': 'pull-to-refresh',
  'components-radio': 'radio-group',
  'components-search': 'search',
  'components-select': 'select',
  'components-sheet': 'sheets',
  'components-slider': 'slider',
  'components-snackbar': 'snackbar',
  'components-splitbutton': 'split-button',
  'components-switch': 'switch',
  'components-tabs': 'tabs',
  'components-textfield': 'text-field',
  'components-toolbar': 'toolbars',
  'components-tooltip': 'tooltip',
  'components-topappbar': 'top-app-bar',
  'composites-buttongroup': 'button-group',
};

/** Titles whose stories show several catalog components, told apart by the story's name. */
const SHARED_TITLES: Record<string, (name: string) => string | undefined> = {
  'components-navigation': (name) => (name.includes('rail') ? 'navigation-rail' : 'navigation-bar'),
  'components-pickers': (name) =>
    /dialog|full-screen/.test(name)
      ? 'picker-dialog'
      : name.startsWith('time')
        ? 'time-picker'
        : 'date-picker',
};

/** Story titles that aren't a catalog component, and why. */
export const NOT_COMPONENTS: Record<string, string> = {
  'foundations-shapes':
    'the shape library, documented under Primitives, not an interactive component',
};

/** The catalog component a story shows, or `undefined` when no one mapped its title. */
export function componentOf(storyId: string): string | undefined {
  const [title = '', name = ''] = storyId.split('--');
  return TITLES[title] ?? SHARED_TITLES[title]?.(name);
}

/** Whether a story is a component story the guard suites must run (not tokens or foundations). */
export function isComponentStory(storyId: string): boolean {
  const title = storyId.split('--')[0]!;
  return !storyId.startsWith('tokens-') && !(title in NOT_COMPONENTS);
}

/** Every component story, in index order. */
export const componentStoryIds: string[] = allStoryIds.filter(isComponentStory);

/** Catalog pages without a story of their own, and why. */
export const CATALOG_WITHOUT_STORIES: Record<string, string> = {
  primitives:
    'the primitives page documents building blocks (state layer, ripple, shapes) shown in other stories',
};

/** The core's catalog components (Pro components have their own Storybook). */
export const coreCatalogSlugs: string[] = COMPONENT_META.filter((meta) => !meta.pro).map(
  (meta) => meta.slug,
);
