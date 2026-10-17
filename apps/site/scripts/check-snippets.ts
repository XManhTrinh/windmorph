/**
 * Type-checks every snippet the playgrounds can copy: for each playground, the starting state
 * and every value of every control (after the descriptor's `adjust`), emitted as a module and
 * compiled against the real packages. A combination the types reject (a text button with a
 * toggle, a toolbar with both a FAB and leading content), an unused import, an icon missing
 * from the site's icon module (`./icons` in a snippet) or an inline SVG fails here.
 * Part of the site's `typecheck`; it reads the generated props, so run `generate` first.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { PLAYGROUND_DESCRIPTORS } from '../components/playground/descriptors';
import { playgroundSnippets } from '../components/playground/playground-state';
import type { PlaygroundDescriptor } from '../components/playground/descriptors';
import type { PropsRecord } from '../lib/component-props';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(siteRoot, '.generated/snippets');

/** A component's generated props, or none for one the generator skipped. */
function readProps(name: string): PropsRecord[] {
  return (
    JSON.parse(readFileSync(join(siteRoot, '.generated/props', `${name}.json`), 'utf8')) as {
      props: PropsRecord[];
    }
  ).props;
}

/** Every snippet a playground can produce (see {@link playgroundSnippets}). */
function snippetsOf(descriptor: PlaygroundDescriptor): string[] {
  const names = [
    descriptor.component,
    ...Object.values(descriptor.componentSwitch?.components ?? {}),
  ];
  return playgroundSnippets(
    descriptor,
    Object.fromEntries(names.map((name) => [name, readProps(name)])),
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
    // Icons are named components from the reader's icon module, never pasted-in SVG.
    if (/<svg\b/.test(code)) {
      console.error(`[check-snippets] ${slug}: a snippet writes an inline SVG:\n${code}`);
      process.exit(1);
    }
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
