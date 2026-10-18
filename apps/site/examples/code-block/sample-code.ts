/*
 * A short source file and its highlighted markup, as an app's build produces them with Shiki's
 * CSS-variables theme (`createCssVariablesTheme`). Use your own: highlight at build time and
 * pass the inner `<code>` markup as `html`.
 */

/** The raw source: what the copy button copies. */
export const SAMPLE_SOURCE = `export function greet(name: string) {
  return \`Hello, \${name}!\`;
}`;

/** Its build-time highlight: one `.line` span per line, colours as `--shiki-*` variables. */
export const SAMPLE_HTML =
  '<span class="line"><span style="color:var(--shiki-token-keyword)">export</span><span style="color:var(--shiki-token-keyword)"> function</span><span style="color:var(--shiki-token-function)"> greet</span><span style="color:var(--shiki-foreground)">(name</span><span style="color:var(--shiki-token-keyword)">:</span><span style="color:var(--shiki-token-constant)"> string</span><span style="color:var(--shiki-foreground)">) {</span></span>\n' +
  '<span class="line"><span style="color:var(--shiki-token-keyword)">  return</span><span style="color:var(--shiki-token-string-expression)"> `Hello, </span><span style="color:var(--shiki-token-keyword)">${</span><span style="color:var(--shiki-foreground)">name</span><span style="color:var(--shiki-token-keyword)">}</span><span style="color:var(--shiki-token-string-expression)">!`</span><span style="color:var(--shiki-foreground)">;</span></span>\n' +
  '<span class="line"><span style="color:var(--shiki-foreground)">}</span></span>';
