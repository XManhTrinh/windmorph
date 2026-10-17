/**
 * Post-build checks on dist:
 * - every source module marked "use client" keeps the directive in its output,
 * - no output path contains node_modules (npm would drop it when publishing),
 * - every relative import has a file extension (plain Node ESM can load it),
 * - public type declarations do not reference the vendored colour library,
 * - components that open a bottom sheet only in some presentations load it lazily: the sheet
 *   is not among their static imports. ButtonGroup loads its overflow menu the same way, so
 *   Menu is not among its static imports either. Components that show a tooltip of their own
 *   (icon buttons, FABs, the toolbar's FAB, the pickers) load the tooltip on hover or focus,
 *   option lists load their loading indicator only while loading, and buttons only while
 *   pending. DateField loads the
 *   modal date picker it opens on compact windows only there,
 * - `List` draws its checkboxes, radio buttons and switches from the small modules it shares
 *   with those controls, not from the controls' own modules,
 * - the static shape outlines (`materialShapeMask` and the precomputed `<name>Shape`
 *   constants) never import the shape engine, so drawing a static shape costs only its outline,
 * - both stylesheets carry the component tokens (`generated/components.css`).
 */
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { moduleClosure } from './lib/bundle-size';

const root = fileURLToPath(new URL('..', import.meta.url));

async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => `${entry.parentPath}/${entry.name}`.replace(root, ''));
}

const errors: string[] = [];
const sourceFiles = (await files(`${root}src`)).filter((file) => /\.tsx?$/.test(file));
const distFiles = await files(`${root}dist`);

for (const file of sourceFiles) {
  if (file.includes('.test.')) continue;
  const source = await readFile(`${root}${file}`, 'utf8');
  if (!/^['"]use client['"];/.test(source)) continue;
  const output = file.replace(/^src\//, 'dist/').replace(/\.tsx?$/, '.js');
  const built = await readFile(`${root}${output}`, 'utf8').catch(() => null);
  if (built === null) errors.push(`${output} missing for "use client" module ${file}`);
  else if (!built.startsWith('"use client";'))
    errors.push(`${output} lost its "use client" directive`);
}

for (const file of distFiles) {
  if (file.includes('node_modules')) errors.push(`${file} is inside node_modules`);
  if (file.endsWith('.js')) {
    const code = await readFile(`${root}${file}`, 'utf8');
    for (const [, specifier] of code.matchAll(
      /(?:from\s+|import\(\s*)["'](\.{1,2}\/[^"']+)["']/g,
    )) {
      if (!specifier?.endsWith('.js'))
        errors.push(`${file} imports "${specifier}" without an extension`);
    }
  }
  if (file.endsWith('.d.ts')) {
    const types = await readFile(`${root}${file}`, 'utf8');
    if (/(?:from\s+|import\()['"]@material\/material-color-utilities/.test(types)) {
      errors.push(`${file} references @material/material-color-utilities`);
    }
  }
}

/** Modules a component loads only when needed, with `import()`: never statically. */
const LAZY_IMPORTS: { component: string; lazy: string }[] = [
  { component: 'components/menu/Menu.js', lazy: 'components/sheet/BottomSheet.js' },
  { component: 'components/select/Select.js', lazy: 'components/sheet/BottomSheet.js' },
  { component: 'composites/button-group/ButtonGroup.js', lazy: 'components/menu/Menu.js' },
  ...[
    'components/icon-button/IconButton.js',
    'components/fab/Fab.js',
    'components/fab-menu/FabMenu.js',
    'components/toolbar/Toolbar.js',
    'components/date-picker/DatePicker.js',
    'components/date-picker/DateField.js',
  ].map((component) => ({ component, lazy: 'components/tooltip/Tooltip.js' })),
  // DateField opens the modal picker only on compact windows, so it loads it there.
  ...['components/date-picker/CompactDateDialog.js', 'components/date-picker/DatePicker.js'].map(
    (lazy) => ({ component: 'components/date-picker/DateField.js', lazy }),
  ),
  ...[
    'components/select/option-list.js',
    'components/select/Select.js',
    'components/autocomplete/Autocomplete.js',
    'components/date-picker/DateField.js',
    'components/pull-to-refresh/PullToRefresh.js',
    // Buttons show it only while `pending`.
    'components/button/Button.js',
    'components/icon-button/IconButton.js',
  ].map((component) => ({
    component,
    lazy: 'components/loading-indicator/LoadingIndicator.js',
  })),
];
for (const { component, lazy } of LAZY_IMPORTS) {
  if (moduleClosure(`${root}dist`, component).includes(lazy))
    errors.push(`${component} imports ${lazy} statically; load it with import()`);
}

/** `List` imports only the drawn parts of the selection controls, not the controls. */
for (const control of [
  'components/checkbox/Checkbox.js',
  'components/radio/RadioGroup.js',
  'components/switch/Switch.js',
]) {
  if (moduleClosure(`${root}dist`, 'components/list/List.js').includes(control))
    errors.push(`components/list/List.js imports ${control}; import its drawn parts' module`);
}

/** Static outlines are precomputed: they never load the shape engine. */
for (const outline of [
  'shapes/mask.js',
  'shapes/generated/material-shape-paths.js',
  'shapes/generated/material-shape-path-record.js',
]) {
  const closure = moduleClosure(`${root}dist`, outline);
  for (const engine of ['shapes/material-shapes.js', 'shapes/rounded-polygon.js']) {
    if (closure.includes(engine))
      errors.push(`${outline} imports ${engine}; static outlines must not load the shape engine`);
  }
}

const tailwindEntry = await readFile(`${root}dist/styles/styles.css`, 'utf8');
if (!tailwindEntry.includes("@import './generated/components.css';")) {
  errors.push('dist/styles/styles.css does not import generated/components.css');
}
const componentsCss = await readFile(`${root}dist/styles/generated/components.css`, 'utf8').catch(
  () => null,
);
if (componentsCss === null) {
  errors.push('dist/styles/generated/components.css is missing');
} else {
  const compiled = await readFile(`${root}dist/styles.compiled.css`, 'utf8');
  const variables = [...componentsCss.matchAll(/(--_md-comp-[\w-]+):/g)].map(([, name]) => name!);
  const missing = [...new Set(variables)].filter((name) => !compiled.includes(name));
  if (missing.length > 0) {
    errors.push(`dist/styles.compiled.css lacks component tokens: ${missing.join(', ')}`);
  }
}

if (errors.length > 0) {
  console.error(`dist check failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`dist check passed (${distFiles.length} files).`);
