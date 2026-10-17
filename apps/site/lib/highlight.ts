import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';

/**
 * Shiki's CSS-variables theme. It emits `color:var(--shiki-token-…)` references on the
 * token spans instead of literal colours; `CodeBlock` binds those `--shiki-*` custom
 * properties to the library's semantic colour roles, so a single build-time highlight
 * follows every theme, mode and contrast level.
 */
const theme = createCssVariablesTheme({
  name: 'windmorph',
  variablePrefix: '--shiki-',
  fontStyle: true,
});

const LANGUAGES = ['tsx', 'ts', 'jsx', 'js', 'bash', 'css', 'json', 'html'] as const;

let instance: Promise<Highlighter> | undefined;

function highlighter(): Promise<Highlighter> {
  instance ??= createHighlighter({ themes: [theme], langs: [...LANGUAGES] });
  return instance;
}

/**
 * Strips Shiki's outer `<pre class="shiki" style="…"><code>…</code></pre>` wrapper down to
 * the inner `<code>` children — the token-span markup `CodeBlock` renders inside its own
 * `<pre><code>`. Verified against shiki 4.5.0: `codeToHtml` emits exactly one `<code>…</code>`,
 * so a slice between the first `>` after `<code` and the last `</code>` is sufficient and
 * avoids a DOM/HTML parser at build time. The discarded `<pre>` wrapper's
 * `--shiki-background`/`--shiki-foreground` inline style is intentionally dropped — those
 * properties are declared on the `CodeBlock` root instead.
 */
export function extractCodeInner(html: string): string {
  const open = html.indexOf('<code');
  const start = open === -1 ? -1 : html.indexOf('>', open);
  const end = html.lastIndexOf('</code>');
  return open === -1 || start === -1 || end === -1 ? html : html.slice(start + 1, end);
}

/** Returns the inner `<code>` markup (token spans) for a fenced block or example file. */
export async function highlightSource(code: string, lang = 'tsx'): Promise<string> {
  const hl = await highlighter();
  const supported = hl.getLoadedLanguages().includes(lang) ? lang : 'txt';
  const html = hl.codeToHtml(code, { lang: supported, theme: 'windmorph' });
  return extractCodeInner(html);
}
