import { TAB_LABELS, componentTabHref, type ComponentTab } from '../../content/components/doc';

/** A page the documentation search can find. */
export interface SearchEntry {
  title: string;
  summary: string;
  href: string;
  /** Other words this page is found by, after title and summary matches. */
  keywords?: string[];
  /**
   * The code names a component page documents (`IconButton`, `useFileTrigger`). A match on
   * one opens the page's API tab.
   */
  codeNames?: string[];
  /** A component page's tabs beyond Overview, by tab, for queries such as "slider keyboard". */
  tabHrefs?: Partial<Record<Exclude<ComponentTab, 'overview'>, string>>;
}

/** Words that, after a component's name, ask for one of its tabs. */
const TAB_WORDS: Record<string, Exclude<ComponentTab, 'overview'>> = {
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
 * The guide pages plus the components gallery index, with the summaries the search shows.
 * (Individual component pages are added to the index from `COMPONENT_PAGES` in the root
 * layout; this list is the non-component destinations.)
 */
export const GUIDE_ENTRIES: SearchEntry[] = [
  {
    title: 'Components',
    summary: 'Browse every component by category, each with live examples and a full props table.',
    href: '/components',
  },
  {
    title: 'Getting started',
    summary: 'Install the library with or without Tailwind, load the font, add icons and routing.',
    href: '/getting-started',
  },
  {
    title: 'Theming',
    summary: 'Themes, light and dark mode, contrast levels, custom themes and no theme flash.',
    href: '/theming',
    keywords: ['ThemeProvider', 'useTheme', 'useThemeScope'],
  },
  {
    title: 'Motion',
    summary: 'The expressive and standard motion schemes, springs and reduced motion.',
    href: '/motion',
  },
  {
    title: 'Customisation',
    summary: 'Override tokens, themes and classes; extend variants; layout safety.',
    href: '/customisation',
  },
  {
    title: 'Accessibility',
    summary: 'WCAG 2.2 AA, required names, keyboard behaviour and right-to-left.',
    href: '/accessibility',
  },
  {
    title: 'Next.js',
    summary:
      'App Router and Pages Router setup, client boundaries, the Next.js helpers and asking before leaving unsaved changes.',
    href: '/nextjs',
    keywords: ['NextRouterProvider', 'useNavigationGuard', 'useGuardedNavigate'],
  },
];

/**
 * A component page's search entry. Its code names (the components it documents and its
 * hooks) find it too, opening its API tab; `tabs` are the tabs the page has.
 */
export function componentSearchEntry(
  page: {
    slug: string;
    title: string;
    summary: string;
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
    keywords: page.keywords,
    codeNames: [...page.propsComponents, ...(page.hooks ?? [])],
    tabHrefs,
  };
}

/** The entry opened on one of its tabs: its title names the tab, its link goes there. */
function onTab(entry: SearchEntry, tab: Exclude<ComponentTab, 'overview'>): SearchEntry | null {
  const href = entry.tabHrefs?.[tab];
  return href ? { ...entry, title: `${entry.title}: ${TAB_LABELS[tab]}`, href } : null;
}

/**
 * Component pages asked for on a tab: a query that is a component's name followed by a tab
 * word ("slider keyboard", "button api").
 */
function tabMatches(entries: SearchEntry[], q: string): SearchEntry[] {
  for (const [word, tab] of Object.entries(TAB_WORDS)) {
    if (!q.endsWith(` ${word}`)) continue;
    const name = q.slice(0, -word.length - 1).trim();
    if (!name) continue;
    return entries
      .filter((entry) => entry.tabHrefs && entry.title.toLowerCase().includes(name))
      .map((entry) => onTab(entry, tab))
      .filter((entry): entry is SearchEntry => entry !== null);
  }
  return [];
}

/**
 * Pages matching a query, at most `limit` of them: a component asked for on a tab first,
 * then matches on the title, the summary, keywords and code names (which open the API tab).
 */
export function searchPages(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries.slice(0, limit);
  const byTab = tabMatches(entries, q);
  const byTitle = entries.filter((entry) => entry.title.toLowerCase().includes(q));
  const bySummary = entries.filter(
    (entry) => !byTitle.includes(entry) && entry.summary.toLowerCase().includes(q),
  );
  const byKeyword = entries.filter(
    (entry) =>
      !byTitle.includes(entry) &&
      !bySummary.includes(entry) &&
      (entry.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(q)),
  );
  const byCodeName = entries
    .filter(
      (entry) =>
        !byTitle.includes(entry) &&
        !bySummary.includes(entry) &&
        !byKeyword.includes(entry) &&
        (entry.codeNames ?? []).some((name) => name.toLowerCase().includes(q)),
    )
    .map((entry) => onTab(entry, 'api') ?? entry);
  return [...byTab, ...byTitle, ...bySummary, ...byKeyword, ...byCodeName].slice(0, limit);
}
