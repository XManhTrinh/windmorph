// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { componentTokenList, type ComponentTokenSet } from '../src/tokens/component';
import {
  componentTokenNames,
  discoverComponentTokenSets,
  type DiscoveredTokenSet,
} from './lib/component-tokens';

/*
 * The core's component tokens, checked statically: every private variable a class reads is
 * defined, every defined one is read, every scope value declares the same parts, the
 * checked-in name list is current, and every public name is one of M3's.
 */

const SRC = new URL('../src/', import.meta.url);

/** M3's words for states; Compose's (`hovered`, `focused`) never appear in a name. */
const COMPOSE_WORDS = /-(hovered|focused)(-|$)/;

let discovered: DiscoveredTokenSet[];
/** Every `--_md-comp-…` variable read in the package's sources and stylesheets, by file. */
const reads = new Map<string, Set<string>>();

beforeAll(async () => {
  discovered = await discoverComponentTokenSets();
  const files = (await readdir(SRC, { recursive: true })).filter(
    (file) =>
      (/\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file) && !/-tokens\.ts$/.test(file)) ||
      file === 'styles/utilities.css',
  );
  for (const file of files) {
    const text = await readFile(new URL(file, SRC), 'utf8');
    for (const [variable] of text.matchAll(/--_md-comp-[a-z0-9-]*[a-z0-9]/g)) {
      reads.set(variable, (reads.get(variable) ?? new Set()).add(file));
    }
  }
});

/** The private parts a set declares: its tokens, derived values and every scope's parts. */
function declaredParts(set: ComponentTokenSet): Set<string> {
  return new Set([
    ...Object.keys(set.tokens),
    ...Object.keys(set.derived ?? {}),
    ...Object.values(set.scopes ?? {}).flatMap((values) =>
      Object.values(values).flatMap((scope) => [
        ...Object.keys(scope.tokens ?? {}),
        ...Object.keys(scope.fixed ?? {}),
      ]),
    ),
  ]);
}

/** The set a private variable belongs to: the one with the longest matching name. */
function owner(variable: string): ComponentTokenSet | undefined {
  return discovered
    .map(({ set }) => set)
    .filter((set) => variable.startsWith(`--_${set.name}-`))
    .sort((a, b) => b.name.length - a.name.length)[0];
}

describe('component tokens', () => {
  it('finds the token sets', () => {
    expect(discovered.length).toBeGreaterThan(0);
  });

  it('exports every set from the main entry', async () => {
    const index = await readFile(new URL('index.ts', SRC), 'utf8');
    const missing = discovered.filter(
      ({ exportName }) => !new RegExp(`\\b${exportName}\\b`).test(index),
    );
    expect(missing.map(({ file, exportName }) => `${file}: ${exportName}`)).toEqual([]);
  });

  it('reads only private variables a set defines', () => {
    const undefinedReads = [...reads].flatMap(([variable, files]) => {
      const set = owner(variable);
      const part = set && variable.slice(`--_${set.name}-`.length);
      return set && part && declaredParts(set).has(part)
        ? []
        : [`${variable} (in ${[...files].join(', ')})`];
    });
    expect(undefinedReads).toEqual([]);
  });

  it('reads every part a set defines', () => {
    const derivedText = discovered
      .flatMap(({ set }) => Object.values(set.derived ?? {}))
      .join('\n');
    const unread = discovered.flatMap(({ set }) =>
      [...declaredParts(set)]
        .map((part) => `--_${set.name}-${part}`)
        .filter((variable) => !reads.has(variable) && !derivedText.includes(`${variable})`)),
    );
    expect(unread, 'a token nothing reads: read it in a class or remove it').toEqual([]);
  });

  it('declares the same parts in every value of a scoping attribute', () => {
    const gaps = discovered.flatMap(({ set }) =>
      Object.entries(set.scopes ?? {}).flatMap(([attribute, values]) => {
        const partsOf = (scope: (typeof values)[string]) =>
          new Set([...Object.keys(scope.tokens ?? {}), ...Object.keys(scope.fixed ?? {})]);
        const all = new Set(Object.values(values).flatMap((scope) => [...partsOf(scope)]));
        return Object.entries(values).flatMap(([value, scope]) =>
          [...all]
            .filter((part) => !partsOf(scope).has(part) && !(part in set.tokens))
            .map((part) => `${set.name} [data-${attribute}="${value}"] lacks ${part}`),
        );
      }),
    );
    expect(gaps, 'declare the part as a token or a `fixed` value').toEqual([]);
  });

  it('documents every token and says where it paints', () => {
    const incomplete = discovered.flatMap(({ set }) =>
      componentTokenList(set)
        .filter(({ description, paints }) => !description || !paints?.property)
        .map(({ name }) => name),
    );
    expect(incomplete).toEqual([]);
  });

  it('names every token in M3 form', () => {
    const names = discovered.flatMap(({ set }) => componentTokenList(set).map(({ name }) => name));
    expect(names.filter((name) => !/^--md-comp-[a-z0-9]+(-[a-z0-9]+)*$/.test(name))).toEqual([]);
    expect(names.filter((name) => COMPOSE_WORDS.test(name))).toEqual([]);
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  it('uses only names from the M3 token tables (scripts/m3-token-names.txt)', async () => {
    const m3 = new Set(
      (await readFile(new URL('m3-token-names.txt', import.meta.url), 'utf8'))
        .split('\n')
        .filter((line) => line.startsWith('md.comp.'))
        .map((name) => `--${name.replaceAll('.', '-')}`),
    );
    const unverified = discovered.flatMap(({ set }) =>
      componentTokenList(set)
        .map(({ name }) => name)
        .filter((name) => !m3.has(name)),
    );
    expect(unverified, "a name that isn't an active M3 token name").toEqual([]);
  });

  it('keeps component-tokens.txt current (run `pnpm generate`)', async () => {
    const file = await readFile(new URL('../component-tokens.txt', import.meta.url), 'utf8');
    expect(file).toBe(`${componentTokenNames(discovered)}\n`);
  });
});
