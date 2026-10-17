import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import * as windmorph from '@windmorph/react';
import { isComponentTokenSet } from '@windmorph/react';
import * as pro from '@windmorph/react-pro';
import * as proRichText from '@windmorph/react-pro/rich-text';
import { describe, expect, it } from 'vitest';

/**
 * Every M3 token set the core exports has its generated Tokens table on exactly one component
 * page: the set is listed in that page's `tokens: […]`. Every Windmorph Pro token set
 * (`--wm-*`) has its table on a Pro page, drawn in the page's theming section with
 * `<TokenTable set={…} />`.
 */

const contentDir = resolve(process.cwd(), 'content/components');

const exportedSets = Object.entries(windmorph)
  .filter(([, value]) => isComponentTokenSet(value))
  .filter(([, value]) => (value as { name: string }).name.startsWith('md-comp-'))
  .map(([name]) => name);

const proSets = [...Object.entries(pro), ...Object.entries(proRichText)]
  .filter(([, value]) => isComponentTokenSet(value))
  .filter(([, value]) => (value as { name: string }).name.startsWith('wm-'))
  .map(([name]) => name);

/** Each page file's `<TokenTable set={name}` names. */
function tokenTables(): Map<string, string[]> {
  const pages = new Map<string, string[]>();
  for (const file of readdirSync(contentDir).filter((name) => name.endsWith('.tsx'))) {
    const source = readFileSync(resolve(contentDir, file), 'utf8');
    for (const [, name] of source.matchAll(/<TokenTable\s+set=\{(\w+)\}/g)) {
      pages.set(name!, [...(pages.get(name!) ?? []), file]);
    }
  }
  return pages;
}

/** Each page file's `tokens: [a, b]` export names. */
function listedSets(): Map<string, string[]> {
  const pages = new Map<string, string[]>();
  for (const file of readdirSync(contentDir).filter((name) => name.endsWith('.tsx'))) {
    const source = readFileSync(resolve(contentDir, file), 'utf8');
    for (const [, list] of source.matchAll(/\btokens:\s*\[([^\]]*)\]/g)) {
      for (const name of list!
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)) {
        pages.set(name, [...(pages.get(name) ?? []), file]);
      }
    }
  }
  return pages;
}

describe('component token tables', () => {
  const listed = listedSets();

  it('finds the exported sets', () => {
    expect(exportedSets).toContain('cardTokenSet');
  });

  it('lists every exported set on exactly one page', () => {
    const wrong = exportedSets.flatMap((name) => {
      const pages = listed.get(name) ?? [];
      return pages.length === 1 ? [] : [`${name}: on ${pages.length} pages (${pages.join(', ')})`];
    });
    expect(wrong).toEqual([]);
  });

  it('lists only exported sets', () => {
    expect([...listed.keys()].filter((name) => !exportedSets.includes(name))).toEqual([]);
  });

  it('draws every Pro token set on a page', () => {
    const drawn = tokenTables();
    expect(proSets).toContain('collapseTokenSet');
    expect(proSets.filter((name) => !drawn.has(name))).toEqual([]);
  });

  it('draws only exported Pro sets', () => {
    expect([...tokenTables().keys()].filter((name) => !proSets.includes(name))).toEqual([]);
  });
});
