import { describe, expect, it } from 'vitest';
import { changedLines, linesMarkup } from './code-diff';

describe('changedLines', () => {
  it('marks only an added prop', () => {
    const before = '<Button\n  size="sm"\n>\n  Send\n</Button>';
    const after = '<Button\n  variant="outlined"\n  size="sm"\n>\n  Send\n</Button>';
    expect(changedLines(before, after)).toEqual([1]);
  });

  it('marks an edited line and nothing around it', () => {
    expect(changedLines('a\nb\nc', 'a\nB\nc')).toEqual([1]);
  });

  it('marks nothing when a line is only removed', () => {
    expect(changedLines('a\nb\nc', 'a\nc')).toEqual([]);
  });

  it('marks every line of a new snippet', () => {
    expect(changedLines('', 'a\nb')).toEqual([0, 1]);
  });
});

describe('linesMarkup', () => {
  it('writes one escaped line each, marking the changed ones', () => {
    expect(linesMarkup('<A b="1" />\n\n&', [0])).toBe(
      '<span class="line" data-changed="">&lt;A b=&quot;1&quot; /&gt;</span>' +
        '<span class="line"> </span><span class="line">&amp;</span>',
    );
  });

  it('drops the trailing newline', () => {
    expect(linesMarkup('a\n', [])).toBe('<span class="line">a</span>');
  });
});
