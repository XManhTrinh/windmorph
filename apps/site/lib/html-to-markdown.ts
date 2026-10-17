/**
 * Turns a rendered docs page (its static HTML, parsed into a DOM) into plain Markdown for
 * the `.md` twins and `llms.txt`. It keeps what a reader needs (headings, prose, lists,
 * tables, code) and drops what only works in a browser: buttons, tabs, form controls,
 * icons, live previews and anything marked `data-markdown="skip"`. An `ExampleViewer`
 * (marked `data-example-file`) becomes its title and its example's source file.
 */

export interface MarkdownOptions {
  /** The page's own path, for resolving relative links. */
  pagePath: string;
  /** The site's origin; links and images become absolute URLs on it. */
  siteUrl: string;
  /** Added to every heading level (an `h2` becomes `###` with 1). @default 0 */
  headingOffset?: number;
  /** The source of an example file by its name (`button-variants.tsx`). */
  exampleSource: (fileName: string) => string;
}

/** Elements that only make sense in a browser. */
const SKIPPED_TAGS = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'svg',
  'template',
  'script',
  'style',
  'noscript',
  'iframe',
  'video',
  'audio',
  'canvas',
]);

const SKIPPED_ROLES = new Set(['tablist', 'radiogroup', 'toolbar', 'slider', 'dialog', 'switch']);

const BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'div',
  'dl',
  'fieldset',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
]);

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

function isElement(node: Node): node is Element {
  return node.nodeType === ELEMENT_NODE;
}

function tagOf(element: Element): string {
  return element.tagName.toLowerCase();
}

function isSkipped(element: Element): boolean {
  // A heading's button (an accordion header) holds the heading's text.
  if (tagOf(element) === 'button' && element.closest('h1, h2, h3, h4, h5, h6')) return false;
  if (SKIPPED_TAGS.has(tagOf(element))) return true;
  const role = element.getAttribute('role');
  if (role && SKIPPED_ROLES.has(role)) return true;
  return (
    // Content hidden until found (a closed accordion panel) is still the page's content.
    (element.hasAttribute('hidden') && element.getAttribute('hidden') !== 'until-found') ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.getAttribute('data-markdown') === 'skip' ||
    // A live example's preview: its source file stands in for it.
    element.hasAttribute('data-example')
  );
}

/** Whether an element holds block content, so it can't be written inline. */
function isBlock(element: Element): boolean {
  if (BLOCK_TAGS.has(tagOf(element))) return true;
  if (
    element.hasAttribute('data-example-file') ||
    element.hasAttribute('data-lang') ||
    element.hasAttribute('data-props-list')
  ) {
    return true;
  }
  return [...element.children].some((child) => !isSkipped(child) && isBlock(child));
}

/** Collapses runs of whitespace, as a browser does. */
function collapse(text: string): string {
  return text.replace(/\s+/g, ' ');
}

/** Inline code, fenced with enough backticks for what it holds. */
function inlineCode(text: string): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(longest + 1);
  const padded = text.startsWith('`') || text.endsWith('`') ? ` ${text} ` : text;
  return `${fence}${padded}${fence}`;
}

/** A fenced code block, fenced with enough backticks for what it holds. */
function codeBlock(code: string, lang: string): string {
  const longest = Math.max(2, ...(code.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(longest + 1);
  return `${fence}${lang}\n${code.replace(/\n+$/, '')}\n${fence}`;
}

class Converter {
  constructor(private readonly options: MarkdownOptions) {}

  private url(href: string): string {
    return new URL(href, new URL(this.options.pagePath, this.options.siteUrl)).href;
  }

  /** An element's content as one line of Markdown. */
  inline(node: Node): string {
    if (node.nodeType === TEXT_NODE) return collapse(node.textContent ?? '');
    if (!isElement(node) || isSkipped(node)) return '';
    const tag = tagOf(node);
    const children = () => [...node.childNodes].map((child) => this.inline(child)).join('');
    switch (tag) {
      case 'br':
        return ' ';
      case 'code':
      case 'kbd':
        return inlineCode(collapse(node.textContent ?? '').trim());
      case 'strong':
      case 'b': {
        const text = children().trim();
        return text ? `**${text}**` : '';
      }
      case 'em':
      case 'i': {
        const text = children().trim();
        return text ? `_${text}_` : '';
      }
      case 'a': {
        const text = children().trim();
        const href = node.getAttribute('href');
        return href && text ? `[${text}](${this.url(href)})` : text;
      }
      case 'img': {
        const alt = node.getAttribute('alt');
        const src = node.getAttribute('src');
        return alt && src ? `![${alt}](${this.url(src)})` : '';
      }
      default:
        return children();
    }
  }

  private heading(element: Element, level: number): string {
    const depth = Math.min(6, level + (this.options.headingOffset ?? 0));
    return `${'#'.repeat(depth)} ${this.inline(element).trim()}`;
  }

  private list(element: Element, ordered: boolean, indent: string): string {
    const items = [...element.children].filter(
      (child) => tagOf(child) === 'li' && !isSkipped(child),
    );
    return items
      .map((item, index) => {
        const marker = ordered ? `${index + 1}. ` : '- ';
        const nested: string[] = [];
        const text: Node[] = [];
        for (const child of item.childNodes) {
          if (isElement(child) && (tagOf(child) === 'ul' || tagOf(child) === 'ol')) {
            nested.push(this.list(child, tagOf(child) === 'ol', `${indent}  `));
          } else {
            text.push(child);
          }
        }
        const line = text
          .map((child) => this.inline(child))
          .join('')
          .trim();
        return [`${indent}${marker}${line}`, ...nested].join('\n');
      })
      .join('\n');
  }

  private table(element: Element): string {
    const rows = [...element.querySelectorAll('tr')].filter(
      (row) => row.closest('table') === element,
    );
    if (rows.length === 0) return '';
    const cells = (row: Element) =>
      [...row.children]
        .filter((cell) => tagOf(cell) === 'th' || tagOf(cell) === 'td')
        .map((cell) => this.inline(cell).trim().replace(/\|/g, '\\|'));
    const [head, ...body] = rows.map(cells);
    if (!head) return '';
    const width = Math.max(head.length, ...body.map((row) => row.length));
    const pad = (row: string[]) => [...row, ...Array<string>(width - row.length).fill('')];
    const caption = element.querySelector('caption');
    const lines = [
      `| ${pad(head).join(' | ')} |`,
      `| ${Array<string>(width).fill('---').join(' | ')} |`,
      ...body.map((row) => `| ${pad(row).join(' | ')} |`),
    ];
    const title = caption ? this.inline(caption).trim() : '';
    return [title ? `${title}:` : '', lines.join('\n')].filter(Boolean).join('\n\n');
  }

  private definitions(element: Element): string {
    const lines: string[] = [];
    let term = '';
    // Terms and details may sit in a `div` each, as HTML allows.
    for (const child of element.querySelectorAll('dt, dd')) {
      if (child.closest('dl') !== element) continue;
      if (tagOf(child) === 'dt') term = this.inline(child).trim();
      else lines.push(`- **${term}**: ${this.inline(child).trim()}`);
    }
    return lines.join('\n');
  }

  /**
   * A props list (marked `data-props-list`) as a table: name, type, default and description,
   * with an object prop's keys after it, folded or not. Each item carries its name, type and
   * default in `data-*` attributes, so the table has the full type, not the chips.
   */
  private propsList(element: Element): string {
    const cell = (text: string) => text.replace(/\|/g, '\\|');
    const rows = [...element.querySelectorAll('li[data-prop]')].map((item) => {
      const name = `${inlineCode(item.getAttribute('data-prop') ?? '')}${item.hasAttribute('data-required') ? ' (required)' : ''}`;
      const type = item.getAttribute('data-type');
      const fallback = item.getAttribute('data-default');
      const description = [...item.children].find((child) =>
        child.hasAttribute('data-prop-description'),
      );
      const text = description
        ? [...description.children].map((paragraph) => this.inline(paragraph).trim()).join(' ')
        : '';
      return `| ${cell(name)} | ${type ? cell(inlineCode(type)) : ''} | ${fallback ? cell(inlineCode(collapse(fallback))) : ''} | ${cell(text)} |`;
    });
    if (rows.length === 0) return '';
    const caption = element.getAttribute('aria-label');
    const table = ['| Name | Type | Default | Description |', '| --- | --- | --- | --- |', ...rows];
    return [caption ? `${caption}:` : '', table.join('\n')].filter(Boolean).join('\n\n');
  }

  private example(element: Element): string[] {
    const fileName = element.getAttribute('data-example-file') ?? '';
    const lang = element.getAttribute('data-example-lang') ?? 'tsx';
    const title = element.querySelector('h3, h4');
    return [
      ...(title ? [this.heading(title, Number(tagOf(title).slice(1)))] : []),
      `\`${fileName}\`:`,
      codeBlock(this.options.exampleSource(fileName), lang),
    ];
  }

  /**
   * A `CodeBlock` (marked `data-lang`): its title, when it shows one (a file name, say), then
   * its code. The header's copy button and the highlighting are left behind.
   */
  private codeBlockOf(element: Element): string[] {
    const pre = element.querySelector('pre');
    if (!pre) return [];
    const lang = element.getAttribute('data-lang') ?? '';
    const label = pre.getAttribute('aria-label');
    const title = label && label !== 'Code' && label !== `${lang} code` ? label : null;
    const code = codeBlock(pre.textContent ?? '', lang);
    return title ? [`${inlineCode(title)}:`, code] : [code];
  }

  /** An element's content as Markdown blocks. */
  blocks(node: Node): string[] {
    if (node.nodeType === TEXT_NODE) {
      const text = collapse(node.textContent ?? '').trim();
      return text ? [text] : [];
    }
    if (!isElement(node) || isSkipped(node)) return [];
    if (node.hasAttribute('data-example-file')) return this.example(node);
    if (node.hasAttribute('data-lang')) return this.codeBlockOf(node);
    if (node.hasAttribute('data-props-list')) {
      const table = this.propsList(node);
      return table ? [table] : [];
    }
    const tag = tagOf(node);
    if (/^h[1-6]$/.test(tag)) return [this.heading(node, Number(tag.slice(1)))];
    switch (tag) {
      case 'p':
      case 'caption': {
        const text = this.inline(node).trim();
        return text ? [text] : [];
      }
      case 'ul':
      case 'ol': {
        const list = this.list(node, tag === 'ol', '');
        return list ? [list] : [];
      }
      case 'pre':
        return [codeBlock(node.textContent ?? '', '')];
      case 'table': {
        const table = this.table(node);
        return table ? [table] : [];
      }
      case 'dl': {
        const list = this.definitions(node);
        return list ? [list] : [];
      }
      case 'blockquote':
        return this.children(node).map((block) =>
          block
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n'),
        );
      case 'hr':
        return ['---'];
      default:
        if (!isBlock(node)) {
          const text = this.inline(node).trim();
          return text ? [text] : [];
        }
        return this.children(node);
    }
  }

  /** Each child's blocks; runs of inline children become one paragraph. */
  private children(element: Element): string[] {
    const blocks: string[] = [];
    let run = '';
    const flush = () => {
      const text = run.trim();
      if (text) blocks.push(text);
      run = '';
    };
    for (const child of element.childNodes) {
      if (isElement(child) && !isSkipped(child) && isBlock(child)) {
        flush();
        blocks.push(...this.blocks(child));
      } else {
        run += this.inline(child);
      }
    }
    flush();
    return blocks;
  }
}

/** The Markdown for `root`'s content, blocks separated by blank lines. */
export function htmlToMarkdown(root: Element, options: MarkdownOptions): string {
  return new Converter(options).blocks(root).join('\n\n');
}
