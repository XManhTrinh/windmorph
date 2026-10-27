import type { ComponentMeta } from '../content/components/catalog';

/** The package entries a component page can import from. */
export type ImportEntry =
  | '@windmorph/react'
  | '@windmorph/react/primitives'
  | '@windmorph/react-pro'
  | '@windmorph/react-pro/rich-text';

/** Pages whose exports come from an entry other than their package's main one. */
const ENTRY_BY_SLUG: Record<string, ImportEntry> = {
  primitives: '@windmorph/react/primitives',
  'rich-message-field': '@windmorph/react-pro/rich-text',
};

/** The entry a component page's exports come from. */
export function importEntry(meta: Pick<ComponentMeta, 'slug' | 'pro'>): ImportEntry {
  return ENTRY_BY_SLUG[meta.slug] ?? (meta.pro ? '@windmorph/react-pro' : '@windmorph/react');
}

/** The names a component page documents: its components, then its hooks. */
export function importNames(meta: Pick<ComponentMeta, 'propsComponents' | 'hooks'>): string[] {
  return [...new Set([...meta.propsComponents, ...(meta.hooks ?? [])])];
}

/**
 * The import statement for everything a component page documents, as the page shows it
 * under its title: `import { Fab, ExtendedFab } from '@windmorph/react';`.
 */
export function importLine(
  meta: Pick<ComponentMeta, 'slug' | 'pro' | 'propsComponents' | 'hooks'>,
): string {
  return `import { ${importNames(meta).join(', ')} } from '${importEntry(meta)}';`;
}
