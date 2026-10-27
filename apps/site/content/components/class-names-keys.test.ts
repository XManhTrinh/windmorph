import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import type { ComponentPropsFile } from '../../lib/component-props';

/**
 * Every `classNames` slot of every core component is documented: the props list's
 * `classNames` keys (from the generated props JSON, `pnpm --filter site generate`) match the
 * prop's type exactly, read here independently from the library's TypeScript sources.
 */

const uiRoot = resolve(process.cwd(), '../../packages/react');
const entry = resolve(uiRoot, 'src/index.ts');

/**
 * For each of the core's component exports (callable PascalCase values) with a `classNames`
 * prop, that prop's keys.
 */
function coreSlots(): { slots: Map<string, string[]> } {
  const tsconfigPath = resolve(uiRoot, 'tsconfig.json');
  const config = ts.readConfigFile(tsconfigPath, (path) => ts.sys.readFile(path));
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, uiRoot);
  const program = ts.createProgram({ rootNames: [entry], options });
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!)!;
  const slots = new Map<string, string[]>();
  for (const symbol of checker.getExportsOfModule(module)) {
    const name = symbol.getName();
    if (!/^[A-Z][a-z]/.test(name) || !(symbol.flags & ts.SymbolFlags.Alias)) continue;
    const target = checker.getAliasedSymbol(symbol);
    if (!(target.flags & ts.SymbolFlags.Value)) continue;
    const type = checker.getTypeOfSymbol(target);
    const [signature] = type.getCallSignatures();
    const props = signature?.getParameters()[0];
    if (!props) continue;
    const propsType = checker.getTypeOfSymbol(props);
    const classNames = checker.getPropertyOfType(propsType, 'classNames');
    if (!classNames) continue;
    const slotType = checker.getNonNullableType(checker.getTypeOfSymbol(classNames));
    slots.set(
      name,
      checker.getPropertiesOfType(slotType).map((slot) => slot.getName()),
    );
  }
  return { slots };
}

/** The `classNames` keys the generated props JSON lists for a component, as slot names. */
function documentedSlots(name: string): string[] | undefined {
  const file = resolve(process.cwd(), '.generated/props', `${name}.json`);
  if (!existsSync(file)) return undefined;
  const json = JSON.parse(readFileSync(file, 'utf8')) as ComponentPropsFile;
  return json.props
    .find((prop) => prop.name === 'classNames')
    ?.keys?.map((key) => key.name.slice('classNames.'.length));
}

describe('classNames slots', () => {
  const { slots: core } = coreSlots();

  it('finds the core components with classNames', () => {
    expect(core.get('Button')).toEqual(['root', 'content', 'label', 'icon', 'pendingIndicator']);
  });

  it("lists every core component's slots exactly, as its classNames keys", () => {
    const wrong = [...core].flatMap(([name, slots]) => {
      const listed = documentedSlots(name);
      if (!listed) return [`${name}: no classNames keys`];
      const missing = slots.filter((slot) => !listed.includes(slot));
      const extra = listed.filter((slot) => !slots.includes(slot));
      return missing.length || extra.length || listed.length !== slots.length
        ? [`${name}: missing [${missing.join(', ')}], extra [${extra.join(', ')}]`]
        : [];
    });
    expect(wrong).toEqual([]);
  });
});
