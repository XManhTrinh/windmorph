/**
 * The small Markdown subset the library's JSDoc uses, parsed into nodes the props lists
 * render: code spans (`` `standard` ``), TSDoc references (`{@link Badge}`), links
 * (`[text](url)`), strong (`**text**`) and emphasis (`*text*`, `_text_`), with backslash
 * escapes. Soft line breaks read as spaces and a blank line starts a new paragraph. Anything
 * else stays plain text, so an unclosed marker is shown as written.
 */

export type InlineNode =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  /** A TSDoc `{@link Name}` (or `{@link Name | label}`): a code name, linked when known. */
  | { kind: 'ref'; name: string; label?: string }
  | { kind: 'link'; href: string; children: InlineNode[] }
  | { kind: 'strong'; children: InlineNode[] }
  | { kind: 'em'; children: InlineNode[] };

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!|<>~]/;

/** Link targets that are safe to render: the web, mail, and the site's own paths. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|\/(?!\/)|#|\.{1,2}\/)/i;

/** A description's paragraphs: split on blank lines, each with its line breaks as spaces. */
export function markdownParagraphs(text: string): string[] {
  return text
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter((paragraph) => paragraph !== '');
}

/** The length of the run of `char` starting at `at`. */
function runLength(text: string, at: number, char: string): number {
  let end = at;
  while (text[end] === char) end++;
  return end - at;
}

/** Where the code span opened by the backtick run at `at` closes, or -1. */
function codeSpanEnd(text: string, at: number): { contentEnd: number; end: number } | null {
  const open = runLength(text, at, '`');
  let index = at + open;
  while (index < text.length) {
    const next = text.indexOf('`', index);
    if (next < 0) return null;
    const run = runLength(text, next, '`');
    if (run === open) return { contentEnd: next, end: next + run };
    index = next + run;
  }
  return null;
}

/** Whether a character is a letter, digit or underscore (intraword for `_`). */
function isWordChar(char: string | undefined): boolean {
  return char !== undefined && /[\p{L}\p{N}_]/u.test(char);
}

function isSpace(char: string | undefined): boolean {
  return char === undefined || /\s/.test(char);
}

/**
 * Where the delimiter `marker` opened at `from` closes: the next `marker` that is preceded by
 * a non-space and isn't part of a longer run, skipping code spans and escapes. -1 if none.
 */
function closingDelimiter(text: string, from: number, marker: string): number {
  let index = from;
  while (index < text.length) {
    const char = text[index];
    if (char === '\\' && ESCAPABLE.test(text[index + 1] ?? '')) {
      index += 2;
      continue;
    }
    if (char === '`') {
      const span = codeSpanEnd(text, index);
      index = span ? span.end : index + runLength(text, index, '`');
      continue;
    }
    if (text.startsWith(marker, index)) {
      const run = runLength(text, index, marker[0]!);
      const before = text[index - 1];
      const after = text[index + run];
      const fits =
        run === marker.length &&
        !isSpace(before) &&
        // `_` never closes inside a word (`snake_case`).
        !(marker === '_' && isWordChar(after));
      if (fits && index > from) return index;
      index += run;
      continue;
    }
    index++;
  }
  return -1;
}

/** The `]` matching the `[` at `at`, skipping code spans, escapes and nested brackets. */
function closingBracket(text: string, at: number): number {
  let depth = 0;
  let index = at;
  while (index < text.length) {
    const char = text[index];
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (char === '`') {
      const span = codeSpanEnd(text, index);
      index = span ? span.end : index + runLength(text, index, '`');
      continue;
    }
    if (char === '[') depth++;
    if (char === ']' && --depth === 0) return index;
    index++;
  }
  return -1;
}

/** Appends text, merging it into a preceding text node. */
function pushText(nodes: InlineNode[], text: string): void {
  if (!text) return;
  const last = nodes[nodes.length - 1];
  if (last?.kind === 'text') last.text += text;
  else nodes.push({ kind: 'text', text });
}

/** A `{@link …}` tag's target and optional label (`Name`, `Name | label`, `Name label`). */
function parseLinkTag(body: string): { name: string; label?: string } | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const pipe = trimmed.indexOf('|');
  const [name, label] =
    pipe >= 0
      ? [trimmed.slice(0, pipe).trim(), trimmed.slice(pipe + 1).trim()]
      : [trimmed.split(/\s+/)[0]!, trimmed.split(/\s+/).slice(1).join(' ')];
  if (!name) return null;
  return label ? { name, label } : { name };
}

/** Parses one paragraph of inline Markdown (line breaks are read as spaces). */
export function parseInlineMarkdown(source: string): InlineNode[] {
  const text = source.replace(/\s*\n\s*/g, ' ');
  const nodes: InlineNode[] = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index]!;

    if (char === '\\' && ESCAPABLE.test(text[index + 1] ?? '')) {
      pushText(nodes, text[index + 1]!);
      index += 2;
      continue;
    }

    if (char === '`') {
      const span = codeSpanEnd(text, index);
      const open = runLength(text, index, '`');
      if (!span) {
        pushText(nodes, text.slice(index, index + open));
        index += open;
        continue;
      }
      let code = text.slice(index + open, span.contentEnd);
      // CommonMark: one space on both sides is padding (it lets a span hold a backtick).
      if (code.length > 2 && code.startsWith(' ') && code.endsWith(' ') && code.trim() !== '') {
        code = code.slice(1, -1);
      }
      nodes.push({ kind: 'code', text: code });
      index = span.end;
      continue;
    }

    if (text.startsWith('{@link', index) && /[\s}]/.test(text[index + 6] ?? '')) {
      const end = text.indexOf('}', index);
      const tag = end >= 0 ? parseLinkTag(text.slice(index + 6, end)) : null;
      if (tag) {
        nodes.push({ kind: 'ref', ...tag });
        index = end + 1;
        continue;
      }
    }

    if (char === '[') {
      const close = closingBracket(text, index);
      if (close > index && text[close + 1] === '(') {
        const end = text.indexOf(')', close + 2);
        const href = end >= 0 ? text.slice(close + 2, end).trim() : '';
        if (end >= 0 && href && !/\s/.test(href)) {
          const children = parseInlineMarkdown(text.slice(index + 1, close));
          // An unsafe target (`javascript:`) keeps its words and loses the link.
          if (SAFE_HREF.test(href)) nodes.push({ kind: 'link', href, children });
          else for (const child of children) nodes.push(child);
          index = end + 1;
          continue;
        }
      }
    }

    if (char === '*' || char === '_') {
      const run = runLength(text, index, char);
      const marker = run >= 2 ? char.repeat(2) : char;
      const before = text[index - 1];
      const after = text[index + marker.length];
      const opens =
        run <= 2 &&
        !isSpace(after) &&
        // `_` never opens inside a word (`snake_case`).
        !(char === '_' && isWordChar(before));
      if (opens) {
        const close = closingDelimiter(text, index + marker.length, marker);
        if (close > 0) {
          const children = parseInlineMarkdown(text.slice(index + marker.length, close));
          nodes.push(marker.length === 2 ? { kind: 'strong', children } : { kind: 'em', children });
          index = close + marker.length;
          continue;
        }
      }
      pushText(nodes, text.slice(index, index + run));
      index += run;
      continue;
    }

    pushText(nodes, char);
    index++;
  }
  return nodes;
}
