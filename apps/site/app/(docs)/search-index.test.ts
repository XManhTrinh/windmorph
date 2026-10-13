import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import {
  componentSearchEntry,
  createSearchIndex,
  GUIDE_ENTRIES,
  groupResults,
  highlightParts,
  resultTypeLabel,
  searchPages,
  suggestedResults,
  SUGGESTED_HREFS,
  type SearchEntry,
} from './search-index';

const entries: SearchEntry[] = [
  ...GUIDE_ENTRIES,
  ...COMPONENT_META.map((page) => componentSearchEntry(page)),
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
