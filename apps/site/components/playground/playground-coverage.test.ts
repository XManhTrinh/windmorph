import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import type { PropsRecord } from '../../lib/component-props';
import { PLAYGROUND_DESCRIPTORS } from './descriptors';

/**
 * Every public prop of a playground's component has a control, so the playground covers the
 * component's whole API. A new prop without a control fails here until it gets one, or is
 * added to its descriptor's `notControlled` allowlist with the reason it can't have one.
 */

/** A playground component's props, from the generated JSON (`pnpm --filter site generate`). */
function readProps(name: string): PropsRecord[] {
  const file = resolve(process.cwd(), '.generated/props', `${name}.json`);
  if (!existsSync(file)) {
    throw new Error(`No generated props for ${name}: run \`pnpm --filter site generate\` first.`);
  }
  return (JSON.parse(readFileSync(file, 'utf8')) as { props: PropsRecord[] }).props;
}

/**
 * Props no playground controls, whatever the component: callbacks, refs, children, styling
 * hooks, translated strings, accessibility names and ids. A playground shows what a prop
 * looks like; these change behaviour or wiring, not the look.
 */
function isExempt(prop: PropsRecord): boolean {
  const { name, type } = prop;
  return (
    // Callbacks.
    /^on[A-Z]/.test(name) ||
    // Refs: `ref`, and `inputRef`, `triggerRef`… typed as a ref.
    name === 'ref' ||
    /^(?:React\.)?(?:Ref|RefObject)</.test(type) ||
    name === 'children' ||
    // Styling: classes and inline styles go on the snippet, not a control.
    name === 'className' ||
    name === 'classNames' ||
    name === 'style' ||
    // Translated strings.
    name === 'labels' ||
    name === 'strings' ||
    // Accessibility names and ids.
    name.startsWith('aria-') ||
    name === 'id' ||
    // Render props and other functions (`filter`, `renderValue`, `isDateUnavailable`).
    /=>/.test(type)
  );
}

/**
 * `defaultFoo` is the uncontrolled twin of `foo` (or `isFoo`, as React Aria names some): once
 * that has a control, the playground shows everything `defaultFoo` can (`defaultSelected` →
 * `selected`, `defaultOpen` → `open` or `isOpen`).
 */
function twinsOf(name: string): string[] {
  const match = /^default([A-Z]\w*)$/.exec(name);
  if (!match) return [];
  const rest = match[1]!;
  return [rest.charAt(0).toLowerCase() + rest.slice(1), `is${rest}`];
}

describe('playground coverage', () => {
  const fullPages = COMPONENT_META.filter((meta) => meta.playground === 'full');

  for (const meta of fullPages) {
    const descriptor = PLAYGROUND_DESCRIPTORS[meta.slug];
    it(`${meta.slug}: every public prop of its component has a control`, () => {
      expect(descriptor, `${meta.slug} is 'full' but has no descriptor`).toBeDefined();
      if (!descriptor) return;
      const surfaced = new Set(descriptor.surfacedProps);
      const allowed = descriptor.notControlled ?? {};
      const missing = readProps(descriptor.component)
        .filter((prop) => !isExempt(prop))
        .filter((prop) => !surfaced.has(prop.name))
        .filter((prop) => !twinsOf(prop.name).some((twin) => surfaced.has(twin)))
        .filter((prop) => !(prop.name in allowed))
        .map((prop) => prop.name);
      expect(
        missing,
        `${descriptor.component} props with no control on /components/${meta.slug}: add a ` +
          'control, or list the prop in its notControlled with the reason',
      ).toEqual([]);
    });
  }

  it('allowlists only props that exist and have no control, each with a reason', () => {
    for (const [slug, descriptor] of Object.entries(PLAYGROUND_DESCRIPTORS)) {
      const names = new Set(readProps(descriptor.component).map((prop) => prop.name));
      for (const [name, reason] of Object.entries(descriptor.notControlled ?? {})) {
        expect(names.has(name), `${slug}: ${name} is not a prop of ${descriptor.component}`).toBe(
          true,
        );
        expect(descriptor.surfacedProps, `${slug}: ${name} has a control now`).not.toContain(name);
        expect(reason.length, `${slug}: ${name} needs a reason`).toBeGreaterThan(10);
      }
    }
  });
});
