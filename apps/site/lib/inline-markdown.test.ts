import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { markdownParagraphs, parseInlineMarkdown, type InlineNode } from './inline-markdown';

const text = (value: string): InlineNode => ({ kind: 'text', text: value });
const code = (value: string): InlineNode => ({ kind: 'code', text: value });

describe('parseInlineMarkdown', () => {
  it('reads code spans, keeping their content as written', () => {
    expect(parseInlineMarkdown('`standard` spaces the buttons; `a*b_c`')).toEqual([
      code('standard'),
      text(' spaces the buttons; '),
      code('a*b_c'),
    ]);
  });

  it('reads a double-backtick span that holds a backtick, minus its padding', () => {
    expect(parseInlineMarkdown('Use `` `x` `` here')).toEqual([
      text('Use '),
      code('`x`'),
      text(' here'),
    ]);
  });

  it('leaves an unclosed backtick as text', () => {
    expect(parseInlineMarkdown('a ` b')).toEqual([text('a ` b')]);
  });

  it('reads TSDoc references, with or without a label', () => {
    expect(parseInlineMarkdown('See {@link Badge } and {@link Snackbar | the snackbar}.')).toEqual([
      text('See '),
      { kind: 'ref', name: 'Badge' },
      text(' and '),
      { kind: 'ref', name: 'Snackbar', label: 'the snackbar' },
      text('.'),
    ]);
  });

  it('reads links, with Markdown inside their text', () => {
    expect(parseInlineMarkdown('Read [the `Tabs` guide](/components/tabs).')).toEqual([
      text('Read '),
      {
        kind: 'link',
        href: '/components/tabs',
        children: [text('the '), code('Tabs'), text(' guide')],
      },
      text('.'),
    ]);
  });

  it('drops an unsafe link target and keeps its words', () => {
    expect(parseInlineMarkdown('[click](javascript:void)')).toEqual([text('click')]);
  });

  it('leaves brackets that are not a link alone', () => {
    expect(parseInlineMarkdown("Accepts ['image/jpeg', '.pdf'] or [2-9A-H]")).toEqual([
      text("Accepts ['image/jpeg', '.pdf'] or [2-9A-H]"),
    ]);
  });

  it('reads strong and emphasis, with code inside', () => {
    expect(
      parseInlineMarkdown('**Not recommended – use `onPress` instead.** *Really* _now_'),
    ).toEqual([
      {
        kind: 'strong',
        children: [text('Not recommended – use '), code('onPress'), text(' instead.')],
      },
      text(' '),
      { kind: 'em', children: [text('Really')] },
      text(' '),
      { kind: 'em', children: [text('now')] },
    ]);
  });

  it('never reads an asterisk or underscore inside a word or beside a space as emphasis', () => {
    expect(parseInlineMarkdown('snake_case_name and 2 * 3 * 4')).toEqual([
      text('snake_case_name and 2 * 3 * 4'),
    ]);
  });

  it('does not close emphasis inside a code span', () => {
    expect(parseInlineMarkdown('*a `b*` c*')).toEqual([
      { kind: 'em', children: [text('a '), code('b*'), text(' c')] },
    ]);
  });

  it('reads backslash escapes as the character', () => {
    expect(parseInlineMarkdown('\\*literal\\* and \\`tick\\`')).toEqual([
      text('*literal* and `tick`'),
    ]);
  });

  it('reads a line break as a space', () => {
    expect(parseInlineMarkdown('one\ntwo')).toEqual([text('one two')]);
  });
});

describe('markdownParagraphs', () => {
  it('splits on blank lines and joins the lines of each', () => {
    expect(markdownParagraphs('First line\nstill first.\n\n  Second.\n')).toEqual([
      'First line still first.',
      'Second.',
    ]);
  });
});

describe('the generated descriptions', () => {
  it('use only the syntax the parser reads', () => {
    // Everything outside code spans that looks like Markdown or HTML the parser leaves as text.
    const dir = resolve(process.cwd(), '.generated/props');
    const unread: string[] = [];
    const visit = (records: { description?: string; keys?: unknown[] }[] | undefined) => {
      for (const record of records ?? []) {
        const outside = (record.description ?? '').replace(/`[^`]*`/g, '');
        if (/<[a-z][^>]*>|^#+\s|^\s*[-*]\s|!\[/m.test(outside)) unread.push(outside);
        visit(record.keys as typeof records);
      }
    };
    for (const file of readdirSync(dir)) {
      const json = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as {
        props?: { description?: string }[];
        params?: { description?: string }[];
      };
      visit(json.props);
      visit(json.params);
    }
    expect(unread).toEqual([]);
  });
});
