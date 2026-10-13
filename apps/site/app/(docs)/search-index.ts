import { RAIL_GROUP_MAP, type RailGroupId } from '../../content/components/catalog';
import { TAB_LABELS, componentTabHref, type ComponentTab } from '../../content/components/doc';

/** A component page's tabs beyond Overview. */
type SubTab = Exclude<ComponentTab, 'overview'>;

/** A page the documentation search can find. */
export interface SearchEntry {
  title: string;
  summary: string;
  href: string;
  /** A guide, the components gallery, or a component page (in its rail group). */
  kind: 'guide' | 'gallery' | 'component';
  /** A component page's rail group, which its results are grouped under. */
  group?: RailGroupId;
  /** Other words this page is found by, after title and summary matches. */
  keywords?: string[];
  /**
   * The code names a component page documents (`IconButton`, `useFileTrigger`). A match on
   * one opens the page's API tab.
   */
  codeNames?: string[];
  /** A component page's tabs beyond Overview, by tab, for queries such as "slider keyboard". */
  tabHrefs?: Partial<Record<SubTab, string>>;
}

/** One search result: a page, or a component page opened on one of its tabs. */
export interface SearchResult {
  /** Where the result goes; unique within one search. */
  href: string;
  entry: SearchEntry;
  /** The tab the result opens, when it isn't the page's Overview. */
  tab?: SubTab;
  /** The keyword or code name the query matched, when neither the title nor summary did. */
  matched?: string;
  /** The parts of the query to highlight in the result's text. */
  terms: string[];
}

/** A run of results under one heading. */
export interface SearchGroup {
  category: string;
  results: SearchResult[];
}

/** Words that, after a component's name, ask for one of its tabs. */
const TAB_WORDS: Record<string, SubTab> = {
  api: 'api',
  props: 'api',
  properties: 'api',
  tokens: 'api',
  accessibility: 'accessibility',
  a11y: 'accessibility',
  keyboard: 'accessibility',
  aria: 'accessibility',
  'screen reader': 'accessibility',
  guidelines: 'guidelines',
  usage: 'guidelines',
  'when to use': 'guidelines',
};

/** The heading guide and gallery results are grouped under. */
export const GUIDES_CATEGORY = 'Guides';

/**
 * The guide pages plus the components gallery index, with the summaries the search shows.
 * (Individual component pages are added to the index from `COMPONENT_PAGES` in the root
 * layout; this list is the non-component destinations.)
 */
export const GUIDE_ENTRIES: SearchEntry[] = [
  {
    title: 'Components',
    summary: 'Browse every component by category, each with live examples and a full props table.',
    href: '/components',
    kind: 'gallery',
  },
  {
    title: 'Getting started',
    summary: 'Install the library with or without Tailwind, load the font, add icons and routing.',
    href: '/getting-started',
    kind: 'guide',
  },
  {
    title: 'Theming',
    summary: 'Themes, light and dark mode, contrast levels, custom themes and no theme flash.',
    href: '/theming',
    kind: 'guide',
    keywords: ['ThemeProvider', 'useTheme', 'useThemeScope'],
  },
  {
    title: 'Motion',
    summary: 'The expressive and standard motion schemes, springs and reduced motion.',
    href: '/motion',
    kind: 'guide',
  },
  {
    title: 'Customisation',
    summary: 'Override tokens, themes and classes; extend variants; layout safety.',
    href: '/customisation',
    kind: 'guide',
  },
  {
    title: 'Accessibility',
    summary: 'WCAG 2.2 AA, required names, keyboard behaviour and right-to-left.',
    href: '/accessibility',
    kind: 'guide',
  },
  {
    title: 'Next.js',
    summary:
      'App Router and Pages Router setup, client boundaries, the Next.js helpers and asking before leaving unsaved changes.',
    href: '/nextjs',
    kind: 'guide',
    keywords: ['NextRouterProvider', 'useNavigationGuard', 'useGuardedNavigate'],
  },
  {
    title: 'From Compose',
    summary:
      'Jetpack Compose Material 3 composables and their key parameters, mapped to Windmorph components and props.',
    href: '/from-compose',
    keywords: ['Jetpack Compose', 'Android', 'composable', 'migrate', 'port'],
  },
  {
    title: 'Spec status',
    summary:
      'What each component covers of the M3 Expressive spec, its deliberate differences and its extensions.',
    href: '/spec-status',
    keywords: ['M3 spec', 'coverage', 'differences', 'extensions', 'Material 3 Expressive'],
  },
];

/** The pages the search suggests before anything is typed, and when nothing matches. */
export const SUGGESTED_HREFS = [
  '/getting-started',
  '/theming',
  '/components/button',
  '/components/text-field',
  '/components/dialog',
] as const;

/**
 * A component page's search entry. Its code names (the components it documents and its
 * hooks) find it too, opening its API tab; `tabs` are the tabs the page has.
 */
export function componentSearchEntry(
  page: {
    slug: string;
    title: string;
    summary: string;
    railGroup: RailGroupId;
    keywords?: string[];
    propsComponents: string[];
    hooks?: string[];
  },
  tabs: readonly ComponentTab[] = ['overview', 'api', 'accessibility', 'guidelines'],
): SearchEntry {
  const tabHrefs: SearchEntry['tabHrefs'] = {};
  for (const tab of tabs) if (tab !== 'overview') tabHrefs[tab] = componentTabHref(page.slug, tab);
  return {
    title: page.title,
    summary: page.summary,
    href: componentTabHref(page.slug),
    kind: 'component',
    group: page.railGroup,
    keywords: page.keywords,
    codeNames: [...page.propsComponents, ...(page.hooks ?? [])],
    tabHrefs,
  };
}

/** An entry with its text lower-cased once, so a keystroke only compares strings. */
interface IndexedEntry {
  entry: SearchEntry;
  title: string;
  summary: string;
  keywords: string[];
  codeNames: string[];
  /** Everything above, for queries whose words match in different places. */
  all: string;
}

/** The entries prepared for searching: build it once, then search it on every keystroke. */
export interface SearchIndex {
  entries: readonly IndexedEntry[];
  byHref: ReadonlyMap<string, SearchEntry>;
}

export function createSearchIndex(entries: readonly SearchEntry[]): SearchIndex {
  return {
    entries: entries.map((entry) => {
      const title = entry.title.toLowerCase();
      const summary = entry.summary.toLowerCase();
      const keywords = (entry.keywords ?? []).map((keyword) => keyword.toLowerCase());
      const codeNames = (entry.codeNames ?? []).map((name) => name.toLowerCase());
      return {
        entry,
        title,
        summary,
        keywords,
        codeNames,
        all: [title, summary, ...keywords, ...codeNames].join('\n'),
      };
    }),
    byHref: new Map(entries.map((entry) => [entry.href, entry])),
  };
}

/** A page's own result (its Overview). */
function pageResult(entry: SearchEntry, terms: string[], matched?: string): SearchResult {
  return { href: entry.href, entry, terms, ...(matched && { matched }) };
}

/** The entry opened on one of its tabs, or nothing when the page doesn't have that tab. */
function tabResult(
  entry: SearchEntry,
  tab: SubTab,
  terms: string[],
  matched?: string,
): SearchResult | null {
  const href = entry.tabHrefs?.[tab];
  return href ? { href, entry, tab, terms, ...(matched && { matched }) } : null;
}

/**
 * Component pages asked for on a tab: a query that is a component's name followed by a tab
 * word ("slider keyboard", "button api").
 */
function tabMatches(index: SearchIndex, q: string): SearchResult[] {
  for (const [word, tab] of Object.entries(TAB_WORDS)) {
    if (!q.endsWith(` ${word}`)) continue;
    const name = q.slice(0, -word.length - 1).trim();
    if (!name) continue;
    return index.entries
      .filter((item) => item.entry.tabHrefs && item.title.includes(name))
      .map((item) => tabResult(item.entry, tab, [name]))
      .filter((result): result is SearchResult => result !== null);
  }
  return [];
}

/**
 * Pages matching a query, at most `limit` of them, best first: a component asked for on a
 * tab, then matches on the title, the summary, keywords and code names (which open the API
 * tab), then pages holding every word of the query somewhere. An empty query finds nothing.
 */
export function searchPages(index: SearchIndex, query: string, limit = 12): SearchResult[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return [];
  const found = new Set<SearchEntry>();
  const results: SearchResult[] = [];
  const add = (result: SearchResult | null) => {
    if (!result || results.some((other) => other.href === result.href)) return;
    found.add(result.entry);
    results.push(result);
  };
  const terms = [q];
  const rest = () => index.entries.filter((item) => !found.has(item.entry));

  for (const result of tabMatches(index, q)) add(result);
  for (const item of rest()) if (item.title.includes(q)) add(pageResult(item.entry, terms));
  for (const item of rest()) if (item.summary.includes(q)) add(pageResult(item.entry, terms));
  for (const item of rest()) {
    const at = item.keywords.findIndex((keyword) => keyword.includes(q));
    if (at >= 0) add(pageResult(item.entry, terms, item.entry.keywords?.[at]));
  }
  for (const item of rest()) {
    const at = item.codeNames.findIndex((name) => name.includes(q));
    if (at < 0) continue;
    const matched = item.entry.codeNames?.[at];
    add(tabResult(item.entry, 'api', terms, matched) ?? pageResult(item.entry, terms, matched));
  }
  const words = q.split(' ');
  if (words.length > 1) {
    for (const item of rest()) {
      if (words.every((word) => item.all.includes(word))) add(pageResult(item.entry, words));
    }
  }
  return results.slice(0, limit);
}

/** The suggested pages, as results with nothing to highlight. */
export function suggestedResults(index: SearchIndex): SearchResult[] {
  return SUGGESTED_HREFS.flatMap((href) => {
    const entry = index.byHref.get(href);
    return entry ? [pageResult(entry, [])] : [];
  });
}

/** The heading a result is listed under: its component group, or Guides. */
export function resultCategory(entry: SearchEntry): string {
  return entry.group ? RAIL_GROUP_MAP[entry.group].fullName : GUIDES_CATEGORY;
}

/** What a result opens: a guide, the gallery, a component, or the tab's name. */
export function resultTypeLabel(result: SearchResult): string {
  if (result.tab) return TAB_LABELS[result.tab];
  if (result.entry.kind === 'gallery') return 'Gallery';
  return result.entry.kind === 'guide' ? 'Guide' : 'Component';
}

/**
 * Results grouped by category. Groups come in the order of their best result, and results
 * keep their order within a group.
 */
export function groupResults(results: readonly SearchResult[]): SearchGroup[] {
  const groups = new Map<string, SearchResult[]>();
  for (const result of results) {
    const category = resultCategory(result.entry);
    const group = groups.get(category);
    if (group) group.push(result);
    else groups.set(category, [result]);
  }
  return [...groups].map(([category, grouped]) => ({ category, results: grouped }));
}

/** A piece of text, and whether it matches the query. */
export interface TextPart {
  text: string;
  match: boolean;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** `text` split into the parts that match any of `terms` (ignoring case) and the rest. */
export function highlightParts(text: string, terms: readonly string[]): TextPart[] {
  const usable = terms.filter((term) => term.trim() !== '');
  if (usable.length === 0) return [{ text, match: false }];
  // Longer terms first, so "text field" wins over "text" where both match.
  const pattern = [...usable]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');
  // With a capturing group, `split` puts the matches at the odd indices.
  return text
    .split(new RegExp(`(${pattern})`, 'gi'))
    .map((part, index) => ({ text: part, match: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}
