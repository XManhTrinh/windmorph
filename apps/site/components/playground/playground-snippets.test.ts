import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import type { PropsRecord } from '../../lib/component-props';
import { changeHandlerOf } from './code-emit';
import { PLAYGROUND_DESCRIPTORS } from './descriptors';
import { playgroundSnippets } from './playground-state';

/**
 * Every snippet a playground copies works when pasted: no element sets a controlled prop
 * (`selected`, `open`, `value`, `expanded`…, any prop with an `on<Prop>Change` handler)
 * without that handler, which would freeze it. The snippet writes the `default<Prop>` twin, or
 * keeps the value in a `useState` pair. A navigation item marked `selected` comes with the
 * `onPress` that moves the selection.
 */

const propsDir = resolve(process.cwd(), '.generated/props');

/** A component's generated props, or `undefined` for anything else (an HTML element). */
function readProps(name: string): PropsRecord[] | undefined {
  const file = resolve(propsDir, `${name}.json`);
  if (!existsSync(file)) return undefined;
  const json = JSON.parse(readFileSync(file, 'utf8')) as { props?: PropsRecord[] };
  return json.props;
}

/** Props whose value only an event outside the prop's own handler moves. */
const MOVED_BY: Record<string, Record<string, string>> = {
  NavigationBarItem: { selected: 'onPress' },
  NavigationRailItem: { selected: 'onPress' },
};

/** Each element of a snippet that sets a controlled prop without its handler. */
export function stuckProps(code: string): string[] {
  const source = ts.createSourceFile('snippet.tsx', code, ts.ScriptTarget.Latest, true, 4);
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      const props = readProps(tag);
      const names = node.attributes.properties.flatMap((attribute) =>
        ts.isJsxAttribute(attribute) ? [attribute.name.getText(source)] : [],
      );
      if (props) {
        const declared = props.map((prop) => prop.name);
        for (const name of names) {
          const handler = MOVED_BY[tag]?.[name] ?? changeHandlerOf(name, declared);
          if (handler && declared.includes(handler) && !names.includes(handler)) {
            found.push(`<${tag} ${name}> without ${handler}`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe('playground snippets', () => {
  it('reads the generated props', () => {
    expect(existsSync(propsDir)).toBe(true);
  });

  it('flags a controlled prop written without its handler', () => {
    expect(stuckProps('<Checkbox selected>Terms</Checkbox>')).toEqual([
      '<Checkbox selected> without onSelectedChange',
    ]);
    expect(stuckProps('<Checkbox defaultSelected>Terms</Checkbox>')).toEqual([]);
    expect(stuckProps('<TextField label="Name" value="Alex" />')).toEqual([
      '<TextField value> without onChange',
    ]);
  });

  for (const [slug, descriptor] of Object.entries(PLAYGROUND_DESCRIPTORS)) {
    it(`${slug}: never writes a controlled prop without its handler`, () => {
      const names = [
        descriptor.component,
        ...Object.values(descriptor.componentSwitch?.components ?? {}),
      ];
      const componentProps = Object.fromEntries(names.map((name) => [name, readProps(name) ?? []]));
      const stuck = [
        ...new Set(playgroundSnippets(descriptor, componentProps).flatMap(stuckProps)),
      ];
      expect(stuck).toEqual([]);
    });
  }
});
