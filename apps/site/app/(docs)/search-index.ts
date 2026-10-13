/** A page the documentation search can find. */
export interface SearchEntry {
  title: string;
  summary: string;
  href: string;
  /** Other words this page is found by, after title and summary matches. */
  keywords?: string[];
}

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
 * hooks) count as keywords, so `IconButton` or `useFileTrigger` find their pages too.
 */
export function componentSearchEntry(page: {
  slug: string;
  title: string;
  summary: string;
  keywords?: string[];
  propsComponents: string[];
  hooks?: string[];
}): SearchEntry {
  return {
    title: page.title,
    summary: page.summary,
    href: `/components/${page.slug}`,
    keywords: [...(page.keywords ?? []), ...page.propsComponents, ...(page.hooks ?? [])],
  };
}

/** Pages matching a query on their title (first), summary or keywords, at most `limit` of them. */
export function searchPages(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries.slice(0, limit);
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
  return [...byTitle, ...bySummary, ...byKeyword].slice(0, limit);
}
