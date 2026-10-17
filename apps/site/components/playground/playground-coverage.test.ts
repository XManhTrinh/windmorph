import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import type { PropsRecord } from '../../lib/component-props';
import { PLAYGROUND_DESCRIPTORS, type PlaygroundDescriptor } from './descriptors';

/**
 * Every public prop of every component a playground renders has a control, so the playground
 * covers the page's whole API: its component, the siblings its `componentSwitch` switches to
 * and its slots' components. A new prop without a control fails here until it gets one, or is
 * added to its descriptor's `notControlled` allowlist with the reason it can't have one. The
 * page's other documented components need a reason in `notRendered`.
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
    // Accessibility names and ids.
    name.startsWith('aria-') ||
    name === 'id' ||
    // Render props and other functions (`filter`, `renderValue`, `isDateUnavailable`).
    /=>/.test(type) ||
    // React Aria's props passed through (form names, validation, focus and press events,
    // selection keys): wiring and behaviour, listed in the props table's Inherited group.
    prop.inherited === true ||
    // Required props (a FAB's `icon`, a picker dialog's `confirmButton`): the preview always
    // passes one and the snippet always writes it, so there is nothing to switch.
    prop.required
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

  /** The public props of `component` with no control, read as `prefix + name`. */
  function uncovered(
    component: string,
    prefix: string,
    surfaced: Set<string>,
    allowed: Record<string, string>,
  ): string[] {
    return readProps(component)
      .filter((prop) => !isExempt(prop))
      .map((prop) => ({ ...prop, name: `${prefix}${prop.name}` }))
      .filter((prop) => !surfaced.has(prop.name))
      .filter(
        (prop) =>
          !twinsOf(prop.name.slice(prefix.length)).some((twin) => surfaced.has(prefix + twin)),
      )
      .filter((prop) => !(prop.name in allowed))
      .map((prop) => prop.name);
  }

  /** The components a descriptor renders with controls: its own and its switch's siblings. */
  function rendered(descriptor: PlaygroundDescriptor): string[] {
    return [
      ...new Set([
        descriptor.component,
        ...Object.values(descriptor.componentSwitch?.components ?? {}),
      ]),
    ];
  }

  for (const meta of fullPages) {
    const descriptor = PLAYGROUND_DESCRIPTORS[meta.slug];
    it(`${meta.slug}: every public prop of the components it renders has a control`, () => {
      expect(descriptor, `${meta.slug} is 'full' but has no descriptor`).toBeDefined();
      if (!descriptor) return;
      const surfaced = new Set(descriptor.surfacedProps);
      const allowed = descriptor.notControlled ?? {};
      const missing = [
        ...rendered(descriptor).flatMap((component) => uncovered(component, '', surfaced, allowed)),
        // A slot's own component (`fab: 'ToolbarFab'`) has `fab.prop` controls.
        ...Object.entries(descriptor.slotComponents ?? {}).flatMap(([slot, component]) =>
          uncovered(component, `${slot}.`, surfaced, allowed),
        ),
      ];
      expect(
        missing,
        `${descriptor.component} props with no control on /components/${meta.slug}: add a ` +
          'control, or list the prop in its notControlled with the reason',
      ).toEqual([]);
    });

    it(`${meta.slug}: renders every documented component, or says why not`, () => {
      if (!descriptor) return;
      const covered = new Set([
        ...rendered(descriptor),
        ...Object.values(descriptor.slotComponents ?? {}),
      ]);
      const notRendered = descriptor.notRendered ?? {};
      expect(
        meta.propsComponents.filter((name) => !covered.has(name) && !(name in notRendered)),
        `components on /components/${meta.slug} the playground neither renders nor explains: ` +
          'add them to its componentSwitch or slotComponents, or to notRendered with the reason',
      ).toEqual([]);
      for (const [name, reason] of Object.entries(notRendered)) {
        expect(meta.propsComponents, `${meta.slug}: ${name} is not on the page`).toContain(name);
        expect(covered.has(name), `${meta.slug}: ${name} is rendered already`).toBe(false);
        expect(reason.length, `${meta.slug}: ${name} needs a reason`).toBeGreaterThan(10);
      }
    });

    it(`${meta.slug}: switches only to components on the page`, () => {
      if (!descriptor?.componentSwitch) return;
      const { control, components } = descriptor.componentSwitch;
      expect(Object.values(components)[0]).toBe(descriptor.component);
      expect(descriptor.surfacedProps).toContain(control);
      for (const name of Object.values(components)) expect(meta.propsComponents).toContain(name);
    });
  }

  it('allowlists only props that exist and have no control, each with a reason', () => {
    for (const [slug, descriptor] of Object.entries(PLAYGROUND_DESCRIPTORS)) {
      for (const [name, reason] of Object.entries(descriptor.notControlled ?? {})) {
        const [slot, slotProp] = name.includes('.') ? name.split('.') : [undefined, name];
        const components = slot
          ? [descriptor.slotComponents?.[slot]].filter((value) => value !== undefined)
          : rendered(descriptor);
        expect(components.length, `${slug}: ${name} names no slot component`).toBeGreaterThan(0);
        const candidates = components
          .flatMap((component) => readProps(component))
          .filter((candidate) => candidate.name === slotProp);
        expect(
          candidates.length,
          `${slug}: ${name} is not a prop of ${components.join(' or ')}`,
        ).toBeGreaterThan(0);
        // A prop siblings share needs the reason while any of them takes it unexempted.
        expect(
          candidates.length > 0 && candidates.every(isExempt),
          `${slug}: ${name} is exempt already`,
        ).toBe(false);
        expect(descriptor.surfacedProps, `${slug}: ${name} has a control now`).not.toContain(name);
        expect(reason.length, `${slug}: ${name} needs a reason`).toBeGreaterThan(10);
      }
    }
  });
});
