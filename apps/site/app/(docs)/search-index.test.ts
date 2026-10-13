import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import { componentSearchEntry, GUIDE_ENTRIES, searchPages, type SearchEntry } from './search-index';

const entries: SearchEntry[] = [...GUIDE_ENTRIES, ...COMPONENT_META.map(componentSearchEntry)];

describe('searchPages', () => {
  it('finds a component by title', () => {
    expect(searchPages(entries, 'pin')[0]?.href).toBe('/components/pin-input');
  });

  it('finds a component by a keyword that is in neither title nor summary', () => {
    expect(searchPages(entries, '2fa').map((entry) => entry.href)).toContain(
      '/components/pin-input',
    );
    expect(searchPages(entries, 'otp').map((entry) => entry.href)).toContain(
      '/components/pin-input',
    );
  });

  it('finds the phone field by the words people use for it', () => {
    for (const query of ['telephone', 'country code', 'mobile']) {
      expect(
        searchPages(entries, query).map((entry) => entry.href),
        query,
      ).toContain('/components/phone-field');
    }
  });

  it('finds Select and Autocomplete by the words people use for them', () => {
    for (const query of ['dropdown', 'picker']) {
      const hrefs = searchPages(entries, query).map((entry) => entry.href);
      expect(hrefs, query).toContain('/components/select');
      expect(hrefs, query).toContain('/components/autocomplete');
    }
    for (const query of ['searchable select', 'select with search']) {
      expect(
        searchPages(entries, query).map((entry) => entry.href),
        query,
      ).toContain('/components/select');
    }
    for (const query of ['combobox', 'typeahead', 'multi-select']) {
      expect(
        searchPages(entries, query).map((entry) => entry.href),
        query,
      ).toContain('/components/autocomplete');
    }
  });

  it('ranks title matches before summary and keyword matches', () => {
    const results = searchPages(entries, 'text field');
    expect(results[0]?.href).toBe('/components/text-field');
  });

  it('finds pages by the code names people import', () => {
    const cases = [
      ['ShapedIcon', '/components/shaped-icon'],
      ['SkipLink', '/components/skip-link'],
      ['FileTrigger', '/components/file-trigger'],
      ['useFileTrigger', '/components/file-trigger'],
      ['IconButton', '/components/icon-button'],
      ['useSnackbarHostState', '/components/snackbar'],
      ['useToolbarScrollExpansion', '/components/toolbars'],
      ['useToolbarScrollExit', '/components/toolbars'],
      ['useTheme', '/theming'],
      ['useNavigationGuard', '/nextjs'],
    ] as const;
    for (const [query, href] of cases) {
      expect(
        searchPages(entries, query).map((entry) => entry.href),
        query,
      ).toContain(href);
    }
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
    const searchable = new Set(entries.flatMap((entry) => entry.keywords ?? []));
    expect([...exported].filter((hook) => !searchable.has(hook))).toEqual([]);
  });
});
