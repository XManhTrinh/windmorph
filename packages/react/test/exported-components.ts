import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/**
 * The package's public components and their props, read with the TypeScript checker, so
 * props a component inherits from React Aria or React Stately count too, not only the ones
 * its file names. Shared by the tests that check every component's API.
 */
const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
export const ENTRIES = ['index.ts', 'primitives.ts', 'next.ts'].map((file) => join(src, file));

export const program = ts.createProgram(ENTRIES, {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  types: [],
});
export const checker = program.getTypeChecker();

export interface Component {
  name: string;
  props: Map<string, ts.Type>;
}

/** The exported components: functions named in PascalCase whose first parameter is props. */
export function exportedComponents(): Component[] {
  const found = new Map<string, Component>();
  for (const entry of ENTRIES) {
    const file = program.getSourceFile(entry);
    const moduleSymbol = file && checker.getSymbolAtLocation(file);
    if (!moduleSymbol) throw new Error(`No module for ${entry}`);
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const symbol =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      // Functions, and constants typed as components (the collection items, React Stately's
      // `Item` and `Section` under the library's names).
      const callable = symbol.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable);
      if (!/^[A-Z]/.test(exported.name) || !callable || exported.name.endsWith('Context')) continue;
      const declaration = symbol.valueDeclaration;
      if (!declaration) continue;
      const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
      const signature = type.getCallSignatures()[0];
      const param = signature?.getParameters()[0];
      if (!param) continue;
      const propsType = checker.getTypeOfSymbolAtLocation(param, declaration);
      const members = propsType.isUnion() ? propsType.types : [propsType];
      const props = new Map<string, ts.Type>();
      for (const member of members) {
        for (const prop of checker.getPropertiesOfType(checker.getApparentType(member))) {
          props.set(prop.name, checker.getTypeOfSymbolAtLocation(prop, declaration));
        }
      }
      if (props.size === 0) continue;
      // A component renders JSX; a hook or helper with an options object doesn't count.
      const returns = checker.typeToString(signature.getReturnType());
      if (!/Element|ReactNode|JSX/.test(returns)) continue;
      found.set(exported.name, { name: exported.name, props });
    }
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}
