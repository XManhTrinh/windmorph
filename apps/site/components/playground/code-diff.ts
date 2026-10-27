/**
 * The lines of `after` that are new or changed since `before` (0-based): every line outside
 * the longest common run of lines the two share, so a prop added, removed from the middle or
 * edited marks just its own line, and the lines around it stay unmarked.
 */
export function changedLines(before: string, after: string): number[] {
  const a = before.split('\n');
  const b = after.split('\n');
  // lcs[i][j]: the longest common subsequence of a[i..] and b[j..].
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i]![j] =
        a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const changed: number[] = [];
  let i = 0;
  let j = 0;
  while (j < b.length) {
    if (i < a.length && a[i] === b[j]) {
      i++;
      j++;
    } else if (i < a.length && lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      i++;
    } else {
      changed.push(j);
      j++;
    }
  }
  return changed;
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/**
 * A snippet as one block element per line for the code block, the `changed` ones marked with
 * `data-changed`. The text is escaped, so the markup holds nothing but these lines.
 */
export function linesMarkup(code: string, changed: readonly number[]): string {
  const marked = new Set(changed);
  return code
    .replace(/\n$/, '')
    .split('\n')
    .map((line, index) => {
      const text = line.replace(/[&<>"]/g, (char) => ESCAPES[char]!);
      // An empty line still takes a line's height.
      return `<span class="line"${marked.has(index) ? ' data-changed=""' : ''}>${text || ' '}</span>`;
    })
    .join('');
}
