/**
 * Writes the AI-friendly versions of the docs into the static export, after `next build`:
 *
 * - a Markdown twin of every page: `<path>.md` (`/components/button.md`, `/theming.md`,
 *   `/index.md` for the home page). A component page's twin holds all its tabs: examples
 *   with their source files, props tables, accessibility and guidelines; each tab page also
 *   gets its own (`/components/button/api.md`);
 * - `/llms.txt`, the site's outline in the llms.txt format (https://llmstxt.org), linking
 *   each twin;
 * - `/llms-full.txt`, every guide and component page in one file.
 *
 * The pages come from `out/sitemap.xml` (the same list as the sitemap and link previews), the
 * text from each page's rendered HTML, the props tables from the generated props JSON and
 * the example code from `examples/`, so the Markdown can't drift from the site. Every
 * component token the core exports must appear in `llms-full.txt` (from the API tabs' Tokens
 * tables), or the script fails.
 */
import { asAppSource } from '../lib/example-source';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import * as windmorph from '@windmorph/react';
import { componentTokenList, isComponentTokenSet } from '@windmorph/react';
import { GUIDE_ENTRIES } from '../app/(docs)/search-index';
import {
  COMPONENT_META_MAP,
  RAIL_GROUPS,
  pagesInRailGroup,
  type ComponentMeta,
} from '../content/components/catalog';
import {
  SUB_TABS,
  TAB_LABELS,
  componentTabHref,
  type ComponentTab,
} from '../content/components/doc';
import { htmlToMarkdown } from '../lib/html-to-markdown';
import { importLine } from '../lib/import-line';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  absoluteUrl,
  markdownPath,
} from '../lib/site-metadata';
import { propTypeMembers } from '../lib/prop-list-model';
import type { ComponentPropsFile, PropsRecord } from './generate-props';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const outDir = join(siteRoot, 'out');
const propsDir = join(siteRoot, '.generated/props');
const examplesDir = join(siteRoot, 'examples');

/** The static export's HTML file for a page. */
function htmlFile(path: string): string {
  return join(outDir, path === '/' ? 'index.html' : `${path.slice(1)}.html`);
}

/** Every page, in the sitemap's order. */
function sitemapPaths(): string[] {
  const xml = readFileSync(join(outDir, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url!).pathname);
}

/** Every example's source, by file name (`button-variants.tsx`); file names are unique. */
function exampleSources(): Map<string, string> {
  const sources = new Map<string, string>();
  for (const entry of readdirSync(examplesDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue;
    if (sources.has(entry.name)) throw new Error(`Two examples are named ${entry.name}`);
    // As the page shows it: icons and sample data from the reader's own modules.
    sources.set(entry.name, asAppSource(readFileSync(join(entry.parentPath, entry.name), 'utf8')));
  }
  return sources;
}

const EXAMPLES = exampleSources();

function exampleSource(fileName: string): string {
  const source = EXAMPLES.get(fileName);
  if (source === undefined) throw new Error(`No example file named ${fileName}`);
  return source;
}

const documents = new Map<string, Document>();

/**
 * A page's parsed HTML, once per page. Scripts (the page's own RSC payload, most of its
 * bytes) are dropped first; the Markdown needs only the rendered markup.
 */
function documentOf(path: string): Document {
  const cached = documents.get(path);
  if (cached) return cached;
  const html = readFileSync(htmlFile(path), 'utf8').replace(/<script\b[\s\S]*?<\/script>/g, '');
  const document = new JSDOM(html).window.document;
  documents.set(path, document);
  return document;
}

/** A copy of the element `selector` finds on a page, safe to change. */
function copyOf(path: string, selector: string): Element {
  const element = documentOf(path).querySelector(selector);
  if (!element) throw new Error(`${path} has no ${selector}`);
  // A deep copy of an element is an element.
  return element.cloneNode(true) as Element;
}

function convert(root: Element, path: string, headingOffset = 0): string {
  return htmlToMarkdown(root, { pagePath: path, siteUrl: SITE_URL, headingOffset, exampleSource });
}

/** A table cell's text: one line, pipes escaped. */
function cell(text: string): string {
  return text
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function code(text: string): string {
  return text.includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``;
}

/** A description as plain Markdown: a TSDoc `{@link Name}` becomes its code name (or label). */
function propDescription(prop: PropsRecord): string {
  return (prop.description ?? '').replace(
    /\{@link\s+([^\s|}]+)\s*(?:\|\s*)?([^}]*)\}/g,
    (_, name: string, label: string) => label.trim() || `\`${name}\``,
  );
}

function propType(prop: PropsRecord): string {
  return propTypeMembers(prop).join(' | ');
}

/** A default as written once (the generated JSON can repeat it on two lines). */
function propDefault(prop: PropsRecord): string {
  const lines = [...new Set((prop.defaultValue ?? '').split('\n').map((line) => line.trim()))];
  return lines.filter(Boolean).join(' ');
}

function readProps(name: string): ComponentPropsFile | null {
  try {
    return JSON.parse(readFileSync(join(propsDir, `${name}.json`), 'utf8')) as ComponentPropsFile;
  } catch {
    return null;
  }
}

/** A component page's props tables, from the generated props JSON. */
function propsMarkdown(meta: ComponentMeta, level: number): string {
  const blocks: string[] = [];
  for (const name of meta.propsComponents) {
    const props = readProps(name)?.props ?? [];
    if (props.length === 0) continue;
    blocks.push(`${'#'.repeat(level)} ${name} props`);
    blocks.push(
      [
        '| Prop | Type | Default | Description |',
        '| --- | --- | --- | --- |',
        // An object prop's keys (`labels.close`) follow it, as in the page's table.
        ...props
          .flatMap((prop) => [prop, ...(prop.keys ?? [])])
          .map((prop) => {
            const name = `${code(prop.name)}${prop.required ? ' (required)' : ''}`;
            const fallback = propDefault(prop);
            return `| ${name} | ${code(cell(propType(prop)))} | ${fallback ? code(cell(fallback)) : ''} | ${cell(propDescription(prop))} |`;
          }),
      ].join('\n'),
    );
  }
  return blocks.join('\n\n');
}

/**
 * One tab of a component page as Markdown: its panel's content, with the props section
 * rebuilt from the props JSON (one table per component, its object props' keys included).
 */
function tabMarkdown(meta: ComponentMeta, tab: ComponentTab, headingOffset: number): string {
  const path = componentTabHref(meta.slug, tab);
  const panel = copyOf(path, 'main article [role="tabpanel"]');
  const blocks: string[] = [];
  const props = panel.querySelector('h2#props')?.closest('section');
  if (props) {
    props.remove();
    blocks.push(`${'#'.repeat(2 + headingOffset)} Props`, propsMarkdown(meta, 3 + headingOffset));
  }
  blocks.push(convert(panel, path, headingOffset));
  return blocks.filter(Boolean).join('\n\n');
}

/** A component's labels: Expressive, Pro, Preview. */
function labels(meta: ComponentMeta): string {
  const list = [
    meta.expressive ? 'M3 Expressive' : null,
    meta.pro ? 'Windmorph Pro (`@windmorph/react-pro`)' : null,
    meta.stability === 'preview' ? 'Preview' : null,
  ].filter(Boolean);
  return list.length > 0 ? `Labels: ${list.join(', ')}.` : '';
}

/** How to import what a component page documents, and where Pro comes from. */
function importMarkdown(meta: ComponentMeta): string {
  const line = `Import: \`${importLine(meta)}\``;
  return meta.pro
    ? `${line}\n\nPart of Windmorph Pro, the paid components built on the free core: see the [Pro guide](${absoluteUrl(markdownPath('/pro'))}).`
    : line;
}

/** The tabs a component page has, from the export (a tab without content has no page). */
function tabsOf(meta: ComponentMeta, paths: Set<string>): ComponentTab[] {
  return SUB_TABS.filter((tab) => paths.has(componentTabHref(meta.slug, tab)));
}

function header(title: string, description: string, path: string): string {
  return [`# ${title}`, `> ${description}`, `Web page: ${absoluteUrl(path)}`].join('\n\n');
}

/** A component page with all its tabs. */
function componentMarkdown(meta: ComponentMeta, paths: Set<string>): string {
  const path = componentTabHref(meta.slug);
  const tabs: ComponentTab[] = ['overview', ...tabsOf(meta, paths)];
  return [
    header(meta.title, meta.summary, path),
    labels(meta),
    importMarkdown(meta),
    ...tabs.map((tab) => `## ${TAB_LABELS[tab]}\n\n${tabMarkdown(meta, tab, 1)}`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** One tab page of a component. */
function componentTabPageMarkdown(meta: ComponentMeta, tab: ComponentTab): string {
  const path = componentTabHref(meta.slug, tab);
  return [
    header(`${meta.title}: ${TAB_LABELS[tab]}`, meta.summary, path),
    labels(meta),
    importMarkdown(meta),
    tabMarkdown(meta, tab, 0),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** A guide page: its article, whose `h1` and intro open it. */
function guideMarkdown(path: string): string {
  const entry = GUIDE_ENTRIES.find((candidate) => candidate.href === path);
  if (!entry) throw new Error(`${path} is not a guide page`);
  const article = copyOf(path, 'main article');
  article.querySelector('h1')?.remove();
  return [header(entry.title, entry.summary, path), convert(article, path)].join('\n\n');
}

function link(title: string, path: string, description: string): string {
  return `- [${title}](${absoluteUrl(markdownPath(path))}): ${description}`;
}

/** The component index: every component by group. */
function componentsIndexMarkdown(): string {
  const entry = GUIDE_ENTRIES.find((candidate) => candidate.href === '/components');
  return [
    header('Components', entry?.summary ?? '', '/components'),
    ...RAIL_GROUPS.map((group) =>
      [
        `## ${group.fullName}`,
        pagesInRailGroup(group.id)
          .map((meta) => link(meta.title, componentTabHref(meta.slug), meta.summary))
          .join('\n'),
      ].join('\n\n'),
    ),
  ].join('\n\n');
}

/** `llms.txt`: the site in the llms.txt format, which the home page's twin shares. */
function llmsTxt(): string {
  const guides = GUIDE_ENTRIES.map((entry) => link(entry.title, entry.href, entry.summary));
  return [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    [
      `${SITE_TITLE}. Every page of the documentation is also plain Markdown: add \`.md\` to its URL (\`${absoluteUrl('/index.md')}\` for the home page).`,
      `A component's Markdown holds all its tabs: examples with their source, props, accessibility and guidelines.`,
      `[llms-full.txt](${absoluteUrl('/llms-full.txt')}) has every page in one file.`,
    ].join(' '),
    `## Guides\n\n${guides.join('\n')}`,
    ...RAIL_GROUPS.map(
      (group) =>
        `## Components: ${group.fullName}\n\n${pagesInRailGroup(group.id)
          .map((meta) => link(meta.title, componentTabHref(meta.slug), meta.summary))
          .join('\n')}`,
    ),
    `## Optional\n\n${[
      `- [Every page in one file](${absoluteUrl('/llms-full.txt')}): the guides and every component page, in full`,
      `- [Sitemap](${absoluteUrl('/sitemap.xml')}): every page of the site, its tabs included`,
    ].join('\n')}`,
  ].join('\n\n');
}

function write(path: string, markdown: string): void {
  const file = join(outDir, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${markdown.trim()}\n`);
}

const paths = sitemapPaths();
const pathSet = new Set(paths);
const full: string[] = [];

for (const path of paths) {
  const [, section, slug, tab] = path.split('/');
  let markdown: string;
  if (path === '/') {
    markdown = llmsTxt();
  } else if (path === '/components') {
    markdown = componentsIndexMarkdown();
  } else if (section === 'components' && slug) {
    const meta = COMPONENT_META_MAP[slug];
    if (!meta) throw new Error(`No catalog entry for ${path}`);
    if (tab) {
      markdown = componentTabPageMarkdown(meta, tab as ComponentTab);
    } else {
      markdown = componentMarkdown(meta, pathSet);
      full.push(markdown);
    }
  } else {
    markdown = guideMarkdown(path);
    full.push(markdown);
  }
  write(markdownPath(path), markdown);
}

write('/llms.txt', llmsTxt());
const llmsFull = [`# ${SITE_TITLE}`, `> ${SITE_DESCRIPTION}`, ...full].join('\n\n---\n\n');
const missingTokens = Object.values(windmorph)
  .filter(isComponentTokenSet)
  .filter((set) => set.name.startsWith('md-comp-'))
  .flatMap((set) => componentTokenList(set).map(({ name }) => name))
  .filter((name) => !llmsFull.includes(name));
if (missingTokens.length > 0) {
  throw new Error(`llms-full.txt lacks component tokens: ${missingTokens.join(', ')}`);
}
write('/llms-full.txt', llmsFull);
console.log(`Wrote ${paths.length} Markdown pages, llms.txt and llms-full.txt to out/.`);
