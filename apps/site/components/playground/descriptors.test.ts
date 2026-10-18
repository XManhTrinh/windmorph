import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import type { PropsRecord } from '../../lib/component-props';
import { CONTROL_GROUPS, inferControls } from './controls-model';
import { activeComponent, initialValues, playgroundControls } from './playground-state';
import { PLAYGROUND_DESCRIPTORS } from './descriptors';

/** Reads a generated props JSON if present (it is produced by `generate`). */
function readProps(name: string): PropsRecord[] | null {
  const file = resolve(process.cwd(), '.generated/props', `${name}.json`);
  if (!existsSync(file)) return null;
  return (JSON.parse(readFileSync(file, 'utf8')) as { props: PropsRecord[] }).props;
}

const fullPages = COMPONENT_META.filter((meta) => meta.playground === 'full');

describe('playground descriptors', () => {
  it('every full-playground page has a descriptor keyed by its slug', () => {
    for (const meta of fullPages) {
      expect(
        PLAYGROUND_DESCRIPTORS[meta.slug],
        `${meta.slug} is 'full' but has no descriptor`,
      ).toBeDefined();
    }
  });

  it('every descriptor is keyed by a full-playground slug', () => {
    const fullSlugs = new Set(fullPages.map((meta) => meta.slug));
    for (const slug of Object.keys(PLAYGROUND_DESCRIPTORS)) {
      expect(fullSlugs.has(slug), `descriptor "${slug}" has no 'full' catalog page`).toBe(true);
    }
  });

  it('every surfaced enum control resolves a non-empty option list', () => {
    for (const meta of fullPages) {
      const descriptor = PLAYGROUND_DESCRIPTORS[meta.slug];
      if (!descriptor) continue;
      const props = readProps(meta.propsComponents[0]!);
      if (!props) continue; // JSON not generated in this run; covered by build.
      const controls = inferControls(props, descriptor.surfacedProps, descriptor.enumOptions);
      for (const control of controls) {
        if (control.kind === 'enum') {
          expect(
            control.options?.length ?? 0,
            `${meta.slug}.${control.name} is an enum with no options`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  /** A playground's controls, with every component it can show or slot in read. */
  function controlsOf(slug: string) {
    const descriptor = PLAYGROUND_DESCRIPTORS[slug]!;
    const names = [
      descriptor.component,
      ...Object.values(descriptor.componentSwitch?.components ?? {}),
      ...Object.values(descriptor.slotComponents ?? {}),
    ];
    const componentProps = Object.fromEntries(names.map((name) => [name, readProps(name) ?? []]));
    return {
      descriptor,
      all: playgroundControls(descriptor, componentProps, descriptor.component, true),
      shown: playgroundControls(
        descriptor,
        componentProps,
        activeComponent(descriptor, initialValues(descriptor)),
      ),
    };
  }

  it('every control lands in a panel section, and overrides name real controls', () => {
    for (const meta of fullPages) {
      if (!readProps(meta.propsComponents[0]!)) continue;
      const { descriptor, all } = controlsOf(meta.slug);
      for (const def of all) {
        expect(CONTROL_GROUPS, `${meta.slug}.${def.name} has no section`).toContain(def.group);
      }
      for (const [name, group] of Object.entries(descriptor.groups ?? {})) {
        expect(descriptor.surfacedProps, `${meta.slug}: groups names ${name}`).toContain(name);
        expect(CONTROL_GROUPS).toContain(group);
      }
      // Advanced is folded, so something always shows unfolded.
      expect(
        all.some((def) => def.group !== 'advanced'),
        `${meta.slug} shows only Advanced`,
      ).toBe(true);
    }
  });

  it('every number control has a slider range that holds its starting value', () => {
    for (const meta of fullPages) {
      if (!readProps(meta.propsComponents[0]!)) continue;
      const { descriptor, all } = controlsOf(meta.slug);
      const start = initialValues(descriptor);
      for (const def of all.filter((control) => control.kind === 'number' && !control.numeric)) {
        expect(def.range, `${meta.slug}.${def.name} needs a numberRanges entry`).toBeDefined();
        const { min, max } = def.range!;
        expect(min, `${meta.slug}.${def.name}`).toBeLessThan(max);
        const value = start[def.name];
        if (typeof value === 'number') {
          expect(value, `${meta.slug}.${def.name} starts outside its range`).toBeGreaterThanOrEqual(
            min,
          );
          expect(value, `${meta.slug}.${def.name} starts outside its range`).toBeLessThanOrEqual(
            max,
          );
        }
      }
      for (const name of Object.keys(descriptor.numberRanges ?? {})) {
        expect(
          all.find((def) => def.name === name)?.kind,
          `${meta.slug}: numberRanges names ${name}, which is no number control`,
        ).toBe('number');
      }
    }
  });

  it("every prop's control links to its entry in the API tab", () => {
    for (const meta of fullPages) {
      if (!readProps(meta.propsComponents[0]!)) continue;
      const { descriptor, shown } = controlsOf(meta.slug);
      for (const def of shown) {
        if (def.name === descriptor.componentSwitch?.control) {
          expect(def.description, `${meta.slug}.${def.name}`).toBeTruthy();
          continue;
        }
        // A prop React Aria adds can be missing from the generated props.
        if (!def.docsComponent) continue;
        expect(meta.propsComponents, `${meta.slug}.${def.name}`).toContain(def.docsComponent);
        expect(
          readProps(def.docsComponent)!.some((prop) => prop.name === def.docsProp),
          `${meta.slug}.${def.name}`,
        ).toBe(true);
      }
    }
  });
});
