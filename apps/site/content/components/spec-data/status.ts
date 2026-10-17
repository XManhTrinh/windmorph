import { exampleAnchor } from '../../../lib/example-anchor';
import { componentTabHref } from '../doc';
import type { ComponentSpecData, SpecItemKind } from './types';

/** Where one row of a spec status stands. */
export type SpecStatusKind = 'built' | 'differs' | 'extension' | 'not-built';

/** The label each status shows. */
export const SPEC_STATUS_LABELS: Record<SpecStatusKind, string> = {
  built: 'Built',
  differs: 'Differs',
  extension: 'Extension',
  'not-built': 'Not built',
};

/** A live example a row links to, on the component's Overview tab. */
export interface SpecExampleLink {
  id: string;
  label: string;
  href: string;
}

/** One row of a component's spec status table. */
export interface SpecStatusRow {
  item: string;
  status: SpecStatusKind;
  /** For a covered item: the spec table it comes from. */
  kind?: SpecItemKind;
  /** For a difference, an extension or a gap: what Windmorph does, and why. */
  note?: string;
  /** For a covered item: the examples that show it. */
  examples?: SpecExampleLink[];
}

/**
 * A readable name for an example from its id: the file name without the words it shares with
 * its folder (`button-group/button-group-connected` → "Connected", `toolbars/toolbar-docked`
 * → "Docked").
 */
export function exampleLabel(id: string): string {
  const [folder = '', file = ''] = id.split('/');
  const folderWords = new Set(folder.split('-').flatMap((word) => [word, word.replace(/s$/, '')]));
  const words = file.split('-');
  while (words.length > 1 && folderWords.has(words[0]!)) words.shift();
  const label = words.join(' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * A component's spec status, row by row: what it covers (each with its examples), then its
 * differences, its extensions and what isn't built.
 */
export function specStatusRows(slug: string, data: ComponentSpecData): SpecStatusRow[] {
  const overview = componentTabHref(slug);
  return [
    ...data.covers.map((item): SpecStatusRow => ({
      item: item.name,
      status: 'built',
      kind: item.kind,
      examples: item.examples.map((id) => ({
        id,
        label: exampleLabel(id),
        href: `${overview}#${exampleAnchor(id)}`,
      })),
    })),
    ...(data.differences ?? []).map((note): SpecStatusRow => ({
      item: note.item,
      status: 'differs',
      note: note.note,
    })),
    ...(data.extensions ?? []).map((note): SpecStatusRow => ({
      item: note.item,
      status: 'extension',
      note: note.note,
    })),
    ...(data.notBuilt ?? []).map((note): SpecStatusRow => ({
      item: note.item,
      status: 'not-built',
      note: note.note,
    })),
  ];
}
