/**
 * Documents the public hooks as functions, from the same TypeScript public API the props
 * tables come from: each hook's parameters (an options object is listed field by field) and
 * what it returns (an object's fields, or its type). `generate-props` writes the result next
 * to the components' props JSON, so a page's API tab renders a hook like a component.
 */
import ts from 'typescript';
import type { PropsRecord } from './generate-props';

/** A documented hook: its signature, its parameters and what it returns. */
export interface HookDocFile {
  displayName: string;
  kind: 'hook';
  description: string;
  /** The call signature, e.g. `useToolbarScrollExit(options?: ToolbarScrollExitOptions): boolean`. */
  signature: string;
  /** One row per parameter, or per field of an options-object parameter (`options.reverse`). */
  params: PropsRecord[];
  /** The return type, with one row per field when it's an object. */
  returns: { type: string; description?: string; fields: PropsRecord[] };
}

/** The flags that print a type the way a reader writes it, without import paths. */
const TYPE_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.UseFullyQualifiedType;

/** JSDoc text as plain text: `{@link Name}` reads as the code name `Name`. */
export function docText(parts: ts.SymbolDisplayPart[]): string {
  return ts
    .displayPartsToString(parts)
    .replace(/\{@link(?:code|plain)?\s+([^}\s|]+)[^}]*\}/g, '`$1`')
    .trim();
}

/** A symbol's JSDoc text, with `@default` pulled out. */
export function docsOf(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): { description?: string; defaultValue?: string } {
  const description = docText(symbol.getDocumentationComment(checker));
  const defaultTag = symbol.getJsDocTags(checker).find((tag) => tag.name === 'default');
  const defaultValue = defaultTag?.text ? ts.displayPartsToString(defaultTag.text).trim() : '';
  return {
    ...(description ? { description } : {}),
    ...(defaultValue ? { defaultValue } : {}),
  };
}

/** Prints a type without the `| undefined` an optional member adds. */
function printType(type: ts.Type, checker: ts.TypeChecker, optional: boolean): string {
  const shown = optional ? checker.getNonNullableType(type) : type;
  return checker.typeToString(shown, undefined, TYPE_FLAGS).replace(/import\("[^"]+"\)\./g, '');
}

/**
 * The fields of an object type, for an options parameter or a returned object. Arrays,
 * functions, primitives and library types (a `RefObject`, a `MotionValue`) are
 * kept whole: their members aren't the hook's API.
 */
export function objectFields(
  type: ts.Type,
  checker: ts.TypeChecker,
  prefix: string,
): PropsRecord[] {
  const target = checker.getNonNullableType(type);
  if (!(target.flags & ts.TypeFlags.Object)) return [];
  if (checker.isArrayType(target) || checker.isTupleType(target)) return [];
  if (target.getCallSignatures().length > 0 || target.getConstructSignatures().length > 0) {
    return [];
  }
  const fromLibrary = (node: ts.Node) => {
    const fileName = node.getSourceFile().fileName;
    return fileName.includes('/node_modules/') && !fileName.includes('@windmorph/react-pro');
  };
  // Library types stay whole, except the installed Windmorph Pro's own declarations.
  const declaration = target.getSymbol()?.declarations?.[0];
  if (declaration && fromLibrary(declaration)) return [];
  // A class (the snackbar host's state) lists its public members, not its private ones.
  const isPublic = (member: ts.Symbol) =>
    !member.getName().startsWith('#') &&
    !(member.declarations ?? []).some(
      (node) =>
        ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected),
    );
  // Members a type inherits from React or another library (`DOMAttributes`' 170 handlers)
  // are left out, as the props tables leave out inherited props.
  const ownMember = (member: ts.Symbol) => {
    const declarations = member.declarations ?? [];
    return declarations.length === 0 || !declarations.every(fromLibrary);
  };
  return checker
    .getPropertiesOfType(target)
    .filter(isPublic)
    .filter(ownMember)
    .map((member) => {
      const optional = (member.flags & ts.SymbolFlags.Optional) !== 0;
      const memberType = checker.getTypeOfSymbol(member);
      return {
        name: `${prefix}${member.getName()}`,
        type: printType(memberType, checker, optional),
        required: !optional,
        ...docsOf(member, checker),
      };
    });
}

/** Documents one hook symbol (already resolved past its export alias). */
export function documentHook(
  name: string,
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): HookDocFile | null {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return null;
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const [signature] = type.getCallSignatures();
  if (!signature) return null;

  const params: PropsRecord[] = [];
  for (const parameter of signature.getParameters()) {
    const parameterDeclaration = parameter.valueDeclaration;
    const optional =
      parameterDeclaration !== undefined &&
      ts.isParameter(parameterDeclaration) &&
      (parameterDeclaration.questionToken !== undefined ||
        parameterDeclaration.initializer !== undefined);
    const parameterType = checker.getTypeOfSymbol(parameter);
    // A destructured parameter has no name of its own; `options` is what the docs call it.
    const parameterName =
      parameterDeclaration &&
      ts.isParameter(parameterDeclaration) &&
      ts.isIdentifier(parameterDeclaration.name)
        ? parameterDeclaration.name.text
        : 'options';
    const fields = objectFields(parameterType, checker, `${parameterName}.`);
    // The type as the source writes it (`Ref<HTMLInputElement>`), not its expansion.
    const writtenType =
      parameterDeclaration && ts.isParameter(parameterDeclaration) && parameterDeclaration.type
        ? parameterDeclaration.type.getText().replace(/\s*\|\s*undefined$/, '')
        : printType(parameterType, checker, optional);
    params.push({
      name: parameterName,
      type: writtenType,
      required: !optional,
      ...docsOf(parameter, checker),
    });
    params.push(...fields);
  }

  const returnType = signature.getReturnType();
  const returnsTag = symbol.getJsDocTags(checker).find((tag) => tag.name === 'returns');
  const returnsDescription = returnsTag?.text
    ? ts.displayPartsToString(returnsTag.text).trim()
    : '';
  const description = docText(symbol.getDocumentationComment(checker));
  return {
    displayName: name,
    kind: 'hook',
    description,
    signature: `${name}(${params
      .filter((param) => !param.name.includes('.'))
      .map((param) => `${param.name}${param.required ? '' : '?'}: ${param.type}`)
      .join(', ')}): ${printType(returnType, checker, false)}`,
    params,
    returns: {
      type: printType(returnType, checker, false),
      ...(returnsDescription ? { description: returnsDescription } : {}),
      fields: objectFields(returnType, checker, ''),
    },
  };
}

/**
 * Documents every `use*` export of the given entry files. One program per tsconfig, since the
 * core is read from its sources and Pro from its declarations.
 */
export function documentHooks(
  tsconfigPath: string,
  entries: string[],
  options?: ts.CompilerOptions,
): HookDocFile[] {
  return documentHooksWith(entries, options ?? compilerOptionsOf(tsconfigPath));
}

/** A tsconfig's compiler options. */
export function compilerOptionsOf(tsconfigPath: string): ts.CompilerOptions {
  const config = ts.readConfigFile(tsconfigPath, (path) => ts.sys.readFile(path));
  return ts.parseJsonConfigFileContent(config.config, ts.sys, tsconfigPath.replace(/\/[^/]+$/, ''))
    .options;
}

/** Pure core of {@link documentHooks}, with the compiler options given. Testable. */
export function documentHooksWith(entries: string[], options: ts.CompilerOptions): HookDocFile[] {
  const program = ts.createProgram({ rootNames: entries, options });
  const checker = program.getTypeChecker();
  const hooks: HookDocFile[] = [];
  for (const entry of entries) {
    const source = program.getSourceFile(entry);
    const moduleSymbol = source && checker.getSymbolAtLocation(source);
    if (!moduleSymbol) throw new Error(`cannot read the exports of ${entry}`);
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const name = exported.getName();
      if (!/^use[A-Z]/.test(name)) continue;
      const symbol =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const doc = documentHook(name, symbol, checker);
      if (doc) hooks.push(doc);
    }
  }
  return hooks;
}
