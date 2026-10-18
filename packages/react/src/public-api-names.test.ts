// @vitest-environment node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/**
 * The public props follow the library's naming conventions (docs/architecture.md §9, "API
 * naming round", 2026-10-17). Read with the TypeScript checker, so props a component inherits
 * from React Aria or React Stately count too, not only the ones its file names:
 *
 * - no React Aria state or option names (`is*`, `allows*`, `should*`, `disallow*`, the
 *   deprecated `validationState`, `excludeFromTabOrder`);
 * - none of the names this library replaced (`strings`, `minValue`, `dismissable`…);
 * - multi-word enum values are hyphenated (`'bottom-start'`), never spaced (`'bottom start'`);
 * - every component takes `className`, `style` and `ref`, and every one but an overlay that
 *   only exists while open takes `id`;
 * - every component with an element of its own takes that element's DOM attributes too
 *   (`data-*`, `aria-*`, global attributes, events; 2026-10-17), checked through three that
 *   stand for the groups: `aria-hidden`, `title` and `onPointerEnter`.
 */
const src = dirname(fileURLToPath(import.meta.url));
const ENTRIES = ['index.ts', 'primitives.ts', 'next.ts'].map((file) => join(src, file));

/** React Aria's naming, which the library's props don't use. */
const ARIA_NAME = /^(?:is|allows|should|disallow)[A-Z]|^(?:validationState|excludeFromTabOrder)$/;

/** Names that match `ARIA_NAME` on purpose, with the reason. */
const ARIA_NAME_ALLOWED: Record<string, string> = {
  isDateUnavailable:
    'A predicate function, not a state flag, named as React Aria and Ark name it (architecture §9).',
};

/** Names the library replaced (2026-10-17), with what replaced them. None may come back. */
const REMOVED: Record<string, string> = {
  strings: 'labels',
  minValue: 'min',
  maxValue: 'max',
  dismissable: 'closedBy',
  keyboardDismissDisabled: 'closedBy',
  quick: 'instant',
  showValueLabel: 'valueLabel',
  showHeader: 'header',
  showModeToggle: 'modeToggle',
  showCharacterCount: 'counter',
  iconPosition: 'iconPlacement',
  fabPosition: 'fabPlacement',
  startIcon: 'leadingIcon',
  endIcon: 'trailingIcon',
  closeLabel: 'labels.close',
  menuLabel: 'labels.menu',
  elementType: 'as',
  selectedKey: 'value',
  defaultSelectedKey: 'defaultValue',
  escapeKeyBehavior: 'nothing: Escape always closes',
  initialExpanded: 'defaultExpanded',
  initialVisible: 'defaultVisible',
};

/** Names removed from some components only: component → name → replacement. */
const REMOVED_ON: Record<string, Record<string, string>> = {
  Checkbox: {
    selected: 'checked',
    defaultSelected: 'defaultChecked',
    onSelectedChange: 'onCheckedChange',
  },
  Switch: {
    selected: 'checked',
    defaultSelected: 'defaultChecked',
    onSelectedChange: 'onCheckedChange',
    selectedIcon: 'checkedIcon',
    unselectedIcon: 'uncheckedIcon',
  },
  Select: { onSelectionChange: 'onChange' },
  Autocomplete: { onSelectionChange: 'onChange' },
  Tabs: { onSelectionChange: 'onChange' },
};

/** Components with no element of their own, so no `className`, `style`, `ref` or `id`. */
const NO_ROOT: Record<string, string> = {
  ContextMenuTrigger:
    'Wraps the area it gives a context menu; the area and the menu take the props.',
  DialogTrigger: 'Pairs a trigger with its dialog; both take their own props.',
  MenuTrigger: 'Pairs a trigger with its menu; both take their own props.',
  RichTooltipTrigger: 'Pairs a trigger with its tooltip; both take their own props.',
  SheetTrigger: 'Pairs a trigger with its sheet; both take their own props.',
  TooltipTrigger: 'Pairs a trigger with its tooltip; both take their own props.',
  DomDirectionLocale: 'A render prop that hands its child a ref; it renders no element.',
  NextRouterProvider: "Context only: wires links to Next's router.",
  ThemeProvider: 'Context only: themes the page through the document element.',
  ThemeScript: 'An inline script that applies the saved theme before paint.',
  Overlay: 'A primitive portal; what it holds takes the props.',
  OptionPopover: 'A primitive popover React Aria places; the option list inside takes the props.',
  ...Object.fromEntries(
    [
      'AutocompleteItem',
      'AutocompleteSection',
      'ListItem',
      'ListSection',
      'MenuGroup',
      'MenuItem',
      'SelectItem',
      'SelectSection',
      'SubmenuTrigger',
      'Tab',
    ].map((name) => [
      name,
      'A collection item: its parent renders it, and React Aria gives it an id from its `key`.',
    ]),
  ),
};

/** Components that take no `id`, with the reason. */
const NO_ID: Record<string, string> = {
  Tooltip: "React Aria gives the tooltip the id its trigger's `aria-describedby` points at.",
  RichTooltip: "React Aria gives the tooltip the id its trigger's `aria-describedby` points at.",
  SelectionControl: "A primitive: its `inputProps` carry the input's id.",
};

/** Attributes that stand for the root's DOM props: an ARIA one, a global one and an event. */
const DOM_PROBES = ['aria-hidden', 'title', 'onPointerEnter'];

/** Components that take a DOM probe under their own meaning, or none, with the reason. */
const DOM_PROBE_EXEMPT: Record<string, Partial<Record<string, string>>> = {
  DialogHeader: { title: 'Its `title` is the headline, as Dialog names it.' },
  PickerDialog: { title: 'Its `title` is the headline above the picker.' },
  RichTooltip: { title: 'Its `title` is the subhead, which names a persistent tooltip.' },
  SelectionControl: Object.fromEntries(
    DOM_PROBES.map((probe) => [probe, "A primitive: its `rootProps` carry the root's attributes."]),
  ),
};

const program = ts.createProgram(ENTRIES, {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  types: [],
});
const checker = program.getTypeChecker();

interface Component {
  name: string;
  props: Map<string, ts.Type>;
}

/** The exported components: functions named in PascalCase whose first parameter is props. */
function components(): Component[] {
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

/** The string literals a prop's type accepts. */
function stringLiterals(type: ts.Type): string[] {
  const members = type.isUnion() ? type.types : [type];
  return members.filter((member) => member.isStringLiteral()).map((member) => member.value);
}

const all = components();

describe('public API names', () => {
  it('finds the components', () => {
    expect(all.length).toBeGreaterThan(90);
    expect(all.map((component) => component.name)).toEqual(
      expect.arrayContaining(['Button', 'Select', 'Dialog', 'Tabs', 'ButtonBase']),
    );
  });

  it('takes no React Aria state or option names (is*, allows*, should*, disallow*…)', () => {
    const found = all.flatMap(({ name, props }) =>
      [...props.keys()]
        .filter((prop) => ARIA_NAME.test(prop) && !(prop in ARIA_NAME_ALLOWED))
        .map((prop) => `${name}.${prop}`),
    );
    expect(found).toEqual([]);
  });

  it('takes none of the names the library replaced', () => {
    const found = all.flatMap(({ name, props }) =>
      [...props.keys()]
        .filter((prop) => prop in REMOVED || prop in (REMOVED_ON[name] ?? {}))
        .map((prop) => `${name}.${prop} (now ${REMOVED[prop] ?? REMOVED_ON[name]?.[prop] ?? '?'})`),
    );
    expect(found).toEqual([]);
  });

  it('hyphenates multi-word enum values', () => {
    const found = all.flatMap(({ name, props }) =>
      [...props.entries()].flatMap(([prop, type]) =>
        // ARIA attributes are HTML's own tokens (`aria-relevant="additions text"`).
        (prop.startsWith('aria-') ? [] : stringLiterals(type))
          .filter((value) => /^[a-z]+(?: [a-z]+)+$/.test(value))
          .map((value) => `${name}.${prop}: '${value}'`),
      ),
    );
    expect(found).toEqual([]);
  });

  it('takes className, style, ref and id on every component with an element of its own', () => {
    const missing = all.flatMap(({ name, props }) =>
      (name in NO_ROOT ? [] : ['className', 'style', 'ref', ...(name in NO_ID ? [] : ['id'])])
        .filter((prop) => !props.has(prop))
        .map((prop) => `${name}.${prop}`),
    );
    expect(missing).toEqual([]);
  });

  it("passes its root element's DOM attributes on every component with one", () => {
    const missing = all.flatMap(({ name, props }) =>
      (name in NO_ROOT ? [] : DOM_PROBES)
        .filter((prop) => !props.has(prop) && DOM_PROBE_EXEMPT[name]?.[prop] === undefined)
        .map((prop) => `${name}.${prop}`),
    );
    expect(missing).toEqual([]);
  });
});
