import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { COMPONENT_SLOTS } from './slots';

/**
 * The `classNames` slots listed for each core component match its `classNames` prop's type
 * exactly, read from the library's TypeScript sources, so the props tables never drift.
 */

const uiRoot = resolve(process.cwd(), '../../packages/react');
const entry = resolve(uiRoot, 'src/index.ts');

/**
 * The core's component exports (callable PascalCase values), and for each one with a
 * `classNames` prop, that prop's keys.
 */
function coreSlots(): { components: Set<string>; slots: Map<string, string[]> } {
  const tsconfigPath = resolve(uiRoot, 'tsconfig.json');
  const config = ts.readConfigFile(tsconfigPath, (path) => ts.sys.readFile(path));
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, uiRoot);
  const program = ts.createProgram({ rootNames: [entry], options });
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry)!)!;
  const components = new Set<string>();
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
    components.add(name);
    const propsType = checker.getTypeOfSymbol(props);
    const classNames = checker.getPropertyOfType(propsType, 'classNames');
    if (!classNames) continue;
    const slotType = checker.getNonNullableType(checker.getTypeOfSymbol(classNames));
    slots.set(
      name,
      checker.getPropertiesOfType(slotType).map((slot) => slot.getName()),
    );
  }
  return { components, slots };
}

describe('classNames slots', () => {
  const { components, slots: core } = coreSlots();

  it('finds the core components with classNames', () => {
    expect(core.get('Button')).toEqual(['root', 'content', 'label', 'icon']);
  });

  it('lists no slots for a core component without classNames', () => {
    const listed = Object.keys(COMPONENT_SLOTS).filter((name) => components.has(name));
    expect(listed.filter((name) => !core.has(name))).toEqual([]);
  });

  it('lists every core component’s slots exactly', () => {
    const wrong = [...core].flatMap(([name, slots]) => {
      const listed = COMPONENT_SLOTS[name];
      if (!listed) return [`${name}: not listed`];
      const missing = slots.filter((slot) => !listed.includes(slot));
      const extra = listed.filter((slot) => !slots.includes(slot));
      return missing.length || extra.length || listed.length !== slots.length
        ? [`${name}: missing [${missing.join(', ')}], extra [${extra.join(', ')}]`]
        : [];
    });
    expect(wrong).toEqual([]);
  });
});
