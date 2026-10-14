import { RAIL_GROUP_MAP, type RailGroupId } from '../../content/components/catalog';
import { TAB_LABELS, componentTabHref, type ComponentTab } from '../../content/components/doc';
import { propAnchor } from '../../lib/prop-list-model';

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
  /**
   * The public prop names a component page documents (`scrolledColor`, `iconTransition`),
   * leaving out the ones most components share (see {@link searchablePropNames}). A match
   * opens the page's API tab at the prop.
   */
  propNames?: string[];
  /**
   * The component a prop name belongs to, for each one that isn't the page's first
   * component's (see {@link propScopes}): a match opens the API tab at the prop's anchor.
   */
  propScopes?: Record<string, string>;
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

/**
 * A prop name on more pages than this is shared API (`size`, `variant`, `className`), which
 * finds nothing in particular, so it is left out of the index.
 */
export const MAX_PAGES_PER_PROP = 3;

/**
 * Each page's prop names worth searching for: its components' props, minus the ones shared
 * by more than {@link MAX_PAGES_PER_PROP} pages and the ARIA attributes. Keeps the static
 * index small while every distinctive prop still finds its page.
 */
export function searchablePropNames(
  pages: readonly { slug: string; props: readonly string[] }[],
): Map<string, string[]> {
  const pagesPerProp = new Map<string, number>();
  const unique = pages.map(({ slug, props }) => ({ slug, props: [...new Set(props)] }));
  for (const { props } of unique) {
    for (const prop of props) pagesPerProp.set(prop, (pagesPerProp.get(prop) ?? 0) + 1);
  }
  return new Map(
    unique.map(({ slug, props }) => [
      slug,
      props.filter(
        (prop) => !prop.startsWith('aria-') && (pagesPerProp.get(prop) ?? 0) <= MAX_PAGES_PER_PROP,
      ),
    ]),
  );
}

/**
 * Which component each of a page's searchable prop names belongs to, for the names its first
 * component doesn't take (the first one that does), so a result can open the prop's anchor.
 */
export function propScopes(
  components: readonly string[],
  propsOf: (component: string) => readonly string[],
  names: readonly string[],
): Record<string, string> {
  const scopes: Record<string, string> = {};
  const [first, ...rest] = components;
  if (!first) return scopes;
  const firstProps = new Set(propsOf(first));
  for (const name of names) {
    if (firstProps.has(name)) continue;
    const owner = rest.find((component) => propsOf(component).includes(name));
    if (owner) scopes[name] = owner;
  }
  return scopes;
}

/** The heading guide and gallery results are grouped under. */
export const GUIDES_CATEGORY = 'Guides';

/**
 * The guide pages plus the components gallery index, with the summaries the search shows.
 * (Individual component pages are added to the index from `COMPONENT_PAGES` by
 * `app/search-index.json/route.ts`; this list is the non-component destinations.)
 */
export const GUIDE_ENTRIES: SearchEntry[] = [
  {
    title: 'Components',
    summary:
      'Browse every component by category, each with live examples and every prop documented.',
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
    summary:
      'Override tokens, themes and classes; component tokens; extend variants; layout safety.',
    href: '/customisation',
    kind: 'guide',
    keywords: ['--md-comp', 'component tokens', 'data-variant', 'Material Web'],
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
    kind: 'guide',
    summary:
      'Jetpack Compose Material 3 composables and their key parameters, mapped to Windmorph components and props.',
    href: '/from-compose',
    keywords: [
      'Jetpack Compose',
      'Android',
      'composable',
      'migrate',
      'port',
      'Compose tokens',
      'token mapping',
      'FilledButtonTokens',
    ],
  },
  {
    title: 'Spec status',
    kind: 'guide',
    summary:
      'What each component covers of the M3 Expressive spec, its deliberate differences and its extensions.',
    href: '/spec-status',
    keywords: ['M3 spec', 'coverage', 'differences', 'extensions', 'Material 3 Expressive'],
  },
  {
    title: "What's new",
    summary: 'Release notes for each version of @windmorph/react, newest first.',
    href: '/whats-new',
    kind: 'guide',
    keywords: ['changelog', 'release notes', 'releases', 'version'],
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
 * hooks) and its distinctive prop names find it too, opening its API tab; `tabs` are the
 * tabs the page has.
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
  propNames: readonly string[] = [],
  scopes: Record<string, string> = {},
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
    ...(propNames.length > 0 && { propNames: [...propNames] }),
    ...(Object.keys(scopes).length > 0 && { propScopes: scopes }),
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
  propNames: string[];
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
      const propNames = (entry.propNames ?? []).map((name) => name.toLowerCase());
      return {
        entry,
        title,
        summary,
        keywords,
        codeNames,
        propNames,
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

/** A prop name matches a query that is the name, or (from four characters) its start. */
function propMatches(name: string, q: string): boolean {
  return name === q || (q.length >= 4 && name.startsWith(q));
}

/**
 * Pages matching a query, at most `limit` of them, best first: a component asked for on a
 * tab, then matches on the title, the summary, keywords, code names and prop names (which
 * open the API tab), then pages holding every word of the query somewhere. An empty query
 * finds nothing.
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
  for (const item of rest()) {
    const at = item.propNames.findIndex((name) => propMatches(name, q));
    if (at < 0) continue;
    const matched = item.entry.propNames![at]!;
    const result = tabResult(item.entry, 'api', terms, matched);
    const scope = item.entry.propScopes?.[matched] ?? item.entry.codeNames?.[0];
    // The API tab, scrolled to the prop.
    if (result && scope) result.href += `#${propAnchor(scope, matched)}`;
    add(result ?? pageResult(item.entry, terms, matched));
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
