/**
 * Type-checks every snippet the playgrounds can copy: for each playground, the starting state
 * and every value of every control (after the descriptor's `adjust`), emitted as a module and
 * compiled against the real packages. A combination the types reject (a text button with a
 * toggle, a toolbar with both a FAB and leading content) or an unused import fails here.
 * Part of the site's `typecheck`; it reads the generated props, so run `generate` first.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { emitSnippet, propDefaultsFrom } from '../components/playground/code-emit';
import { inferControls } from '../components/playground/controls-model';
import { PLAYGROUND_DESCRIPTORS } from '../components/playground/descriptors';
import type { PlaygroundDescriptor } from '../components/playground/descriptors';
import type { PropsRecord } from '../lib/component-props';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(siteRoot, '.generated/snippets');

/** The values a control can take, as its control would set them. */
function valuesOf(kind: string, options: string[] | undefined, numeric: boolean): unknown[] {
  if (kind === 'boolean') return [true, false];
  if (kind === 'enum') return (options ?? []).map((option) => (numeric ? Number(option) : option));
  if (kind === 'number') return [2];
  return ['/sample'];
}

/** Every snippet a playground can produce, one control changed at a time. */
function snippetsOf(descriptor: PlaygroundDescriptor): string[] {
  const props = (
    JSON.parse(
      readFileSync(join(siteRoot, '.generated/props', `${descriptor.component}.json`), 'utf8'),
    ) as { props: PropsRecord[] }
  ).props;
  const controls = inferControls(
    props,
    descriptor.surfacedProps,
    descriptor.enumOptions,
    descriptor.defaultProps,
    descriptor.controlKinds,
  );
  const initial = { ...descriptor.defaultProps, ...descriptor.initialState };
  const states: Record<string, unknown>[] = [initial];
  for (const control of controls) {
    for (const value of valuesOf(control.kind, control.options, control.numeric === true)) {
      const next = { ...initial, [control.name]: value };
      states.push(descriptor.adjust ? descriptor.adjust(next, control.name) : next);
    }
  }
  return states.map((values) =>
    emitSnippet({
      component: descriptor.component,
      values,
      surfacedProps: descriptor.surfacedProps,
      defaultProps: { ...descriptor.defaultProps, ...descriptor.codeDefaults?.(values) },
      propDefaults: propDefaultsFrom(props),
      importMembers: descriptor.importMembers,
      codeImports: descriptor.codeImports,
      codeSlots: descriptor.codeSlots,
      toggledSlots: descriptor.toggledSlots,
      codeChildren:
        typeof descriptor.codeChildren === 'function'
          ? descriptor.codeChildren(values)
          : descriptor.codeChildren,
      codeWrap: descriptor.codeWrap,
      importFrom: descriptor.importFrom,
    }),
  );
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
// The snippets' own imports: the site's icons, and a list of photos.
writeFileSync(join(outDir, 'icons.ts'), "export * from '../../components/icons';\n");
writeFileSync(join(outDir, 'photos.ts'), 'export const photos = [] as never[];\n');
writeFileSync(
  join(outDir, 'tsconfig.json'),
  JSON.stringify({
    extends: '../../tsconfig.json',
    compilerOptions: { incremental: false, noUnusedLocals: true, plugins: [] },
    include: ['*.ts', '*.tsx'],
    exclude: [],
  }),
);

let count = 0;
for (const [slug, descriptor] of Object.entries(PLAYGROUND_DESCRIPTORS)) {
  const unique = [...new Set(snippetsOf(descriptor))];
  unique.forEach((code, index) => {
    // The element becomes a component's body, so the module compiles as TSX.
    const body = code.replace(/\n\n(<[\s\S]*)$/, '\n\nexport const Snippet = () => (\n$1);\n');
    writeFileSync(join(outDir, `${slug}-${index}.tsx`), `'use client';\n${body}`);
    count++;
  });
}

const configPath = join(outDir, 'tsconfig.json');
const config = ts.getParsedCommandLineOfConfigFile(
  configPath,
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  },
);
if (!config) throw new Error(`cannot read ${configPath}`);
const program = ts.createProgram({ rootNames: config.fileNames, options: config.options });
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length > 0) {
  console.error(
    ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (name) => name,
      getCurrentDirectory: () => siteRoot,
      getNewLine: () => '\n',
    }),
  );
  console.error(`[check-snippets] a playground snippet doesn't compile (in ${outDir})`);
  process.exit(1);
}
console.log(`[check-snippets] ${count} playground snippets compile`);
