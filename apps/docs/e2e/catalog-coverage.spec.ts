import { expect, test } from '@playwright/test';
import {
  allStoryIds,
  CATALOG_WITHOUT_STORIES,
  componentOf,
  componentStoryIds,
  coreCatalogSlugs,
  NOT_COMPONENTS,
} from './catalog-stories';
import { FORCED_COLORS_EXCEPTIONS } from './forced-colors';

/*
 * The guard suites (scroll-guard, forced-colors-guard) run every component story. These
 * checks fail when the docs site's catalog gains a component that has no story, or when a
 * story's title isn't mapped to a catalog component in `catalog-stories.ts`, so a new
 * component can't slip past the guards.
 */

test('the static build lists the stories', () => {
  expect(componentStoryIds.length).toBeGreaterThan(100);
});

test('every component story belongs to a catalog component', () => {
  const unmapped = componentStoryIds.filter((id) => {
    const slug = componentOf(id);
    return !slug || !coreCatalogSlugs.includes(slug);
  });
  expect(unmapped, 'map their titles in catalog-stories.ts').toEqual([]);
});

test('every catalog component has a story the guards run', () => {
  const covered = new Set(componentStoryIds.map(componentOf));
  const missing = coreCatalogSlugs.filter(
    (slug) => !covered.has(slug) && !(slug in CATALOG_WITHOUT_STORIES),
  );
  expect(missing, 'add a story for each, or a reason in CATALOG_WITHOUT_STORIES').toEqual([]);
});

test('every exception names a story or catalog page that exists', () => {
  const titles = new Set(allStoryIds.map((id) => id.split('--')[0]));
  expect(Object.keys(NOT_COMPONENTS).filter((title) => !titles.has(title))).toEqual([]);
  expect(
    Object.keys(CATALOG_WITHOUT_STORIES).filter((slug) => !coreCatalogSlugs.includes(slug)),
  ).toEqual([]);
  expect(
    FORCED_COLORS_EXCEPTIONS.map((exception) => exception.story).filter(
      (story) => story !== '*' && !componentStoryIds.includes(story),
    ),
  ).toEqual([]);
});
