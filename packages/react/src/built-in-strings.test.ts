import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/**
 * Every word a component shows or announces can be overridden: built-in English comes from a
 * `labels` or `strings` prop's defaults (or another prop), never from a literal in the markup.
 * This test reads the components' sources and fails on a literal accessible name, visible
 * text or announcement. A literal that is genuinely not language (a symbol, a separator) goes
 * in the allowlist with its reason.
 */
const src = dirname(fileURLToPath(import.meta.url));
const roots = ['components', 'composites'].map((dir) => join(src, dir));

/** The attributes whose value people read or hear. */
const TEXT_ATTRIBUTES = new Set([
  'aria-label',
  'aria-valuetext',
  'aria-roledescription',
  'aria-placeholder',
  'title',
  'alt',
  'placeholder',
  'label',
]);

/** The calls whose string argument is announced to screen readers. */
const ANNOUNCERS = new Set(['announce']);

/** `file: text` → why it isn't language that needs translating. */
const ALLOWED: Record<string, string> = {};

/** Whether a literal holds words: a letter in any script. */
const hasWords = (text: string) => /\p{L}/u.test(text);

function sources(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        /\.tsx?$/.test(entry.name) &&
        !/\.(test|stories)\.tsx?$/.test(entry.name) &&
        !entry.name.endsWith('.d.ts'),
    )
    .map((entry) => join(entry.parentPath, entry.name));
}

/** The literal text of an expression, when it is one: a string or a template with words. */
function literalText(node: ts.Node | undefined): string | null {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    const parts = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)];
    return parts.join('…');
  }
  if (ts.isJsxExpression(node) || ts.isParenthesizedExpression(node)) {
    return literalText(node.expression);
  }
  // `cond ? 'Open' : 'Close'`: either branch can be shown. (A fallback after `??` or `||`
  // is the default of what comes before it, such as `strings.close ?? 'Close'`.)
  if (ts.isConditionalExpression(node)) {
    return literalText(node.whenTrue) ?? literalText(node.whenFalse);
  }
  return null;
}

/** A property's name as written: `label`, `'aria-label'`. */
function propertyName(name: ts.PropertyName): string {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : '';
}

/** Whether a node sits in a `DEFAULT_LABELS`-style constant: the overridable defaults. */
function inDefaults(node: ts.Node): boolean {
  for (let at: ts.Node | undefined = node; at; at = at.parent) {
    if (ts.isVariableDeclaration(at) && /^DEFAULT_[A-Z_]+$/.test(at.name.getText())) return true;
  }
  return false;
}

/** Every hard-coded user-visible string in one file, as `file: text`. */
function hardCoded(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const name = relative(src, file);
  const found: string[] = [];
  const report = (text: string | null) => {
    if (text !== null && hasWords(text)) found.push(`${name}: ${text.trim()}`);
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && TEXT_ATTRIBUTES.has(node.name.getText(source))) {
      report(literalText(node.initializer));
    } else if (
      ts.isPropertyAssignment(node) &&
      /^aria-/.test(propertyName(node.name)) &&
      TEXT_ATTRIBUTES.has(propertyName(node.name)) &&
      !inDefaults(node)
    ) {
      // Props built for a React Aria hook: `useButton({ 'aria-label': 'Clear' }, ref)`.
      report(literalText(node.initializer));
    } else if (ts.isJsxText(node)) {
      report(node.text);
    } else if (ts.isJsxExpression(node) && node.parent && ts.isJsxElement(node.parent)) {
      // A literal child: `<span>{'Close'}</span>`.
      report(literalText(node.expression));
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      ANNOUNCERS.has(node.expression.text)
    ) {
      report(literalText(node.arguments[0]));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe('built-in strings', () => {
  const files = roots.flatMap(sources);

  it('reads the component sources', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('takes every visible or announced word from labels, strings or props', () => {
    const found = files.flatMap(hardCoded).filter((entry) => !(entry in ALLOWED));
    expect(found).toEqual([]);
  });

  it('keeps the allowlist to strings that are still there', () => {
    const found = new Set(files.flatMap(hardCoded));
    expect(Object.keys(ALLOWED).filter((entry) => !found.has(entry))).toEqual([]);
  });
});
