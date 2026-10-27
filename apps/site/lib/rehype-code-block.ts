import { highlightSource } from './highlight';

/**
 * A build-time rehype plugin that turns fenced code blocks into `CodeBlock` props.
 *
 * It drives the shared Shiki highlighter in `lib/highlight.ts` directly (not
 * `@shikijs/rehype`) because `CodeBlock` needs both the raw source (for the copy button)
 * and the highlighted markup. For each `pre > code` it reads the raw text, the language
 * from the `language-xxx` class and `title`/`showLineNumbers` from the fence meta, then
 * replaces the `<pre>` with URI-encoded `data-raw`/`data-html` plus `data-lang`/`data-title`
 * and a bare `data-show-line-numbers` flag. `mdx-components.tsx`'s `pre` override reads these.
 */

interface HastText {
  type: 'text';
  value: string;
}

interface HastElement {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
  data?: { meta?: string };
}

type HastNode = HastText | HastElement | { type: string; children?: HastNode[] };

function isElement(node: HastNode): node is HastElement {
  return node.type === 'element';
}

function childrenOf(node: HastNode): HastNode[] {
  return (node as { children?: HastNode[] }).children ?? [];
}

function collectText(node: HastNode): string {
  if (node.type === 'text') return (node as HastText).value;
  return childrenOf(node).map(collectText).join('');
}

function languageFrom(code: HastElement): string | undefined {
  const className = code.properties?.className;
  const classes = Array.isArray(className)
    ? className
    : typeof className === 'string'
      ? className.split(' ')
      : [];
  for (const name of classes) {
    if (typeof name === 'string' && name.startsWith('language-')) {
      return name.slice('language-'.length);
    }
  }
  return undefined;
}

function parseMeta(meta: string | undefined): { title?: string; showLineNumbers: boolean } {
  const title = meta?.match(/title="([^"]*)"/)?.[1];
  const showLineNumbers = /(?:^|\s)showLineNumbers(?:\s|$)/.test(meta ?? '');
  return { title, showLineNumbers };
}

export default function rehypeCodeBlock() {
  return async (tree: HastNode): Promise<void> => {
    const tasks: Promise<void>[] = [];

    const walk = (node: HastNode): void => {
      for (const child of childrenOf(node)) {
        if (isElement(child) && child.tagName === 'pre') {
          const code = child.children.find(isElement);
          if (code && code.tagName === 'code') {
            const raw = collectText(code).replace(/\n$/, '');
            const lang = languageFrom(code);
            const { title, showLineNumbers } = parseMeta(code.data?.meta);
            tasks.push(
              highlightSource(raw, lang ?? 'tsx').then((html) => {
                child.children = [];
                child.properties = {
                  ...child.properties,
                  'data-raw': encodeURIComponent(raw),
                  'data-html': encodeURIComponent(html),
                  ...(lang != null ? { 'data-lang': lang } : {}),
                  ...(title != null ? { 'data-title': title } : {}),
                  ...(showLineNumbers ? { 'data-show-line-numbers': '' } : {}),
                };
              }),
            );
          }
        }
        walk(child);
      }
    };

    walk(tree);
    await Promise.all(tasks);
  };
}
