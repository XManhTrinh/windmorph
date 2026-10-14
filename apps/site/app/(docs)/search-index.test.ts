import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import type { ComponentPropsFile } from '../../lib/component-props';
import {
  componentSearchEntry,
  createSearchIndex,
  GUIDE_ENTRIES,
  groupResults,
  highlightParts,
  MAX_PAGES_PER_PROP,
  propScopes,
  resultTypeLabel,
  searchablePropNames,
  searchPages,
  suggestedResults,
  SUGGESTED_HREFS,
  type SearchEntry,
} from './search-index';

/** A component's generated prop names (`pnpm --filter site generate`), as the index reads them. */
function propNamesOf(name: string): string[] {
  const file = resolve(process.cwd(), '.generated/props', `${name}.json`);
  if (!existsSync(file)) return [];
  return (JSON.parse(readFileSync(file, 'utf8')) as ComponentPropsFile).props.map(
    (prop) => prop.name,
  );
}

const propNames = searchablePropNames(
  COMPONENT_META.map((page) => ({
    slug: page.slug,
    props: page.propsComponents.flatMap(propNamesOf),
  })),
);
const entries: SearchEntry[] = [
  ...GUIDE_ENTRIES,
  ...COMPONENT_META.map((page) => {
    const names = propNames.get(page.slug) ?? [];
    return componentSearchEntry(
      page,
      undefined,
      names,
      propScopes(page.propsComponents, propNamesOf, names),
    );
  }),
];
const index = createSearchIndex(entries);

describe('searchPages', () => {
  it('finds a component by title', () => {
    expect(searchPages(index, 'pin')[0]?.href).toBe('/components/pin-input');
  });

  it('finds a component by a keyword that is in neither title nor summary', () => {
    expect(searchPages(index, '2fa').map((entry) => entry.href)).toContain('/components/pin-input');
    expect(searchPages(index, 'otp').map((entry) => entry.href)).toContain('/components/pin-input');
  });

  it('finds the phone field by the words people use for it', () => {
    for (const query of ['telephone', 'country code', 'mobile']) {
      expect(
        searchPages(index, query).map((entry) => entry.href),
        query,
      ).toContain('/components/phone-field');
    }
  });

  it('finds pull to refresh by the words people use for it', () => {
    for (const query of ['swipe to refresh', 'reload', 'pull down', 'update feed']) {
      expect(
        searchPages(index, query).map((entry) => entry.href),
        query,
      ).toContain('/components/pull-to-refresh');
    }
  });

  it('finds Select and Autocomplete by the words people use for them', () => {
    for (const query of ['dropdown', 'picker']) {
      const hrefs = searchPages(index, query).map((entry) => entry.href);
      expect(hrefs, query).toContain('/components/select');
      expect(hrefs, query).toContain('/components/autocomplete');
    }
    for (const query of ['searchable select', 'select with search']) {
      expect(
        searchPages(index, query).map((entry) => entry.href),
        query,
      ).toContain('/components/select');
    }
    for (const query of ['combobox', 'typeahead', 'multi-select']) {
      expect(
        searchPages(index, query).map((entry) => entry.href),
        query,
      ).toContain('/components/autocomplete');
    }
  });

  it('ranks title matches before summary and keyword matches', () => {
    const results = searchPages(index, 'text field');
    expect(results[0]?.href).toBe('/components/text-field');
  });

  it('finds pages by the code names people import, on their API tab', () => {
    // A name the summary also uses finds the page on its title or summary, so it opens it.
    expect(searchPages(index, 'FileTrigger').map((entry) => entry.href)).toContain(
      '/components/file-trigger',
    );
    const cases = [
      ['ShapedIcon', '/components/shaped-icon/api'],
      ['SkipLink', '/components/skip-link/api'],
      ['useFileTrigger', '/components/file-trigger'],
      ['IconButton', '/components/icon-button/api'],
      ['useSnackbarHostState', '/components/snackbar/api'],
      ['useToolbarScrollExpansion', '/components/toolbars/api'],
      ['useToolbarScrollExit', '/components/toolbars/api'],
      ['useTheme', '/theming'],
      ['useNavigationGuard', '/nextjs'],
    ] as const;
    for (const [query, href] of cases) {
      expect(
        searchPages(index, query).map((entry) => entry.href),
        query,
      ).toContain(href);
    }
  });

  it('finds a component by its prop names, on its API tab at the prop', () => {
    const cases = [
      ['scrolledColor', '/components/top-app-bar/api#prop-TopAppBar-scrolledColor'],
      ['expandedRatio', '/components/button-group/api#prop-ButtonGroup-expandedRatio'],
      ['iconTransition', '/components/icon-button/api#prop-IconButton-iconTransition'],
      ['containerPadding', '/components/menu/api#prop-Menu-containerPadding'],
      ['selectedLeadingIcon', '/components/button/api#prop-Button-selectedLeadingIcon'],
      ['stopIndicator', '/components/progress/api#prop-LinearProgressIndicator-stopIndicator'],
      ['origin', '/components/dialog/api#prop-Dialog-origin'],
    ] as const;
    for (const [query, href] of cases) {
      const result = searchPages(index, query).find((found) => found.href === href);
      expect(result, query).toMatchObject({ tab: 'api', matched: query });
    }
  });

  it('finds the new features by the words people use for them', () => {
    const cases = [
      ['menu as a bottom sheet', '/components/menu'],
      ['container padding', '/components/menu'],
      ['transparent app bar', '/components/top-app-bar'],
      ['app bar chips row', '/components/top-app-bar'],
      ['dialog position', '/components/dialog'],
      ['stop indicator', '/components/progress'],
      ['rotating icon', '/components/icon-button'],
      ['overflow menu', '/components/button-group'],
      ['component tokens', '/customisation'],
      ['token mapping', '/from-compose'],
    ] as const;
    for (const [query, href] of cases) {
      expect(
        searchPages(index, query).map((result) => result.href),
        query,
      ).toContain(href);
    }
  });

  it('opens a component on the tab a query asks for', () => {
    const [first] = searchPages(index, 'slider keyboard');
    expect(first).toMatchObject({ href: '/components/slider/accessibility', tab: 'accessibility' });
    expect(resultTypeLabel(first!)).toBe('Accessibility');
    expect(searchPages(index, 'button api')[0]?.href).toBe('/components/button/api');
    expect(searchPages(index, 'tabs guidelines')[0]?.href).toBe('/components/tabs/guidelines');
  });

  it('leaves out a tab a page does not have', () => {
    const primitives = componentSearchEntry(
      {
        slug: 'primitives',
        title: 'Primitives',
        summary: '',
        railGroup: 'primitives',
        propsComponents: [],
      },
      ['overview', 'accessibility', 'api'],
    );
    expect(searchPages(createSearchIndex([primitives]), 'primitives guidelines')).toEqual([]);
  });

  it('documents every hook the library exports on some page', async () => {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    // Tests run from apps/site: the core's entries are next door, and the installed Pro's
    // declarations list its exports.
    const { createRequire } = await import('node:module');
    const proDist = join(
      createRequire(import.meta.url).resolve('@windmorph/react-pro/package.json'),
      '../dist',
    );
    const entryFiles = [
      join(process.cwd(), '../../packages/react/src/index.ts'),
      join(process.cwd(), '../../packages/react/src/next.ts'),
      join(process.cwd(), '../../packages/react/src/primitives.ts'),
      join(proDist, 'index.d.ts'),
      join(proDist, 'rich-text.d.ts'),
    ];
    const sources = await Promise.all(entryFiles.map((file) => readFile(file, 'utf8')));
    const exported = new Set(sources.join('\n').match(/\buse[A-Z][A-Za-z0-9]+\b/g) ?? []);
    const searchable = new Set(
      entries.flatMap((entry) => [...(entry.keywords ?? []), ...(entry.codeNames ?? [])]),
    );
    expect([...exported].filter((hook) => !searchable.has(hook))).toEqual([]);
  });
});

describe('propScopes', () => {
  it("names the component of each prop the page's first component doesn't take", () => {
    const props: Record<string, string[]> = {
      Fab: ['size', 'icon'],
      ExtendedFab: ['size', 'label', 'expanded'],
      FabMenu: ['expanded'],
    };
    expect(
      propScopes(['Fab', 'ExtendedFab', 'FabMenu'], (name) => props[name] ?? [], [
        'icon',
        'label',
        'expanded',
      ]),
    ).toEqual({ label: 'ExtendedFab', expanded: 'ExtendedFab' });
  });
});

describe('searchablePropNames', () => {
  it('keeps distinctive props and drops shared ones and ARIA attributes', () => {
    const pages = Array.from({ length: MAX_PAGES_PER_PROP + 1 }, (_, at) => ({
      slug: `page-${at}`,
      props: ['className', 'aria-label', ...(at === 0 ? ['scrolledColor', 'scrolledColor'] : [])],
    }));
    const names = searchablePropNames(pages);
    expect(names.get('page-0')).toEqual(['scrolledColor']);
    expect(names.get('page-1')).toEqual([]);
  });

  it('keeps the static index small', () => {
    const indexed = entries.flatMap((entry) => entry.propNames ?? []);
    expect(indexed.length).toBeGreaterThan(100);
    expect(JSON.stringify(indexed).length).toBeLessThan(16_000);
  });
});

describe('search results', () => {
  it('finds nothing for an empty query', () => {
    expect(searchPages(index, '   ')).toEqual([]);
  });

  it('finds pages holding every word of the query, in any order', () => {
    expect(searchPages(index, 'field text').map((result) => result.href)).toContain(
      '/components/text-field',
    );
  });

  it('says which code name a result was found by', () => {
    expect(searchPages(index, 'IconButton')[0]).toMatchObject({
      href: '/components/icon-button/api',
      matched: 'IconButton',
    });
  });

  it('labels each result with what it opens', () => {
    const label = (query: string) => resultTypeLabel(searchPages(index, query)[0]!);
    expect(label('theming')).toBe('Guide');
    expect(label('slider')).toBe('Component');
    expect(label('button api')).toBe('API');
    expect(label('tabs guidelines')).toBe('Guidelines');
  });

  it('groups results by category in the order of their best result', () => {
    const groups = groupResults(searchPages(index, 'button'));
    expect(groups[0]).toMatchObject({ category: 'Actions' });
    expect(groups.flatMap((group) => group.results)).toHaveLength(
      searchPages(index, 'button').length,
    );
    expect(new Set(groups.map((group) => group.category)).size).toBe(groups.length);
    expect(groupResults(searchPages(index, 'theming'))[0]?.category).toBe('Guides');
  });

  it('suggests pages that exist', () => {
    expect(suggestedResults(index).map((result) => result.href)).toEqual([...SUGGESTED_HREFS]);
  });
});

describe('highlightParts', () => {
  it('marks every match, ignoring case', () => {
    expect(highlightParts('Text field and text', ['text'])).toEqual([
      { text: 'Text', match: true },
      { text: ' field and ', match: false },
      { text: 'text', match: true },
    ]);
  });

  it('prefers the longest term and treats terms as plain text', () => {
    expect(highlightParts('A text field (1+1)', ['text', 'text field', '(1+1)'])).toEqual([
      { text: 'A ', match: false },
      { text: 'text field', match: true },
      { text: ' ', match: false },
      { text: '(1+1)', match: true },
    ]);
  });

  it('leaves text without terms whole', () => {
    expect(highlightParts('Slider', [])).toEqual([{ text: 'Slider', match: false }]);
  });
});
