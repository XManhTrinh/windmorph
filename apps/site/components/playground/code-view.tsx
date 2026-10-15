'use client';

import { Button, IconButton } from '@windmorph/react';
import { CodeBlock } from '@windmorph/react-pro';
import { useEffect, useId, useRef, useState } from 'react';
import { ContentCopyIcon, ExpandMoreIcon } from '../icons';
import { CHEVRON } from '../prop-list-controls';
import { useCopy } from '../site-snackbar';
import { changedLines, linesMarkup } from './code-diff';

/** A snippet longer than this folds on a narrow playground, behind "Show all". */
export const FOLDED_LINES = 12;

/** Whether the code scrolls sideways and isn't at its end: the fade shows what's hidden. */
function useMoreToTheRight() {
  const root = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const pre = root.current?.querySelector('pre');
    if (!pre) return;
    const measure = () => setMore(pre.scrollLeft + pre.clientWidth < pre.scrollWidth - 1);
    measure();
    pre.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(pre);
    if (pre.firstElementChild) observer.observe(pre.firstElementChild);
    return () => {
      pre.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, []);
  return { root, more };
}

/**
 * The playground's code: a "Code" subhead with the copy button (the site snackbar confirms),
 * then the snippet in a code block. The lines a control just changed are marked: they flash
 * and fade (a static marker under reduced motion) without moving anything. Long lines scroll
 * sideways in a focusable region, with a fade at the edge while there's more. On a narrow
 * playground a long snippet folds to its first lines behind "Show all"; a wide one fits its
 * column and scrolls inside it.
 */
export function CodeView({ code, markChanges }: { code: string; markChanges: boolean }) {
  const copy = useCopy();
  const foldId = useId();
  const [open, setOpen] = useState(false);
  // The changed lines are worked out when the code changes, against the code shown before.
  const [shown, setShown] = useState({ code, changed: [] as number[] });
  if (shown.code !== code) {
    setShown({ code, changed: markChanges ? changedLines(shown.code, code) : [] });
  }
  const { root, more } = useMoreToTheRight();
  const lineCount = code.replace(/\n$/, '').split('\n').length;
  const foldable = lineCount > FOLDED_LINES;
  const folded = foldable && !open;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-title-small text-on-surface-variant">Code</h3>
        <IconButton
          size="sm"
          variant="standard"
          icon={<ContentCopyIcon />}
          aria-label="Copy code"
          onPress={() => void copy(code)}
        />
      </div>
      <div ref={root} id={foldId} className="relative flex min-h-0 flex-1 flex-col">
        <CodeBlock
          code={code}
          html={linesMarkup(code, shown.changed)}
          lang="tsx"
          copyable={false}
          className="min-h-0 flex-1"
          classNames={{
            pre: `playground-code min-h-0 flex-1 overflow-auto ${
              folded
                ? // 12 lines of body-medium (20px) plus the block's padding, on a narrow layout.
                  '@max-[639px]/playground:max-h-[272px] @max-[639px]/playground:overflow-y-hidden'
                : ''
            }`,
            code: 'block w-max min-w-full',
          }}
        />
        {/* What's past the right edge fades out; the code always reads left to right. */}
        <div
          aria-hidden="true"
          data-fade={more || undefined}
          className="pointer-events-none absolute inset-y-px right-px w-10 rounded-e-corner-medium bg-linear-to-l from-surface-container to-transparent opacity-0 transition-opacity data-fade:opacity-100 motion-reduce:transition-none"
        />
        {folded && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-px bottom-px h-12 rounded-b-corner-medium bg-linear-to-t from-surface-container to-transparent @min-[640px]/playground:hidden"
          />
        )}
      </div>
      {foldable && (
        <div className="@min-[640px]/playground:hidden">
          <Button
            variant="text"
            size="sm"
            leadingIcon={<ExpandMoreIcon />}
            aria-expanded={open}
            aria-controls={foldId}
            onPress={() => setOpen((value) => !value)}
            className={`-ms-3 ${CHEVRON}`}
          >
            {open ? 'Show less' : `Show all ${lineCount} lines`}
          </Button>
        </div>
      )}
    </div>
  );
}
